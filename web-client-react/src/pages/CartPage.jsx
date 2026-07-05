import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cartAPI, orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowLeft, FiCreditCard } from 'react-icons/fi';

const BACKUP_IMAGES = {
  1: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&auto=format&fit=crop&q=60",
  2: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&auto=format&fit=crop&q=60",
  3: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&auto=format&fit=crop&q=60",
  4: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=60",
  5: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=200&auto=format&fit=crop&q=60"
};
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=60";

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
      showToast('Không thể tải giỏ hàng.', 'error');
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
      showToast('Không thể cập nhật số lượng.', 'error');
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
      showToast('Đặt hàng thành công! 🎉');
      setCartItems([]);
    } catch {
      showToast('Không thể đặt hàng. Vui lòng thử lại.', 'error');
    } finally {
      setOrdering(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fffaf6] bg-grid">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 animate-fade-in">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">Vui lòng đăng nhập</h2>
          <p className="text-[#b8a690] mb-4">Đăng nhập để xem giỏ hàng của bạn</p>
          <Link to="/login" className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#dbccb8] to-[#c9b8a0] text-[#1a1a1a] font-semibold hover:shadow-xl hover:shadow-[#dbccb8]/30 transition-all btn-shine">
            Đăng Nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf6] bg-grid">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-20">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-[#2d2a26] flex items-center gap-3">
            <FiShoppingBag className="text-[#c9b8a0]" /> Giỏ Hàng
          </h1>
          <Link to="/" className="text-sm text-[#b8a690] hover:text-[#2d2a26] flex items-center gap-2 transition-colors">
            <FiArrowLeft /> Tiếp tục mua sắm
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4 animate-fade-in">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-shimmer h-28 rounded-2xl" />
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#dbccb8]/20 animate-fade-in">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-[#2d2a26] mb-2">Giỏ hàng trống</h3>
            <p className="text-[#b8a690] mb-4">Hãy thêm sản phẩm vào giỏ hàng nhé!</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#dbccb8] to-[#c9b8a0] text-[#1a1a1a] font-semibold hover:shadow-xl hover:shadow-[#dbccb8]/30 transition-all btn-shine">
              Mua Sắm Ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 stagger-children">
              {cartItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 border border-[#dbccb8]/20 shadow-sm card-hover"
                >
                  <img
                    src={BACKUP_IMAGES[item.productId] || DEFAULT_IMAGE}
                    alt={item.productName}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#2d2a26] truncate">
                      {item.productName || 'Sản phẩm'}
                    </h3>
                    <p className="text-sm text-gradient font-bold mt-1">
                      ${(item.price || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                      className="w-8 h-8 rounded-full bg-[#dbccb8]/20 flex items-center justify-center text-[#8a8480] hover:text-[#2d2a26] transition-all"
                    >
                      <FiMinus className="text-xs" />
                    </button>
                    <span className="w-8 text-center font-semibold text-[#2d2a26]">
                      {item.quantity || 1}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                      className="w-8 h-8 rounded-full bg-[#dbccb8]/20 flex items-center justify-center text-[#8a8480] hover:text-[#2d2a26] transition-all"
                    >
                      <FiPlus className="text-xs" />
                    </button>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="font-bold text-[#2d2a26]">
                      ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 rounded-xl text-[#b8a690] hover:text-[#c99a8a] hover:bg-[#c99a8a]/10 transition-all"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#dbccb8]/20 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-[#2d2a26] mb-4">Tổng Đơn Hàng</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[#8a8480]">
                    <span>Tạm tính</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#8a8480]">
                    <span>Phí vận chuyển</span>
                    <span className="text-[#a8c5a0]">Miễn phí</span>
                  </div>
                  <div className="border-t border-[#dbccb8]/20 pt-3 flex justify-between text-lg font-bold">
                    <span className="text-[#2d2a26]">Tổng cộng</span>
                    <span className="text-gradient">${total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={placeOrder}
                  disabled={ordering || cartItems.length === 0}
                  className="w-full mt-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#dbccb8] to-[#c9b8a0] text-[#1a1a1a] font-semibold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-[#dbccb8]/30 disabled:opacity-50 transition-all duration-200 btn-shine"
                >
                  {ordering ? (
                    <div className="w-5 h-5 border-2 border-[#1a1a1a]/20 border-t-[#1a1a1a] rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiCreditCard /> Đặt Hàng
                    </>
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
