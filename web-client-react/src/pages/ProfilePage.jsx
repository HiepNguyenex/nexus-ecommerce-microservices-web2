import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI, authAPI, productAPI, paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import { FiUser, FiShoppingBag, FiCalendar, FiDollarSign, FiChevronDown, FiChevronUp, FiArrowLeft, FiMapPin, FiPhone, FiMail, FiLock } from 'react-icons/fi';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&auto=format&fit=crop&q=60";

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone:    '',
    email:    '',
    address:  ''
  });
  const [profileTab, setProfileTab] = useState('info');
  const [addressBook, setAddressBook] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('address_book') || '[]');
    } catch {
      return [];
    }
  });
  const [newAddress, setNewAddress] = useState({
    id: '', label: 'Nhà riêng', fullName: '', phone: '', address: ''
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState([]);

  useEffect(() => {
    if (user) {
      loadOrders();
      loadProfile();
      loadCatalogProducts();
      
      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get('status') === 'success') {
        const oId = queryParams.get('orderId');
        if (oId) {
          const confirmAndReload = async () => {
            try {
              await paymentAPI.confirmPayment(oId);
              showToast(`Thanh toán thành công đơn hàng #${oId}!`, 'success');
              loadOrders();
              setTimeout(loadOrders, 2000);
            } catch (err) {
              console.error("Lỗi xác nhận thanh toán:", err);
              showToast(`Đã thanh toán thành công đơn hàng #${oId} qua Stripe.`, 'success');
              loadOrders();
            }
          };
          confirmAndReload();
        } else {
          showToast('Thanh toán qua Stripe thành công!', 'success');
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else {
      setLoading(false);
      setProfileLoading(false);
    }
  }, [user]);

  const loadCatalogProducts = async () => {
    try {
      const data = await productAPI.getAll();
      setCatalogProducts(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadProfile = async () => {
    try {
      const data = await authAPI.getUser(user.id);
      if (data && data.userDetails) {
        const ud = data.userDetails;
        setProfileData({
          fullName: `${ud.firstName || ''} ${ud.lastName || ''}`.trim() || user.username,
          phone:    ud.phoneNumber || '',
          email:    ud.email || '',
          address:  ud.street || ''
        });
      } else {
        // Fallback to local storage if DB details are null
        setProfileData({
          fullName: localStorage.getItem('profile_fullName') || user.username || 'Khách Hàng',
          phone:    localStorage.getItem('profile_phone')    || '',
          email:    localStorage.getItem('profile_email')    || '',
          address:  localStorage.getItem('profile_address')  || ''
        });
      }
    } catch {
      showToast('Không thể tải thông tin chi tiết tài khoản.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await orderAPI.getMyOrders();
      setOrders((data || []).sort((a, b) => b.id - a.id));
    } catch { showToast('Không thể tải lịch sử đơn hàng.', 'error'); }
    finally { setLoading(false); }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const nameParts = (profileData.fullName || '').trim().split(/\s+/);
      const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0] || 'User';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '.';
      
      const details = {
        firstName,
        lastName,
        email: profileData.email,
        phoneNumber: profileData.phone,
        street: profileData.address,
        streetNumber: '1',
        zipCode: '10000',
        locality: 'Hanoi',
        country: 'Vietnam'
      };

      await authAPI.updateDetails(user.id, details);
      
      // Also save to localStorage for fallback/backward compatibility
      localStorage.setItem('profile_fullName', profileData.fullName);
      localStorage.setItem('profile_phone',    profileData.phone);
      localStorage.setItem('profile_email',    profileData.email);
      localStorage.setItem('profile_address',  profileData.address);
      
      showToast('Đã lưu thông tin cá nhân thành công!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể cập nhật thông tin cá nhân.', 'error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    try {
      await orderAPI.updateStatus(orderId, 'CANCELLED');
      showToast(`Đã hủy đơn hàng #${orderId} thành công.`, 'success');
      loadOrders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể hủy đơn hàng.', 'error');
    }
  };

  const toggleExpand = (orderId) => setExpandedOrder(expandedOrder === orderId ? null : orderId);

  const getStatusBadge = (status) => {
    const map = {
      PAID:             { label: 'ĐÃ THANH TOÁN',   cls: 'bg-[#6B9E78]/15 text-[#6B9E78] border-[#6B9E78]/30' },
      PAYMENT_EXPECTED: { label: 'CHỜ THANH TOÁN',  cls: 'bg-[#C9973D]/15 text-[#C9973D] border-[#C9973D]/30' },
      SHIPPED:          { label: 'ĐANG GIAO HÀNG',  cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
      COMPLETED:        { label: 'HOÀN THÀNH',       cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
      DELIVERED:        { label: 'HOÀN THÀNH',       cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
      CANCELLED:        { label: 'ĐÃ HỦY',           cls: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
    };
    const s = map[status] || { label: status, cls: 'bg-[#1E1C18] text-[#9A9080] border-[#C9973D]/15' };
    return <span className={`px-3 py-1 rounded-full border text-[10px] font-mono font-semibold ${s.cls}`}>{s.label}</span>;
  };

  const renderOrderStepper = (status) => {
    if (status === 'CANCELLED') {
      return (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono text-center uppercase tracking-wider">
          Đơn hàng này đã bị hủy
        </div>
      );
    }

    const steps = [
      { id: 'placed', label: 'Đặt Hàng', desc: 'Đơn hàng đã đặt' },
      { id: 'paid', label: 'Thanh Toán', desc: 'Đã nhận thanh toán' },
      { id: 'shipped', label: 'Giao Hàng', desc: 'Đang vận chuyển' },
      { id: 'completed', label: 'Hoàn Thành', desc: 'Giao thành công' }
    ];

    let currentStepIdx = 0;
    if (status === 'PAID') currentStepIdx = 1;
    else if (status === 'SHIPPED') currentStepIdx = 2;
    else if (status === 'COMPLETED' || status === 'DELIVERED') currentStepIdx = 3;

    return (
      <div className="py-5 px-4 bg-[#0C0B09]/60 border border-[#C9973D]/10 rounded-xl space-y-4 mb-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-[8%] right-[8%] top-[14px] h-[2px] bg-[#1E1C18] -z-10">
            <div 
              className="h-full bg-gradient-to-r from-[#A87B2C] to-[#C9973D] transition-all duration-700" 
              style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isActive = idx === currentStepIdx;
            return (
              <div key={step.id} className="flex flex-col items-center flex-1 relative z-10">
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono border transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-[#C9973D] border-[#C9973D] text-[#0C0B09] font-bold shadow-[0_0_12px_rgba(201,151,61,0.25)]' 
                      : 'bg-[#0C0B09] border-[#C9973D]/20 text-[#5C5850]'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span 
                  className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-wider mt-2 transition-colors ${
                    isActive ? 'text-[#C9973D] font-semibold' : isCompleted ? 'text-[#EDE8DF]' : 'text-[#5C5850]'
                  }`}
                >
                  {step.label}
                </span>
                <span className="hidden sm:block text-[8px] font-mono text-[#5C5850] mt-0.5">{step.desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    let updated;
    if (isEditingAddress) {
      updated = addressBook.map(addr => addr.id === newAddress.id ? newAddress : addr);
      showToast('Đã cập nhật địa chỉ thành công!', 'success');
    } else {
      const added = { ...newAddress, id: Date.now().toString() };
      updated = [...addressBook, added];
      showToast('Đã thêm địa chỉ mới thành công!', 'success');
    }
    setAddressBook(updated);
    localStorage.setItem('address_book', JSON.stringify(updated));
    setNewAddress({ id: '', label: 'Nhà riêng', fullName: '', phone: '', address: '' });
    setIsEditingAddress(false);
  };

  const handleEditAddress = (addr) => {
    setNewAddress(addr);
    setIsEditingAddress(true);
  };

  const handleDeleteAddress = (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    const updated = addressBook.filter(addr => addr.id !== id);
    setAddressBook(updated);
    localStorage.setItem('address_book', JSON.stringify(updated));
    showToast('Đã xóa địa chỉ thành công.', 'success');
  };

  const inputClass = `w-full px-4 py-2.5 rounded-xl border border-[#C9973D]/15 bg-[#0C0B09] text-[#EDE8DF] placeholder-[#5C5850] focus:outline-none focus:border-[#C9973D]/40 transition-all text-sm ${profileLoading ? 'opacity-50 pointer-events-none' : ''}`;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0C0B09] bg-grid">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-40 gap-4">
          <div className="w-16 h-16 rounded-full bg-[#C9973D]/10 border border-[#C9973D]/20 flex items-center justify-center">
            <FiLock className="text-[#C9973D] text-2xl" />
          </div>
          <h2 className="font-display text-2xl font-light text-[#EDE8DF]">Truy cập bị hạn chế</h2>
          <p className="text-xs text-[#9A9080] uppercase tracking-wider font-mono">Đăng nhập để xem thông tin cá nhân</p>
          <Link to="/login" className="px-6 py-3 rounded-full bg-[#C9973D] text-[#0C0B09] text-xs font-mono uppercase tracking-wider hover:bg-[#DDB05A] transition-all">ĐĂNG NHẬP NGAY</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0B09] bg-grid pb-20 text-[#EDE8DF]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-28">
        <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase font-mono tracking-wider text-[#9A9080] hover:text-[#C9973D] mb-8 transition-colors">
          <FiArrowLeft /> QUAY LẠI CỬA HÀNG
        </Link>

        <h1 className="font-display text-4xl sm:text-5xl font-light text-[#EDE8DF] leading-tight tracking-tight mb-10">
          Tài Khoản <span className="italic text-gradient">Của Tôi</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Profile */}
          <div className="lg:col-span-4 bg-[#161510] border border-[#C9973D]/12 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-[#C9973D]/10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C9973D] to-[#A87B2C] flex items-center justify-center text-[#0C0B09] text-2xl font-bold">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-display text-xl font-medium text-[#EDE8DF]">{user.username}</h3>
                <span className="text-[10px] font-mono text-[#C9973D]/70 uppercase tracking-widest bg-[#C9973D]/10 px-2 py-0.5 rounded-md">
                  {user.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                </span>
              </div>
            </div>

            {/* Tabs for Left Column */}
            <div className="flex border-b border-[#C9973D]/10 pb-4 mb-4 gap-2">
              <button 
                type="button" 
                onClick={() => setProfileTab('info')}
                className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider transition-colors border-b ${
                  profileTab === 'info' ? 'border-[#C9973D] text-[#C9973D] font-semibold' : 'border-transparent text-[#9A9080] hover:text-[#EDE8DF]'
                }`}
              >
                Cá Nhân
              </button>
              <button 
                type="button" 
                onClick={() => setProfileTab('addresses')}
                className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider transition-colors border-b ${
                  profileTab === 'addresses' ? 'border-[#C9973D] text-[#C9973D] font-semibold' : 'border-transparent text-[#9A9080] hover:text-[#EDE8DF]'
                }`}
              >
                Địa Chỉ ({addressBook.length})
              </button>
            </div>

            {profileTab === 'info' ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <h4 className="text-[10px] uppercase font-mono tracking-wider text-[#5C5850]">Thông tin giao hàng mặc định</h4>

                <div>
                  <label className="block text-[11px] font-medium text-[#9A9080] mb-1">Họ và Tên</label>
                  <input type="text" value={profileData.fullName} onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })} className={inputClass} placeholder={profileLoading ? "Đang tải..." : "Họ và tên người nhận"} required />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#9A9080] mb-1">Số điện thoại</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9080]" />
                    <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className={`${inputClass} pl-10`} placeholder={profileLoading ? "Đang tải..." : "Số điện thoại"} required />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#9A9080] mb-1">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9080]" />
                    <input type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} className={`${inputClass} pl-10`} placeholder={profileLoading ? "Đang tải..." : "Địa chỉ Email"} required />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#9A9080] mb-1">Địa chỉ nhận hàng</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9080]" />
                    <input type="text" value={profileData.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} className={`${inputClass} pl-10`} placeholder={profileLoading ? "Đang tải..." : "Địa chỉ chi tiết"} required />
                  </div>
                </div>

                <button type="submit" disabled={profileLoading}
                  className="w-full py-3 rounded-full bg-[#C9973D] text-[#0C0B09] text-xs font-mono uppercase tracking-widest hover:bg-[#DDB05A] transition-all active:scale-[0.98] font-semibold disabled:opacity-50">
                  {profileLoading ? 'ĐANG TẢI...' : 'Lưu Thay Đổi'}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <form onSubmit={handleSaveAddress} className="space-y-3.5 p-4 rounded-xl border border-[#C9973D]/10 bg-[#0C0B09]/40">
                  <h4 className="text-[10px] uppercase font-mono tracking-wider text-[#C9973D] font-semibold">
                    {isEditingAddress ? 'Chỉnh Sửa Địa Chỉ' : 'Thêm Địa Chỉ Mới'}
                  </h4>

                  <div>
                    <label className="block text-[10px] font-medium text-[#9A9080] mb-1">Nhãn địa chỉ</label>
                    <div className="flex gap-2">
                      {['Nhà riêng', 'Văn phòng', 'Khác'].map(lbl => (
                        <button
                          key={lbl}
                          type="button"
                          onClick={() => setNewAddress({ ...newAddress, label: lbl })}
                          className={`flex-1 py-1 rounded border text-[10px] font-mono transition-all ${
                            newAddress.label === lbl
                              ? 'border-[#C9973D] bg-[#C9973D]/10 text-[#C9973D] font-bold'
                              : 'border-[#C9973D]/10 bg-[#0C0B09]/80 text-[#9A9080] hover:border-[#C9973D]/30'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <input type="text" required placeholder="Họ và Tên người nhận"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#C9973D]/15 bg-[#0C0B09] text-[#EDE8DF] placeholder-[#5C5850] focus:outline-none focus:border-[#C9973D]/30 text-xs transition-all" />
                  </div>

                  <div>
                    <input type="tel" required placeholder="Số điện thoại"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#C9973D]/15 bg-[#0C0B09] text-[#EDE8DF] placeholder-[#5C5850] focus:outline-none focus:border-[#C9973D]/30 text-xs transition-all" />
                  </div>

                  <div>
                    <input type="text" required placeholder="Địa chỉ chi tiết"
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#C9973D]/15 bg-[#0C0B09] text-[#EDE8DF] placeholder-[#5C5850] focus:outline-none focus:border-[#C9973D]/30 text-xs transition-all" />
                  </div>

                  <div className="flex gap-2 pt-1">
                    {isEditingAddress && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingAddress(false);
                          setNewAddress({ id: '', label: 'Nhà riêng', fullName: '', phone: '', address: '' });
                        }}
                        className="flex-1 py-2 rounded-lg border border-rose-500/20 text-rose-400 text-[10px] font-mono hover:bg-rose-500/10 active:scale-95 transition-all"
                      >
                        HỦY BỎ
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-lg bg-[#C9973D] text-[#0C0B09] text-[10px] font-mono font-semibold hover:bg-[#DDB05A] active:scale-95 transition-all"
                    >
                      {isEditingAddress ? 'CẬP NHẬT' : 'THÊM MỚI'}
                    </button>
                  </div>
                </form>

                {/* Address List */}
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-mono tracking-wider text-[#5C5850]">Địa chỉ đã lưu ({addressBook.length})</h4>
                  {addressBook.length === 0 ? (
                    <p className="text-center py-6 text-xs text-[#5C5850] italic font-mono border border-dashed border-[#C9973D]/15 rounded-xl">Chưa có địa chỉ phụ nào được lưu.</p>
                  ) : (
                    addressBook.map((addr) => (
                      <div key={addr.id} className="p-3 bg-[#0C0B09]/30 border border-[#C9973D]/10 rounded-xl space-y-2 group hover:border-[#C9973D]/25 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="px-1.5 py-0.2 rounded bg-[#C9973D]/10 border border-[#C9973D]/20 text-[#C9973D] text-[8px] font-mono uppercase tracking-widest font-semibold">
                            {addr.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditAddress(addr)}
                              className="text-[10px] text-[#9A9080] hover:text-[#C9973D] transition-colors"
                            >
                              Sửa
                            </button>
                            <span className="text-[#5C5850] text-[10px]">|</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-[10px] text-rose-500/70 hover:text-rose-400 transition-colors"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                        <div className="text-xs font-light text-[#EDE8DF]">
                          <p className="font-semibold">{addr.fullName} <span className="font-mono text-[#9A9080] font-normal">({addr.phone})</span></p>
                          <p className="text-[#9A9080] mt-0.5">{addr.address}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Order History */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3">
              <FiShoppingBag className="text-[#C9973D] text-xl" />
              <h2 className="font-display text-2xl font-light text-[#EDE8DF]">Lịch sử đặt hàng ({orders.length})</h2>
            </div>

            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-20 animate-shimmer rounded-xl" />)}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[#C9973D]/20 bg-[#161510]/50 rounded-2xl">
                <FiShoppingBag className="text-4xl text-[#C9973D]/30 mx-auto mb-4" />
                <h3 className="font-display text-xl font-light text-[#EDE8DF] mb-1">Chưa có đơn hàng nào</h3>
                <p className="text-xs text-[#5C5850] uppercase tracking-wider font-mono mb-4">Giỏ hàng của bạn đang trống</p>
                <Link to="/" className="inline-block px-5 py-2.5 rounded-full bg-[#C9973D] text-[#0C0B09] text-xs font-mono uppercase tracking-widest hover:bg-[#DDB05A] transition-all">MUA HÀNG NGAY</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const isExpanded = expandedOrder === order.id;
                  return (
                    <div key={order.id} className="bg-[#161510] border border-[#C9973D]/12 rounded-xl overflow-hidden transition-all duration-300 hover:border-[#C9973D]/25">
                      <div onClick={() => toggleExpand(order.id)}
                        className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer select-none hover:bg-[#C9973D]/03 transition-all">
                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-x-6 gap-y-2">
                          <div>
                            <span className="block text-[10px] font-mono text-[#5C5850] uppercase tracking-wider">MÃ ĐƠN HÀNG</span>
                            <span className="text-sm font-semibold text-[#EDE8DF] font-mono">#{order.id}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-mono text-[#5C5850] uppercase tracking-wider">NGÀY ĐẶT</span>
                            <span className="text-xs text-[#9A9080] flex items-center gap-1"><FiCalendar className="text-[#C9973D]/60" /> {order.orderedDate}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-mono text-[#5C5850] uppercase tracking-wider">TỔNG TIỀN</span>
                            <span className="text-sm font-bold text-[#C9973D] flex items-center font-mono"><FiDollarSign />{order.total?.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0">
                          {getStatusBadge(order.status)}
                          <button className="p-1 rounded-full text-[#9A9080] hover:text-[#C9973D] transition-all">
                            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-5 pb-5 pt-4 border-t border-[#C9973D]/10 bg-[#0C0B09]/40 space-y-4">
                          {renderOrderStepper(order.status)}
                          <h4 className="text-[10px] uppercase font-mono tracking-wider text-[#5C5850] pb-2 border-b border-[#C9973D]/08">Chi tiết sản phẩm</h4>
                          <div className="divide-y divide-[#C9973D]/08">
                             {order.items?.map((item, idx) => {
                               const catalogProd = catalogProducts.find(p => p.productName === item.product?.productName);
                               const imgUrl = catalogProd?.imageUrl || item.product?.imageUrl || DEFAULT_IMAGE;
                               const prodId = catalogProd?.id || item.product?.id || item.product?.productId;
                               return (
                                 <div key={item.id || idx} className="py-3 flex items-center justify-between gap-4">
                                   <div className="flex items-center gap-3">
                                     <div className="w-12 h-12 rounded-lg bg-[#1E1C18] border border-[#C9973D]/12 overflow-hidden flex-shrink-0">
                                       <img src={imgUrl} alt={item.product?.productName}
                                         className="w-full h-full object-cover"
                                         onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }} />
                                     </div>
                                     <div>
                                       <Link to={`/product/${prodId}`}
                                         className="text-sm font-light text-[#EDE8DF] hover:text-[#C9973D] transition-colors line-clamp-1">
                                         {item.product?.productName || 'Sản phẩm'}
                                       </Link>
                                       <div className="flex items-center gap-2 mt-0.5">
                                         <span className="block text-[10px] text-[#9A9080] font-mono">SL: {item.quantity} × ${(item.product?.price || 0).toFixed(2)}</span>
                                         {item.selectedSize && (
                                           <span className="px-1.5 py-0.2 rounded bg-[#C9973D]/10 border border-[#C9973D]/20 text-[#C9973D] text-[8px] font-mono">
                                             {item.selectedSize}
                                           </span>
                                         )}
                                       </div>
                                     </div>
                                   </div>
                                   <span className="text-sm font-semibold text-[#EDE8DF] font-mono">${(item.subTotal || item.subtotal || ((item.product?.price || 0) * item.quantity))?.toFixed(2)}</span>
                                 </div>
                               );
                             })}
                          </div>
                          {order.status === 'PAYMENT_EXPECTED' && (
                            <div className="flex justify-end pt-4 border-t border-[#C9973D]/08">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelOrder(order.id);
                                }}
                                className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-mono transition-all uppercase tracking-wider active:scale-[0.98]"
                              >
                                HỦY ĐƠN HÀNG
                              </button>
                            </div>
                          )}
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
