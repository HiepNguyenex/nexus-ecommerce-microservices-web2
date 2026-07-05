import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cartAPI, orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft } from 'react-icons/fi';

const BACKUP_IMAGES = {
  1: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&auto=format&fit=crop&q=60",
  2: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=200&auto=format&fit=crop&q=60",
  3: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=200&auto=format&fit=crop&q=60",
  4: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=200&auto=format&fit=crop&q=60",
  5: "https://images.unsplash.com/photo-1588405748373-122b2321bc31?w=200&auto=format&fit=crop&q=60"
};
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&auto=format&fit=crop&q=60";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (user) loadCart();
    else setLoading(false);
  }, [user]);

  const loadCart = async () => {
    try {
      const data = await cartAPI.getCart();
      setCartItems(data?.items || data || []);
    } catch {
      showToast('Không thể tải thông tin giỏ hàng.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await cartAPI.updateQuantity(itemId, newQty);
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQty } : item
        )
      );
    } catch {
      showToast('Không thể cập nhật số lượng mùi hương.', 'error');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartAPI.removeItem(itemId);
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      showToast('Đã xóa sản phẩm khỏi giỏ hàng.');
    } catch {
      showToast('Không thể xóa sản phẩm.', 'error');
    }
  };

  const placeOrder = async () => {
    if (!user?.id) {
      showToast('Vui lòng đăng nhập để đặt hàng.', 'warning');
      return;
    }
    setOrdering(true);
    try {
      await orderAPI.createOrder(user.id);
      showToast('Đặt túi hương thành công! 🎉');
      setCartItems([]);
    } catch {
      showToast('Không thể tiến hành đặt hàng. Vui lòng thử lại.', 'error');
    } finally {
      setOrdering(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fffaf6] bg-grid">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-light text-[#2d2a26] mb-2">Quyền truy cập được bảo mật</h2>
          <p className="text-xs text-[#8a8480] uppercase tracking-wider font-mono mb-6">Đăng nhập để xem túi hương cá nhân</p>
          <Link 
            to="/login" 
            className="px-6 py-3 bg-[#1a1a1a] text-[#fffaf6] hover:bg-[#2d2a26] text-xs font-mono uppercase tracking-widest transition-all"
          >
            ĐĂNG NHẬP NGAY
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf6] bg-grid pb-20">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 border-b border-[#dbccb8]/20 pb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#b8a690] block mb-1">Túi mua sắm của bạn</span>
            <h1 className="text-3xl font-light text-[#2d2a26]">Giỏ Hàng Mùi Hương</h1>
          </div>
          <Link to="/" className="text-xs uppercase font-mono tracking-wider text-[#b8a690] hover:text-[#2d2a26] flex items-center gap-2 transition-all">
            <FiArrowLeft /> TIẾP TỤC CHỌN MÙI HƯƠNG
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200/50 w-full rounded" />
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white/30 border border-[#dbccb8]/20">
            <div className="text-5xl mb-4">🛒</div>
            <h3 className="text-lg font-light text-[#2d2a26] mb-1">Túi hương trống</h3>
            <p className="text-xs text-[#b8a690] font-mono uppercase tracking-wider mb-6">Bạn chưa chọn chai nước hoa nào.</p>
            <Link 
              to="/" 
              className="px-6 py-3 bg-[#1a1a1a] text-[#fffaf6] hover:bg-[#2d2a26] text-xs font-mono uppercase tracking-widest transition-all"
            >
              KHÁM PHÁ MÙI HƯƠNG
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* Left: Cart Items List (Flat borders) */}
            <div className="lg:col-span-2 border-t border-[#dbccb8]/20">
              {cartItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="py-6 border-b border-[#dbccb8]/20 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#fffaf6]"
                >
                  <img
                    src={BACKUP_IMAGES[item.productId] || DEFAULT_IMAGE}
                    alt={item.productName}
                    className="w-16 h-16 object-cover border border-[#dbccb8]/20 grayscale hover:grayscale-0 transition-all duration-300 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-light text-[#2d2a26] text-base truncate">
                      {item.productName || 'Sản phẩm nước hoa'}
                    </h3>
                    <p className="text-xs font-mono text-[#b8a690] mt-0.5">
                      Đơn giá: ${(item.price || 0).toFixed(2)}
                    </p>
                  </div>
                  
                  {/* Quantity Controls (Minimalist styling) */}
                  <div className="flex items-center border border-[#dbccb8]/30">
                    <button
                      onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                      className="w-8 h-8 flex items-center justify-center text-[#8a8480] hover:text-[#1a1a1a] hover:bg-[#dbccb8]/10 transition-all"
                    >
                      <FiMinus className="text-[10px]" />
                    </button>
                    <span className="w-8 text-center text-xs font-mono text-[#2d2a26]">
                      {item.quantity || 1}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                      className="w-8 h-8 flex items-center justify-center text-[#8a8480] hover:text-[#1a1a1a] hover:bg-[#dbccb8]/10 transition-all"
                    >
                      <FiPlus className="text-[10px]" />
                    </button>
                  </div>

                  {/* Price info & Delete */}
                  <div className="text-right min-w-[80px] font-semibold text-[#1a1a1a] text-sm">
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-[#b8a690] hover:text-rose-500 transition-all ml-2"
                    title="Xóa khỏi giỏ"
                  >
                    <FiTrash2 className="text-sm" />
                  </button>
                </div>
              ))}
            </div>

            {/* Right: Order Summary Box (Minimalist Outline) */}
            <div className="lg:col-span-1">
              <div className="border border-[#dbccb8]/30 bg-[#fffaf6] p-6 sticky top-28">
                <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-[#b8a690] mb-6">Tóm tắt đơn hàng</h3>
                <div className="space-y-4 text-xs font-light">
                  <div className="flex justify-between text-[#8a8480]">
                    <span>Tạm tính</span>
                    <span className="font-mono">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#8a8480]">
                    <span>Vận chuyển toàn quốc</span>
                    <span className="font-mono text-[#a8c5a0] uppercase tracking-wider">MIỄN PHÍ</span>
                  </div>
                  
                  <div className="border-t border-[#dbccb8]/20 pt-4 flex justify-between text-base font-normal">
                    <span className="text-[#2d2a26]">Tổng cộng</span>
                    <span className="font-mono text-lg font-semibold text-[#1a1a1a]">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <button
                  onClick={placeOrder}
                  disabled={ordering || cartItems.length === 0}
                  className="w-full mt-8 py-4 bg-[#1a1a1a] text-[#fffaf6] hover:bg-[#2d2a26] transition-all text-xs font-mono uppercase tracking-[0.25em] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
                >
                  {ordering ? (
                    <div className="w-5 h-5 border-2 border-[#fffaf6]/20 border-t-[#fffaf6] rounded-full animate-spin" />
                  ) : (
                    'TIẾN HÀNH ĐẶT HÀNG'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
