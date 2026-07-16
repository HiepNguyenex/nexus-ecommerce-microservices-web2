import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cartAPI, orderAPI, couponAPI, authAPI, paymentAPI, productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import { 
  FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiLock, 
  FiShoppingCart, FiX, FiCheck, FiMapPin, FiPhone, 
  FiMail, FiUser, FiCreditCard 
} from 'react-icons/fi';

const BACKUP_IMAGES = {
  1: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=200&auto=format&fit=crop&q=60",
  2: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=200&auto=format&fit=crop&q=60",
  3: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=200&auto=format&fit=crop&q=60",
  4: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=200&auto=format&fit=crop&q=60",
  5: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&auto=format&fit=crop&q=60",
  6: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=200&auto=format&fit=crop&q=60",
  7: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=200&auto=format&fit=crop&q=60",
  8: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200&auto=format&fit=crop&q=60"
};
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&auto=format&fit=crop&q=60";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoError, setPromoError] = useState('');
  
  // Checkout & VietQR States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    paymentMethod: 'COD'
  });
  const [addressBook, setAddressBook] = useState([]);

  // Voucher Selector States
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      loadCart();
      loadUserAddress();
      
      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get('status') === 'cancel') {
        showToast('Thanh toán qua Stripe đã bị hủy.', 'warning');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserAddress = async () => {
    try {
      const book = JSON.parse(localStorage.getItem('address_book') || '[]');
      setAddressBook(book);
      const data = await authAPI.getUser(user.id);
      if (data && data.userDetails) {
        const ud = data.userDetails;
        setShippingForm({
          fullName: `${ud.firstName || ''} ${ud.lastName || ''}`.trim() || user.username,
          phone: ud.phoneNumber || '',
          email: ud.email || '',
          address: ud.street || '',
          paymentMethod: 'COD'
        });
      } else {
        setShippingForm({
          fullName: localStorage.getItem('profile_fullName') || user.username || '',
          phone: localStorage.getItem('profile_phone') || '',
          email: localStorage.getItem('profile_email') || '',
          address: localStorage.getItem('profile_address') || '',
          paymentMethod: 'COD'
        });
      }
    } catch {
      setShippingForm({
        fullName: localStorage.getItem('profile_fullName') || user.username || '',
        phone: localStorage.getItem('profile_phone') || '',
        email: localStorage.getItem('profile_email') || '',
        address: localStorage.getItem('profile_address') || '',
        paymentMethod: 'COD'
      });
    }
  };

  const loadCart = async () => {
    try {
      const data = await cartAPI.getCart();
      const rawItems = data?.items || data || [];
      // Lọc bỏ các sản phẩm fallback (circuit breaker placeholder) có giá = 0 hoặc tên mặc định
      const validItems = rawItems.filter(item => 
        item.product?.price > 0 && 
        item.product?.productName !== 'Sản phẩm tạm thời không khả dụng'
      );
      if (rawItems.length !== validItems.length) {
        // Tự động xóa các item lỗi khỏi Redis trong background
        const invalidItems = rawItems.filter(item => 
          !item.product?.price || item.product?.price === 0 ||
          item.product?.productName === 'Sản phẩm tạm thời không khả dụng'
        );
        for (const bad of invalidItems) {
          const prodId = bad.product?.productId || bad.product?.id;
          if (prodId) {
            try { await cartAPI.removeItem(prodId, bad.selectedSize || '100ml'); } catch {}
          }
        }
        showToast(`Đã tự động xóa ${rawItems.length - validItems.length} sản phẩm lỗi khỏi giỏ hàng.`, 'warning');
      }
      
      // Enrich items with catalog images
      try {
        const catalogProducts = await productAPI.getAll();
        const allProds = Array.isArray(catalogProducts) ? catalogProducts : catalogProducts?.content || [];
        const enrichedItems = validItems.map(item => {
          const targetId = item.product?.productId || item.product?.id;
          let fullProd = allProds.find(p => p.id === targetId);
          if (!fullProd && item.product?.productName) {
            fullProd = allProds.find(p => p.productName?.toLowerCase() === item.product.productName.toLowerCase());
          }
          if (fullProd) {
            return {
              ...item,
              product: {
                ...item.product,
                ...fullProd
              }
            };
          }
          return item;
        });
        setCartItems(enrichedItems);
      } catch (err) {
        console.error("Failed to enrich cart items", err);
        setCartItems(validItems);
      }
    } catch (error) { 
      if (error.response?.status === 404) {
        setCartItems([]);
      } else {
        showToast('Không thể tải thông tin giỏ hàng.', 'error'); 
      }
    } finally { 
      setLoading(false); 
    }
  };

  const loadActiveVouchers = async () => {
    setLoadingVouchers(true);
    try {
      const data = await couponAPI.getActive();
      setVouchers(data || []);
    } catch { 
      showToast('Không thể tải danh sách mã giảm giá.', 'error'); 
    } finally { 
      setLoadingVouchers(false); 
    }
  };

  const updateQuantity = async (item, newQty) => {
    if (newQty < 1) return;
    const prodId = item.product?.productId || item.product?.id;
    if (!prodId) return;
    try {
      // addItem handles both add and update via checkIfItemIsExist in backend
      await cartAPI.addItem(prodId, newQty, item.selectedSize || '100ml');
      setCartItems(prev => prev.map(it => 
        (it.product?.id || it.product?.productId) === prodId && it.selectedSize === item.selectedSize
          ? { ...it, quantity: newQty, subTotal: (it.product?.price || 0) * newQty } 
          : it
      ));
    } catch { showToast('Không thể cập nhật số lượng.', 'error'); }
  };

  const removeItem = async (item) => {
    const prodId = item.product?.productId || item.product?.id;
    if (!prodId) return;
    try {
      await cartAPI.removeItem(prodId, item.selectedSize || '100ml');
      setCartItems(prev => prev.filter(it => 
        !((it.product?.id || it.product?.productId) === prodId && it.selectedSize === item.selectedSize)
      ));
      showToast('Đã xóa sản phẩm khỏi giỏ hàng.');
    } catch { showToast('Không thể xóa sản phẩm.', 'error'); }
  };

  const applyPromo = async () => {
    setPromoError('');
    if (!promoCode.trim()) return;
    try {
      const res = await couponAPI.validate(promoCode.trim());
      setDiscountPercent(res.discountPercent);
      setAppliedPromo(res.code);
      showToast(`Đã áp dụng mã giảm giá ${res.discountPercent}%`);
    } catch (err) {
      setPromoError(err.response?.data?.error || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.');
      setDiscountPercent(0); setAppliedPromo('');
    }
  };

  const removePromo = () => { setPromoCode(''); setDiscountPercent(0); setAppliedPromo(''); setPromoError(''); };

  const handleSelectVoucher = async (code) => {
    setIsVoucherModalOpen(false);
    setPromoCode(code);
    setPromoError('');
    try {
      const res = await couponAPI.validate(code);
      setDiscountPercent(res.discountPercent);
      setAppliedPromo(res.code);
      showToast(`Đã áp dụng mã giảm giá ${res.discountPercent}%`);
    } catch (err) {
      setPromoError(err.response?.data?.error || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.');
      setDiscountPercent(0); setAppliedPromo('');
    }
  };

  const placeOrder = async () => {
    if (!user?.id) { showToast('Vui lòng đăng nhập để đặt hàng.', 'warning'); return; }
    setOrdering(true);
    try {
      const res = await orderAPI.createOrder(user.id, appliedPromo, shippingForm);
      showToast('Đặt hàng thành công!');
      setCartItems([]); 
      setAppliedPromo(''); 
      setPromoCode(''); 
      setDiscountPercent(0);
      setIsCheckoutOpen(false);
      
      if (shippingForm.paymentMethod === 'BANK_TRANSFER') {
        setCurrentOrder(res);
        setShowQRModal(true);
      } else if (shippingForm.paymentMethod === 'STRIPE') {
        showToast('Đang chuyển hướng đến trang thanh toán Stripe...');
        const successUrl = `${window.location.origin}/profile?status=success`;
        const cancelUrl = `${window.location.origin}/cart?status=cancel`;
        const stripeRes = await paymentAPI.createStripeSession(res.id, res.total, successUrl, cancelUrl);
        if (stripeRes && stripeRes.checkoutUrl) {
          window.location.href = stripeRes.checkoutUrl;
        } else {
          showToast('Không lấy được URL thanh toán Stripe.', 'error');
        }
      }
    } catch { 
      showToast('Không thể đặt hàng. Vui lòng thử lại.', 'error'); 
    } finally { 
      setOrdering(false); 
    }
  };

  // Fix: dùng subTotal từ backend (đã tính đúng theo variant price đã chọn)
  const total = cartItems.reduce((sum, item) => sum + (item.subTotal || (item.product?.price || 0) * (item.quantity || 1)), 0);
  const discountAmount = total * (discountPercent / 100);
  const finalTotal = total - discountAmount;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0C0B09] bg-grid">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-40 gap-4">
          <div className="w-16 h-16 rounded-full bg-[#C9973D]/10 border border-[#C9973D]/20 flex items-center justify-center">
            <FiLock className="text-[#C9973D] text-2xl" />
          </div>
          <h2 className="font-display text-2xl font-light text-[#EDE8DF]">Quyền truy cập được bảo mật</h2>
          <p className="text-xs text-[#9A9080] uppercase tracking-wider font-mono">Đăng nhập để xem giỏ hàng cá nhân</p>
          <Link to="/login" className="px-6 py-3 rounded-full bg-[#C9973D] text-[#0C0B09] text-xs font-mono uppercase tracking-wider hover:bg-[#DDB05A] transition-all">
            ĐĂNG NHẬP NGAY
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0B09] bg-grid pb-20 text-[#EDE8DF]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 border-b border-[#C9973D]/12 pb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9973D]/60 block mb-1">Túi mua sắm của bạn</span>
            <h1 className="font-display text-3xl font-light text-[#EDE8DF]">Giỏ Hàng Mùi Hương</h1>
          </div>
          <Link to="/" className="text-xs uppercase font-mono tracking-wider text-[#9A9080] hover:text-[#C9973D] flex items-center gap-2 transition-all">
            <FiArrowLeft /> TIẾP TỤC CHỌN MÙI HƯƠNG
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-24 animate-shimmer w-full rounded-xl" />
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-24 border border-[#C9973D]/12 bg-[#161510]/50 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-[#C9973D]/10 border border-[#C9973D]/15 flex items-center justify-center mx-auto mb-4">
              <FiShoppingCart className="text-[#C9973D] text-2xl" />
            </div>
            <h3 className="font-display text-xl font-light text-[#EDE8DF] mb-2">Giỏ hàng trống</h3>
            <p className="text-xs text-[#5C5850] font-mono uppercase tracking-wider mb-6">Bạn chưa chọn chai nước hoa nào.</p>
            <Link to="/" className="px-6 py-3 rounded-full bg-[#C9973D] text-[#0C0B09] text-xs font-mono uppercase tracking-wider hover:bg-[#DDB05A] transition-all">
              KHÁM PHÁ MÙI HƯƠNG
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

            {/* Left: Cart items */}
            <div className="lg:col-span-2 border-t border-[#C9973D]/12">
              {cartItems.map((item, idx) => (
                <div key={item.id || idx}
                  className="py-6 border-b border-[#C9973D]/10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <img
                    src={item.product?.imageUrl || BACKUP_IMAGES[item.product?.id || item.product?.productId] || DEFAULT_IMAGE}
                    alt={item.product?.productName}
                    className="w-16 h-16 object-cover rounded-lg border border-[#C9973D]/15 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base text-[#EDE8DF] truncate">{item.product?.productName || 'Sản phẩm nước hoa'}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {item.selectedSize && (
                        <span className="px-2 py-0.5 rounded bg-[#C9973D]/15 border border-[#C9973D]/20 text-[#C9973D] text-[9px] font-mono uppercase tracking-wider">
                          Dung tích: {item.selectedSize}
                        </span>
                      )}
                      <span className="text-xs font-mono text-[#9A9080]">Đơn giá: ${(item.product?.price || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center border border-[#C9973D]/20 rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(item, (item.quantity || 1) - 1)}
                      className="w-8 h-8 flex items-center justify-center text-[#9A9080] hover:text-[#C9973D] hover:bg-[#C9973D]/10 transition-all">
                      <FiMinus className="text-[10px]" />
                    </button>
                    <span className="w-8 text-center text-xs font-mono text-[#EDE8DF]">{item.quantity || 1}</span>
                    <button onClick={() => updateQuantity(item, (item.quantity || 1) + 1)}
                      className="w-8 h-8 flex items-center justify-center text-[#9A9080] hover:text-[#C9973D] hover:bg-[#C9973D]/10 transition-all">
                      <FiPlus className="text-[10px]" />
                    </button>
                  </div>

                  <div className="text-right min-w-[80px] font-semibold text-[#EDE8DF] text-sm font-mono">
                    ${((item.product?.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </div>

                  <button onClick={() => removeItem(item)}
                    className="p-2 text-[#9A9080] hover:text-rose-400 transition-all" title="Xóa khỏi giỏ">
                    <FiTrash2 className="text-sm" />
                  </button>
                </div>
              ))}
            </div>

            {/* Right: Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#161510] border border-[#C9973D]/15 rounded-2xl p-6 sticky top-28 space-y-6">
                <div>
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9973D]/60 mb-5">Tóm tắt đơn hàng</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-[#9A9080]">
                      <span>Tạm tính</span>
                      <span className="font-mono">${total.toFixed(2)}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-[#6B9E78]">
                        <span>Mã ({appliedPromo})</span>
                        <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#9A9080]">
                      <span>Vận chuyển</span>
                      <span className="font-mono text-[#6B9E78] text-[10px] uppercase tracking-wider">MIỄN PHÍ</span>
                    </div>
                    <div className="border-t border-[#C9973D]/12 pt-3 flex justify-between text-base font-medium">
                      <span className="text-[#EDE8DF]">Tổng cộng</span>
                      <span className="font-mono text-lg font-semibold text-[#C9973D]">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Promo */}
                <div className="border-t border-[#C9973D]/10 pt-5">
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#5C5850] mb-3">Mã giảm giá</h4>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-3.5 bg-[#6B9E78]/10 rounded-xl border border-[#6B9E78]/25">
                      <div>
                        <span className="block text-[11px] font-semibold text-[#6B9E78]">ĐÃ ÁP DỤNG: {appliedPromo}</span>
                        {discountPercent > 0 && <span className="text-[10px] text-[#6B9E78]/80 font-mono">Giảm {discountPercent}% trên tổng đơn</span>}
                      </div>
                      <button onClick={removePromo} className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors">Gỡ bỏ</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-grow px-3 py-2 text-xs rounded-lg border border-[#C9973D]/20 bg-[#0C0B09] text-[#EDE8DF] placeholder-[#5C5850] focus:outline-none focus:border-[#C9973D]/50 font-mono transition-all"
                          placeholder="Nhập mã (Ví dụ: PERFUME10)"
                        />
                        <button onClick={applyPromo}
                          className="px-4 py-2 bg-[#C9973D]/15 border border-[#C9973D]/30 text-[#C9973D] hover:bg-[#C9973D] hover:text-[#0C0B09] rounded-lg text-xs font-mono transition-all">
                          ÁP DỤNG
                        </button>
                      </div>
                      {promoError && <p className="text-[10px] text-rose-400">{promoError}</p>}
                      <button 
                        type="button"
                        onClick={() => { loadActiveVouchers(); setIsVoucherModalOpen(true); }}
                        className="w-full py-2 bg-[#C9973D]/10 border border-dashed border-[#C9973D]/30 text-[#C9973D] hover:bg-[#C9973D]/15 rounded-lg text-xs font-mono transition-all mt-1 flex items-center justify-center gap-1.5"
                      >
                        🎟️ CHỌN MÃ GIẢM GIÁ KHÁC
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(true)} disabled={ordering || cartItems.length === 0}
                  className="w-full py-4 rounded-full bg-[#C9973D] text-[#0C0B09] hover:bg-[#DDB05A] transition-all text-xs font-mono uppercase tracking-[0.25em] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center shadow-[0_0_20px_rgba(201,151,61,0.2)] font-semibold">
                  TIẾN HÀNH ĐẶT HÀNG
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Checkout Modal ── */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#161510] border border-[#C9973D]/25 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 text-[#EDE8DF] relative">
            <button 
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 text-[#9A9080] hover:text-[#C9973D] p-1.5 rounded-full hover:bg-[#C9973D]/10 transition-all"
            >
              <FiX className="text-xl" />
            </button>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9973D]/60 block mb-1">Quy trình Checkout</span>
              <h2 className="font-display text-2xl font-light">Thông Tin Giao Hàng & Thanh Toán</h2>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); placeOrder(); }} className="space-y-4">
              {addressBook.length > 0 && (
                <div className="space-y-2 pb-2 border-b border-[#C9973D]/08">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9A9080]">
                    Chọn địa chỉ nhận hàng đã lưu
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {addressBook.map((addr) => {
                      const isSelected = shippingForm.fullName === addr.fullName && 
                                         shippingForm.phone === addr.phone && 
                                         shippingForm.address === addr.address;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => setShippingForm({
                            ...shippingForm,
                            fullName: addr.fullName,
                            phone: addr.phone,
                            address: addr.address
                          })}
                          className={`p-3 rounded-xl border text-left transition-all active:scale-[0.98] flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#C9973D] bg-[#C9973D]/08 shadow-[0_0_12px_rgba(201,151,61,0.1)]'
                              : 'border-[#C9973D]/15 bg-[#161510]/50 hover:border-[#C9973D]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded border uppercase font-semibold ${
                              isSelected ? 'bg-[#C9973D] text-[#0C0B09] border-[#C9973D]' : 'bg-[#0C0B09] text-[#9A9080] border-[#C9973D]/25'
                            }`}>
                              {addr.label}
                            </span>
                            {isSelected && (
                              <span className="text-[9px] font-mono text-[#C9973D] font-bold">✓ ĐANG CHỌN</span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-[#EDE8DF] mt-1.5">{addr.fullName}</p>
                          <p className="text-[10px] text-[#9A9080] mt-0.5 leading-relaxed truncate w-full">{addr.address}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-[11px] font-medium text-[#9A9080] mb-1">Họ và Tên người nhận</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9080]" />
                  <input 
                    type="text" 
                    value={shippingForm.fullName} 
                    onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })} 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C9973D]/15 bg-[#0C0B09] text-[#EDE8DF] placeholder-[#5C5850] focus:outline-none focus:border-[#C9973D]/40 text-sm transition-all" 
                    placeholder="Nguyễn Văn A" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-[#9A9080] mb-1">Số điện thoại</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9080]" />
                    <input 
                      type="tel" 
                      value={shippingForm.phone} 
                      onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })} 
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C9973D]/15 bg-[#0C0B09] text-[#EDE8DF] placeholder-[#5C5850] focus:outline-none focus:border-[#C9973D]/40 text-sm transition-all" 
                      placeholder="0912345678" 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#9A9080] mb-1">Email liên hệ</label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9080]" />
                    <input 
                      type="email" 
                      value={shippingForm.email} 
                      onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })} 
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C9973D]/15 bg-[#0C0B09] text-[#EDE8DF] placeholder-[#5C5850] focus:outline-none focus:border-[#C9973D]/40 text-sm transition-all" 
                      placeholder="customer@example.com" 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#9A9080] mb-1">Địa chỉ nhận hàng</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9080]" />
                  <input 
                    type="text" 
                    value={shippingForm.address} 
                    onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })} 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C9973D]/15 bg-[#0C0B09] text-[#EDE8DF] placeholder-[#5C5850] focus:outline-none focus:border-[#C9973D]/40 text-sm transition-all" 
                    placeholder="Số 123 Đường ABC, Quận XYZ, Hà Nội" 
                    required 
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="pt-2">
                <label className="block text-[11px] font-medium text-[#9A9080] mb-2">Phương thức thanh toán</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* COD Option */}
                  <div 
                    onClick={() => setShippingForm({ ...shippingForm, paymentMethod: 'COD' })}
                    className={`p-4 rounded-xl border cursor-pointer select-none transition-all ${
                      shippingForm.paymentMethod === 'COD'
                        ? 'border-[#C9973D] bg-[#C9973D]/05 text-[#C9973D] shadow-[0_0_15px_rgba(201,151,61,0.1)]'
                        : 'border-[#C9973D]/15 bg-[#0C0B09] text-[#9A9080] hover:border-[#C9973D]/30 hover:text-[#EDE8DF]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-semibold tracking-wider">COD (TIỀN MẶT)</span>
                      {shippingForm.paymentMethod === 'COD' && <FiCheck className="text-sm" />}
                    </div>
                    <p className="text-[10px] opacity-75">Thanh toán khi nhận hàng.</p>
                  </div>

                  {/* Bank Transfer Option */}
                  <div 
                    onClick={() => setShippingForm({ ...shippingForm, paymentMethod: 'BANK_TRANSFER' })}
                    className={`p-4 rounded-xl border cursor-pointer select-none transition-all ${
                      shippingForm.paymentMethod === 'BANK_TRANSFER'
                        ? 'border-[#C9973D] bg-[#C9973D]/05 text-[#C9973D] shadow-[0_0_15px_rgba(201,151,61,0.1)]'
                        : 'border-[#C9973D]/15 bg-[#0C0B09] text-[#9A9080] hover:border-[#C9973D]/30 hover:text-[#EDE8DF]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-semibold tracking-wider">CHUYỂN KHOẢN QR</span>
                      {shippingForm.paymentMethod === 'BANK_TRANSFER' && <FiCheck className="text-sm" />}
                    </div>
                    <p className="text-[10px] opacity-75">Quét mã VietQR nhanh chóng.</p>
                  </div>

                  {/* Stripe Option */}
                  <div 
                    onClick={() => setShippingForm({ ...shippingForm, paymentMethod: 'STRIPE' })}
                    className={`p-4 rounded-xl border cursor-pointer select-none transition-all ${
                      shippingForm.paymentMethod === 'STRIPE'
                        ? 'border-[#C9973D] bg-[#C9973D]/05 text-[#C9973D] shadow-[0_0_15px_rgba(201,151,61,0.1)]'
                        : 'border-[#C9973D]/15 bg-[#0C0B09] text-[#9A9080] hover:border-[#C9973D]/30 hover:text-[#EDE8DF]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-semibold tracking-wider">STRIPE (THẺ)</span>
                      {shippingForm.paymentMethod === 'STRIPE' && <FiCheck className="text-sm" />}
                    </div>
                    <p className="text-[10px] opacity-75">Thanh toán thẻ Visa/Mastercard.</p>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit" disabled={ordering}
                className="w-full mt-4 py-3.5 rounded-full bg-[#C9973D] text-[#0C0B09] hover:bg-[#DDB05A] transition-all text-xs font-mono uppercase tracking-[0.2em] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center font-bold shadow-[0_0_20px_rgba(201,151,61,0.25)]"
              >
                {ordering 
                  ? <div className="w-5 h-5 border-2 border-[#0C0B09]/30 border-t-[#0C0B09] rounded-full animate-spin" />
                  : `XÁC NHẬN ĐẶT HÀNG - $${finalTotal.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── VietQR Modal ── */}
      {showQRModal && currentOrder && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#161510] border border-[#C9973D]/25 rounded-2xl w-full max-w-md p-6 sm:p-8 text-center space-y-6 text-[#EDE8DF] relative">
            <button 
              onClick={() => { setShowQRModal(false); setCurrentOrder(null); }}
              className="absolute top-4 right-4 text-[#9A9080] hover:text-[#C9973D] p-1.5 rounded-full hover:bg-[#C9973D]/10 transition-all"
            >
              <FiX className="text-xl" />
            </button>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9973D]/70 block mb-1">Mã thanh toán VietQR</span>
              <h2 className="font-display text-2xl font-light text-[#EDE8DF]">Chuyển Khoản Đơn Hàng #{currentOrder.id}</h2>
            </div>

            {/* QR display */}
            <div className="bg-white p-4 rounded-xl inline-block border border-[#C9973D]/20 mx-auto">
              <img 
                src={`https://img.vietqr.io/image/ICB-970415-compact2.png?amount=${Math.round(currentOrder.total * 25000)}&addInfo=AromaOrder%20${currentOrder.id}&accountName=NGUYEN%20VU%20HIEP`} 
                alt="VietQR VietinBank"
                className="w-64 h-64 object-contain"
              />
            </div>

            {/* Details */}
            <div className="text-xs space-y-2 text-[#9A9080] font-mono text-left bg-[#0C0B09] p-4 rounded-xl border border-[#C9973D]/10">
              <div className="flex justify-between">
                <span>Ngân hàng:</span>
                <span className="text-[#EDE8DF] font-semibold">VietinBank (ICB)</span>
              </div>
              <div className="flex justify-between">
                <span>Số tài khoản:</span>
                <span className="text-[#EDE8DF] font-semibold">970415</span>
              </div>
              <div className="flex justify-between">
                <span>Chủ tài khoản:</span>
                <span className="text-[#EDE8DF] font-semibold">NGUYEN VU HIEP</span>
              </div>
              <div className="flex justify-between border-t border-[#C9973D]/10 pt-2">
                <span>Số tiền VND (Tỷ giá 25k):</span>
                <span className="text-[#C9973D] font-bold">{(Math.round(currentOrder.total * 25000)).toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between">
                <span>Nội dung chuyển khoản:</span>
                <span className="text-[#C9973D] font-bold">AromaOrder {currentOrder.id}</span>
              </div>
            </div>

            <p className="text-[10px] text-[#5C5850]">
              * Hệ thống sẽ tự động chuyển trạng thái đơn hàng sang <b>PAID</b> sau khi xác nhận nhận tiền thành công qua SSE notification.
            </p>

            <button 
              onClick={() => { setShowQRModal(false); setCurrentOrder(null); }}
              className="px-6 py-2.5 rounded-full bg-[#C9973D] text-[#0C0B09] text-xs font-mono uppercase tracking-wider hover:bg-[#DDB05A] transition-all font-semibold"
            >
              ĐÃ CHUYỂN KHOẢN
            </button>
          </div>
        </div>
      )}

      {/* ── Voucher Selection Modal ── */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#161510] border border-[#C9973D]/25 rounded-2xl w-full max-w-md p-6 sm:p-8 space-y-6 text-[#EDE8DF] relative">
            <button 
              onClick={() => setIsVoucherModalOpen(false)}
              className="absolute top-4 right-4 text-[#9A9080] hover:text-[#C9973D] p-1.5 rounded-full hover:bg-[#C9973D]/10 transition-all"
            >
              <FiX className="text-xl" />
            </button>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C9973D]/70 block mb-1">Mã giảm giá khả dụng</span>
              <h2 className="font-display text-2xl font-light text-[#EDE8DF]">Chọn Mã Giảm Giá</h2>
            </div>

            {loadingVouchers ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-[#C9973D] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-[#9A9080] font-mono">Đang tìm voucher...</p>
              </div>
            ) : vouchers.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-[#C9973D]/15 rounded-xl bg-[#0C0B09]/50">
                <p className="text-xs text-[#9A9080]">Hiện không có mã giảm giá nào khả dụng.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {vouchers.map((v) => (
                  <div key={v.id} className="bg-[#0C0B09] border border-[#C9973D]/15 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-[#C9973D]/40 transition-all group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#C9973D]/15 text-[#C9973D] text-xs font-mono font-semibold">
                          Giảm {v.discountPercent}%
                        </span>
                        <span className="text-sm font-bold text-[#EDE8DF] font-mono tracking-wider">{v.code}</span>
                      </div>
                      <p className="text-[10px] text-[#9A9080] font-mono">
                        Hạn dùng: {v.expirationDate ? new Date(v.expirationDate).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                      </p>
                      <p className="text-[9px] text-[#5C5850]">
                        Còn lại: {v.maxUses - v.usedCount} lượt dùng
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleSelectVoucher(v.code)}
                      className="px-4 py-2 bg-[#C9973D] hover:bg-[#DDB05A] text-[#0C0B09] text-xs font-mono rounded-lg transition-all font-semibold active:scale-95"
                    >
                      Áp dụng
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
