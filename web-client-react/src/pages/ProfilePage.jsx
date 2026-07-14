import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import { FiUser, FiShoppingBag, FiCalendar, FiClock, FiDollarSign, FiChevronDown, FiChevronUp, FiArrowLeft, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Form profile fields stored in localStorage for autofill
  const [profileData, setProfileData] = useState({
    fullName: localStorage.getItem('profile_fullName') || 'Khách Hàng',
    phone: localStorage.getItem('profile_phone') || '',
    email: localStorage.getItem('profile_email') || '',
    address: localStorage.getItem('profile_address') || ''
  });

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const data = await orderAPI.getMyOrders();
      // Sắp xếp đơn hàng mới nhất lên đầu
      const sorted = (data || []).sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch {
      showToast('Không thể tải lịch sử đơn hàng của bạn.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('profile_fullName', profileData.fullName);
    localStorage.setItem('profile_phone', profileData.phone);
    localStorage.setItem('profile_email', profileData.email);
    localStorage.setItem('profile_address', profileData.address);
    showToast('Đã lưu thông tin cá nhân thành công!');
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-semibold">ĐÃ THANH TOÁN</span>;
      case 'PAYMENT_EXPECTED':
        return <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-semibold">CHỜ THANH TOÁN</span>;
      case 'SHIPPED':
        return <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 text-xs font-semibold">ĐANG GIAO HÀNG</span>;
      case 'COMPLETED':
      case 'DELIVERED':
        return <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 text-xs font-semibold">HOÀN THÀNH</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-700 text-xs font-semibold">ĐÃ HỦY</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-slate-500/10 text-slate-700 text-xs font-semibold">{status}</span>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fffaf6] bg-grid">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-light text-[#2d2a26] mb-2">Truy cập bị hạn chế</h2>
          <p className="text-xs text-[#8a8480] uppercase tracking-wider font-mono mb-6">Hãy đăng nhập để xem thông tin cá nhân</p>
          <Link to="/login" className="px-6 py-3 bg-[#1a1a1a] text-[#fffaf6] hover:bg-[#2d2a26] text-xs font-mono uppercase tracking-widest transition-all">
            ĐĂNG NHẬP NGAY
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf6] bg-grid pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-28">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase font-mono tracking-wider text-[#b8a690] hover:text-[#2d2a26] mb-8 transition-colors">
          <FiArrowLeft /> QUAY LẠI CỬA HÀNG
        </Link>

        <h1 className="text-3xl sm:text-5xl font-light text-[#2d2a26] leading-tight tracking-tight mb-10">
          Tài Khoản Của Tôi
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: User Profile (4 Columns) */}
          <div className="lg:col-span-4 glass-strong rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-[#dbccb8]/20">
              <div className="w-16 h-16 rounded-full bg-[#dbccb8]/30 flex items-center justify-center text-[#2d2a26] text-2xl font-light">
                <FiUser />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2d2a26]">{user.username}</h3>
                <span className="text-[10px] font-mono text-[#8a8480] uppercase tracking-widest bg-[#dbccb8]/20 px-2 py-0.5 rounded">
                  {user.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <h4 className="text-xs uppercase font-mono tracking-wider text-[#8a8480]">Thông tin giao hàng mặc định</h4>
              
              <div>
                <label className="block text-[11px] font-medium text-[#5a5550] mb-1">Họ và Tên</label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dbccb8]/40 bg-[#fffaf6]/50 focus:outline-none focus:border-[#2d2a26] transition-all text-sm text-[#2d2a26]"
                  placeholder="Họ và tên người nhận"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#5a5550] mb-1">Số điện thoại</label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8a690]" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dbccb8]/40 bg-[#fffaf6]/50 focus:outline-none focus:border-[#2d2a26] transition-all text-sm text-[#2d2a26]"
                    placeholder="Số điện thoại liên hệ"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#5a5550] mb-1">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8a690]" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dbccb8]/40 bg-[#fffaf6]/50 focus:outline-none focus:border-[#2d2a26] transition-all text-sm text-[#2d2a26]"
                    placeholder="Địa chỉ Email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#5a5550] mb-1">Địa chỉ nhận hàng</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8a690]" />
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dbccb8]/40 bg-[#fffaf6]/50 focus:outline-none focus:border-[#2d2a26] transition-all text-sm text-[#2d2a26]"
                    placeholder="Địa chỉ nhận hàng chi tiết"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#1a1a1a] hover:bg-[#2d2a26] text-[#fffaf6] text-xs font-mono uppercase tracking-widest transition-all active:scale-[0.98]"
              >
                Lưu Thay Đổi
              </button>
            </form>
          </div>

          {/* Right: Order History (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-xl text-[#2d2a26]"><FiShoppingBag /></span>
              <h2 className="text-xl font-light text-[#2d2a26]">Lịch sử đặt hàng ({orders.length})</h2>
            </div>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-slate-200/50 rounded-2xl" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[#dbccb8]/40 bg-[#fffaf6]/30 rounded-3xl">
                <div className="text-5xl mb-4">🛒</div>
                <h3 className="text-lg font-light text-[#2d2a26] mb-1">Bạn chưa đặt đơn hàng nào</h3>
                <p className="text-xs text-[#8a8480] uppercase tracking-wider font-mono mb-4">Túi hương của bạn đang trống</p>
                <Link to="/" className="inline-block px-5 py-2.5 bg-[#1a1a1a] text-[#fffaf6] text-xs font-mono uppercase tracking-widest hover:bg-[#2d2a26] transition-all">
                  MUA HƯƠNG NGAY
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isExpanded = expandedOrder === order.id;
                  return (
                    <div key={order.id} className="glass-strong rounded-3xl overflow-hidden border border-[#dbccb8]/20 transition-all duration-300">
                      {/* Order Header Summary */}
                      <div 
                        onClick={() => toggleExpand(order.id)}
                        className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer hover:bg-black/[0.01] transition-all select-none"
                      >
                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-x-6 gap-y-2">
                          <div>
                            <span className="block text-[10px] font-mono text-[#8a8480] uppercase tracking-wider">MÃ ĐƠN HÀNG</span>
                            <span className="text-sm font-semibold text-[#2d2a26]">#{order.id}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-mono text-[#8a8480] uppercase tracking-wider">NGÀY ĐẶT</span>
                            <span className="text-xs text-[#2d2a26] flex items-center gap-1"><FiCalendar /> {order.orderedDate}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-mono text-[#8a8480] uppercase tracking-wider">TỔNG TIỀN</span>
                            <span className="text-sm font-bold text-[#1a1a1a] flex items-center"><FiDollarSign />{order.total?.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0">
                          {getStatusBadge(order.status)}
                          <button className="p-1 rounded-full hover:bg-[#dbccb8]/20 text-[#8a8480] hover:text-[#1a1a1a] transition-all">
                            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                          </button>
                        </div>
                      </div>

                      {/* Order Expanded Details */}
                      {isExpanded && (
                        <div className="px-5 pb-6 pt-4 border-t border-[#dbccb8]/20 bg-[#fffaf6]/40 space-y-4">
                          <h4 className="text-xs uppercase font-mono tracking-wider text-[#8a8480] pb-2 border-b border-[#dbccb8]/10">Chi tiết sản phẩm</h4>
                          <div className="divide-y divide-[#dbccb8]/10">
                            {order.items?.map((item) => (
                              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-[#fffaf6] border border-[#dbccb8]/20 overflow-hidden flex-shrink-0">
                                    <img 
                                      src={item.product?.imageUrl || DEFAULT_IMAGE} 
                                      alt={item.product?.productName}
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
                                    />
                                  </div>
                                  <div>
                                    <Link to={`/product/${item.product?.id || item.product?.productId}`} className="text-sm font-light text-[#2d2a26] hover:text-[#c9b8a0] transition-colors line-clamp-1">
                                      {item.product?.productName || 'Sản phẩm'}
                                    </Link>
                                    <span className="block text-[10px] text-[#8a8480] font-mono">Số lượng: {item.quantity} x ${item.product?.price?.toFixed(2)}</span>
                                  </div>
                                </div>
                                <span className="text-sm font-semibold text-[#2d2a26]">${(item.subtotal || (item.product?.price * item.quantity))?.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-4 border-t border-[#dbccb8]/10 text-xs text-[#8a8480] flex flex-col sm:flex-row justify-between gap-4">
                            <div>
                              <span className="block font-medium text-[#5a5550]">Địa chỉ giao hàng:</span>
                              <span>{order.shippingFullName} - {order.shippingPhone} <br /> {order.shippingAddress}</span>
                            </div>
                            <div className="sm:text-right">
                              <span className="block font-medium text-[#5a5550]">Trạng thái:</span>
                              <span className="font-semibold text-[#2d2a26]">{order.status}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
