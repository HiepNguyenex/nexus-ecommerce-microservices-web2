import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminAPI, orderAPI, productAPI, authAPI, couponAPI } from '../services/api';
import Navbar from '../components/Navbar';
import {
  FiDollarSign, FiBell, FiTrendingUp, FiShoppingBag, FiRefreshCw,
  FiCheckCircle, FiClock, FiTruck, FiXCircle, FiPlus, FiTrash2,
  FiEdit2, FiUserCheck, FiUserX, FiBox, FiUsers, FiX, FiLock,
  FiMail, FiCreditCard, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [revenue, setRevenue] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [logPage, setLogPage] = useState(1);
  const [logFilter, setLogFilter] = useState('ALL');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    id: null, name: '', price: '', description: '', category: 'Unisex', availability: 10, imageUrl: '',
    olfactoryFamily: '', concentration: 'EDP', topNotes: '', middleNotes: '', baseNotes: '', longevity: '', sillage: ''
  });
  const [newCoupon, setNewCoupon] = useState({
    code: '', discountPercent: 10, expirationDate: '', maxUses: 100, active: true
  });

  useEffect(() => {
    if (isAdmin) loadData();
    else setLoading(false);
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [revData, orderData, notifData, statsData, prodData, userData, couponData] = await Promise.allSettled([
        adminAPI.getRevenue(),
        orderAPI.getAll(),
        adminAPI.getNotificationLogs(),
        adminAPI.getNotificationStats(),
        productAPI.getAll(),
        authAPI.getUsers(),
        couponAPI.getAll(),
      ]);
      if (revData.status === 'fulfilled') setRevenue(revData.value);
      if (orderData.status === 'fulfilled') setOrders(orderData.value || []);
      if (notifData.status === 'fulfilled') setNotifications(notifData.value || []);
      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (prodData.status === 'fulfilled') setProducts(prodData.value || []);
      if (userData.status === 'fulfilled') setUsersList(userData.value || []);
      if (couponData.status === 'fulfilled') setCoupons(couponData.value || []);
    } catch {
      showToast('Không thể tải một số dữ liệu quản trị.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.expirationDate) {
      showToast('Vui lòng điền mã và ngày hết hạn.', 'error');
      return;
    }
    try {
      await couponAPI.add({
        code: newCoupon.code,
        discountPercent: Number(newCoupon.discountPercent),
        expirationDate: newCoupon.expirationDate,
        maxUses: Number(newCoupon.maxUses),
        usedCount: 0,
        active: newCoupon.active
      });
      showToast('Thêm mã giảm giá thành công!');
      setNewCoupon({ code: '', discountPercent: 10, expirationDate: '', maxUses: 100, active: true });
      loadData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Không thể thêm mã giảm giá.', 'error');
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await couponAPI.delete(id);
      showToast('Đã xóa mã giảm giá.');
      loadData();
    } catch {
      showToast('Không thể xóa mã giảm giá.', 'error');
    }
  };

  const handleToggleCoupon = async (id) => {
    try {
      await couponAPI.toggle(id);
      showToast('Đã thay đổi trạng thái mã giảm giá.');
      loadData();
    } catch {
      showToast('Không thể cập nhật trạng thái.', 'error');
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      showToast(`Đã cập nhật trạng thái đơn hàng #${orderId} thành ${status}`);
      loadData();
    } catch {
      showToast('Không thể cập nhật trạng thái đơn hàng.', 'error');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      showToast('Vui lòng điền tên và giá sản phẩm.', 'error');
      return;
    }
    try {
      const payload = {
        productName: newProduct.name,
        price: parseFloat(newProduct.price),
        discription: newProduct.description,
        category: newProduct.category,
        availability: parseInt(newProduct.availability),
        imageUrl: newProduct.imageUrl,
        olfactoryFamily: newProduct.olfactoryFamily,
        concentration: newProduct.concentration,
        topNotes: newProduct.topNotes,
        middleNotes: newProduct.middleNotes,
        baseNotes: newProduct.baseNotes,
        longevity: newProduct.longevity,
        sillage: newProduct.sillage,
      };
      if (newProduct.id) payload.id = newProduct.id;
      await productAPI.addProduct(payload);
      showToast(newProduct.id ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm mới thành công!');
      setIsAddModalOpen(false);
      setNewProduct({
        id: null, name: '', price: '', description: '', category: 'Unisex', availability: 10, imageUrl: '',
        olfactoryFamily: '', concentration: 'EDP', topNotes: '', middleNotes: '', baseNotes: '', longevity: '', sillage: ''
      });
      loadData();
    } catch {
      showToast(newProduct.id ? 'Không thể cập nhật sản phẩm.' : 'Không thể thêm sản phẩm mới.', 'error');
    }
  };

  const handleEditClick = (prod) => {
    setNewProduct({
      id: prod.id, name: prod.productName, price: prod.price,
      description: prod.discription || '', category: prod.category,
      availability: prod.availability, imageUrl: prod.imageUrl || '',
      olfactoryFamily: prod.olfactoryFamily || '', concentration: prod.concentration || 'EDP',
      topNotes: prod.topNotes || '', middleNotes: prod.middleNotes || '', baseNotes: prod.baseNotes || '',
      longevity: prod.longevity || '', sillage: prod.sillage || ''
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await productAPI.deleteProduct(id);
      showToast('Đã xóa sản phẩm thành công!');
      loadData();
    } catch {
      showToast('Không thể xóa sản phẩm.', 'error');
    }
  };

  const handleToggleUserStatus = async (userId, currentActive) => {
    try {
      const newActive = currentActive === 1 ? 0 : 1;
      await authAPI.toggleUserStatus(userId, newActive);
      showToast(newActive === 1 ? 'Đã kích hoạt tài khoản thành công!' : 'Đã khóa tài khoản thành công!');
      loadData();
    } catch {
      showToast('Không thể cập nhật trạng thái người dùng.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'PAYMENT_EXPECTED': 'bg-[#C9973D]/15 text-[#C9973D] border-[#C9973D]/30',
      'PAID':             'bg-blue-500/15 text-blue-400 border-blue-500/30',
      'SHIPPED':          'bg-purple-500/15 text-purple-400 border-purple-500/30',
      'COMPLETED':        'bg-[#6B9E78]/15 text-[#6B9E78] border-[#6B9E78]/30',
      'CANCELLED':        'bg-rose-500/15 text-rose-400 border-rose-500/30',
    };
    return styles[status] || 'bg-[#1E1C18] text-[#9A9080] border-[#C9973D]/15';
  };

  /* ── Not admin ── */
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0C0B09] bg-grid">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-40 gap-4">
          <div className="w-16 h-16 rounded-full bg-[#C9973D]/10 border border-[#C9973D]/20 flex items-center justify-center">
            <FiLock className="text-[#C9973D] text-2xl" />
          </div>
          <h2 className="font-display text-2xl font-light text-[#EDE8DF]">Truy cập bị từ chối</h2>
          <p className="text-[#9A9080] text-sm">Bạn cần quyền Admin để truy cập trang này.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard',     label: 'Tổng Quan',   icon: FiTrendingUp },
    { id: 'orders',        label: 'Đơn Hàng',    icon: FiShoppingBag },
    { id: 'products',      label: 'Sản Phẩm',    icon: FiBox },
    { id: 'users',         label: 'Người Dùng',  icon: FiUsers },
    { id: 'coupons',       label: 'Mã Giảm Giá', icon: FiDollarSign },
    { id: 'notifications', label: 'Logs Kafka',  icon: FiBell },
  ];

  /* ── Input class shared ── */
  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-[#C9973D]/15 focus:border-[#C9973D]/50 bg-[#0C0B09] text-[#EDE8DF] text-sm outline-none transition-all placeholder-[#5C5850]";

  return (
    <div className="min-h-screen bg-[#0C0B09] bg-grid pb-20 text-[#EDE8DF]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-24">
        {/* Page title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-light text-[#EDE8DF] tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-[#9A9080] mt-1">Hệ thống quản lý bán hàng & dữ liệu microservices.</p>
          </div>
          <button onClick={loadData}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#161510] border border-[#C9973D]/20 text-[#9A9080] hover:text-[#C9973D] hover:border-[#C9973D]/40 transition-all text-sm font-medium">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Làm mới hệ thống
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[#C9973D]/12 pb-4">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-[#C9973D] text-[#0C0B09] font-semibold shadow-sm'
                  : 'text-[#9A9080] hover:text-[#EDE8DF] hover:bg-[#C9973D]/10'
              }`}>
              <tab.icon /> {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#C9973D]/30 border-t-[#C9973D] rounded-full animate-spin" />
          </div>
        )}

        {!loading && (
          <div className="animate-fade-in">

            {/* ─── 1. DASHBOARD ─── */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { title: 'Tổng Doanh Thu',  value: revenue ? `$${revenue.totalRevenue?.toFixed(2) || '0.00'}` : '$0.00', icon: FiDollarSign, color: 'bg-[#6B9E78]/15 text-[#6B9E78]' },
                    { title: 'Tổng Đơn Hàng',   value: orders.length || 0,                                                    icon: FiShoppingBag, color: 'bg-blue-500/15 text-blue-400' },
                    { title: 'Tổng Sản Phẩm',   value: products.length || 0,                                                  icon: FiBox,         color: 'bg-[#C9973D]/15 text-[#C9973D]' },
                    { title: 'Kafka Event Logs', value: stats?.totalLogs || notifications.length || 0,                        icon: FiBell,        color: 'bg-rose-500/15 text-rose-400' },
                  ].map((card, idx) => (
                    <div key={idx} className="bg-[#161510] border border-[#C9973D]/12 rounded-2xl p-6 hover:border-[#C9973D]/25 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[#9A9080] text-sm">{card.title}</span>
                        <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                          <card.icon className="text-lg" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-[#EDE8DF] tracking-tight font-mono">{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* Revenue Details */}
                <div className="bg-[#161510] border border-[#C9973D]/12 rounded-2xl p-6">
                  <h3 className="font-display text-lg font-medium text-[#EDE8DF] mb-4">Chi Tiết Doanh Thu (Hệ thống Order-Service)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Tổng Thu',  val: `$${revenue?.totalRevenue?.toFixed(2) || '0.00'}` },
                      { label: 'Từ Ngày',   val: revenue?.fromDate || '---' },
                      { label: 'Đến Ngày',  val: revenue?.toDate   || '---' },
                    ].map(item => (
                      <div key={item.label} className="p-4 rounded-xl bg-[#0C0B09] border border-[#C9973D]/08">
                        <p className="text-xs text-[#5C5850] uppercase tracking-wider font-mono">{item.label}</p>
                        <p className="text-xl font-bold text-[#EDE8DF] mt-1 font-mono">{item.val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analytics Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Revenue by Status */}
                  <div className="bg-[#161510] border border-[#C9973D]/12 rounded-2xl p-6">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#9A9080] mb-5">Phân Tích Doanh Thu Theo Trạng Thái</h3>
                    <div className="space-y-4">
                      {[
                        { status: 'PAID',             label: 'Đã thanh toán',   cls: 'bg-[#6B9E78]' },
                        { status: 'PAYMENT_EXPECTED', label: 'Chờ thanh toán',  cls: 'bg-[#C9973D]' },
                        { status: 'SHIPPED',          label: 'Đang giao',       cls: 'bg-purple-400' },
                        { status: 'COMPLETED',        label: 'Hoàn thành',      cls: 'bg-blue-400' },
                      ].map(({ status, label, cls }) => {
                        const statusRevenue = orders.filter(o => o.status === status).reduce((s, o) => s + (o.total || 0), 0);
                        const maxVal = orders.reduce((s, o) => s + (o.total || 0), 0) || 1;
                        const pct = Math.min(100, Math.round((statusRevenue / maxVal) * 100));
                        return (
                          <div key={status} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-[#EDE8DF]">{label}</span>
                              <span className="font-mono text-[#9A9080]">${statusRevenue.toFixed(2)} ({pct}%)</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[#1E1C18] overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-1000 ${cls}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Product Category Distribution */}
                  <div className="bg-[#161510] border border-[#C9973D]/12 rounded-2xl p-6">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#9A9080] mb-5">Cơ Cấu Danh Mục Sản Phẩm</h3>
                    <div className="space-y-4">
                      {[
                        { cat: 'Men',    label: 'Nước Hoa Nam',    cls: 'bg-[#C9973D]' },
                        { cat: 'Women',  label: 'Nước Hoa Nữ',    cls: 'bg-pink-400' },
                        { cat: 'Unisex', label: 'Nước Hoa Unisex', cls: 'bg-[#6B9E78]' },
                      ].map(({ cat, label, cls }) => {
                        const count = products.filter(p => p.category === cat).length;
                        const pct = Math.round((count / (products.length || 1)) * 100);
                        return (
                          <div key={cat} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-[#EDE8DF]">{label}</span>
                              <span className="font-mono text-[#9A9080]">{count} sản phẩm ({pct}%)</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[#1E1C18] overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-1000 ${cls}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Kafka Stats */}
                {stats && (
                  <div className="bg-[#161510] border border-[#C9973D]/12 rounded-2xl p-6">
                    <h3 className="font-display text-lg font-medium text-[#EDE8DF] mb-4">Báo Cáo Sự Kiện Kafka Cloud</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { label: 'Tổng số logs sự kiện',        value: stats.totalLogs,       cls: 'border-[#C9973D]/15' },
                        { label: 'Sự kiện giá trị lớn (High-Value)', value: stats.highValueCount,   cls: 'border-rose-500/30 text-rose-400' },
                        { label: 'Cảnh báo của Admin',          value: stats.adminAlertCount, cls: 'border-[#C9973D]/30 text-[#C9973D]' },
                      ].map((s, idx) => (
                        <div key={idx} className={`p-4 rounded-xl bg-[#0C0B09] border ${s.cls}`}>
                          <p className="text-xs text-[#5C5850] uppercase tracking-wider font-mono">{s.label}</p>
                          <p className={`text-2xl font-bold mt-1 font-mono ${s.cls.includes('text') ? '' : 'text-[#EDE8DF]'}`}>{s.value || 0}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── 2. ORDERS ─── */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-20 bg-[#161510] border border-[#C9973D]/12 rounded-2xl">
                    <FiShoppingBag className="text-5xl text-[#C9973D]/30 mx-auto mb-4" />
                    <p className="text-[#9A9080] text-sm">Chưa có đơn hàng nào trong hệ thống.</p>
                  </div>
                ) : (
                  [...orders].reverse().map((order) => (
                    <div key={order.id} className="bg-[#161510] border border-[#C9973D]/12 rounded-xl p-5 hover:border-[#C9973D]/25 transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-semibold text-[#EDE8DF]">Đơn hàng #{order.id}</span>
                            <span className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${getStatusBadge(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#9A9080]">
                            Khách hàng ID: {order.userId} · Ngày đặt: {order.orderDate || 'Chưa cập nhật'}
                          </p>
                          {order.items && order.items.length > 0 && (
                            <div className="mt-2 text-xs text-[#EDE8DF] bg-[#0C0B09] border border-[#C9973D]/08 rounded-lg p-2.5 max-w-md">
                              <p className="font-bold text-[#5C5850] mb-1.5 uppercase tracking-wider text-[10px] font-mono">Sản Phẩm Đã Mua:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {order.items.map((item, idx) => (
                                  <li key={idx}>
                                    <span className="font-semibold text-[#EDE8DF]">{item.product?.productName}</span>
                                    <span className="text-[#9A9080]"> (x{item.quantity})</span>
                                    <span className="ml-1 text-[#9A9080]">- ${item.subTotal?.toFixed(2)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-bold text-[#C9973D] font-mono">${order.total?.toFixed(2)}</span>
                          <div className="flex gap-2">
                            {['PAYMENT_EXPECTED', 'PAID'].includes(order.status) && (
                              <button onClick={() => updateStatus(order.id, 'SHIPPED')}
                                className="px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/25 text-xs font-semibold hover:bg-purple-500/20 active:scale-95 transition-all flex items-center gap-1">
                                <FiTruck /> Giao Hàng
                              </button>
                            )}
                            {order.status === 'SHIPPED' && (
                              <button onClick={() => updateStatus(order.id, 'COMPLETED')}
                                className="px-3.5 py-1.5 rounded-full bg-[#6B9E78]/10 text-[#6B9E78] border border-[#6B9E78]/25 text-xs font-semibold hover:bg-[#6B9E78]/20 active:scale-95 transition-all flex items-center gap-1">
                                <FiCheckCircle /> Hoàn Tất
                              </button>
                            )}
                            {['PAYMENT_EXPECTED', 'PAID'].includes(order.status) && (
                              <button onClick={() => updateStatus(order.id, 'CANCELLED')}
                                className="px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/25 text-xs font-semibold hover:bg-rose-500/20 active:scale-95 transition-all flex items-center gap-1">
                                <FiXCircle /> Hủy Đơn
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ─── 3. PRODUCTS ─── */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-light text-[#EDE8DF]">Danh Sách Sản Phẩm ({products.length})</h3>
                  <button
                    onClick={() => { setNewProduct({ name: '', price: '', description: '', category: 'Unisex', availability: 10, imageUrl: '' }); setIsAddModalOpen(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C9973D] text-[#0C0B09] hover:bg-[#DDB05A] active:scale-95 transition-all text-sm font-semibold shadow-[0_0_16px_rgba(201,151,61,0.2)]">
                    <FiPlus /> Thêm sản phẩm mới
                  </button>
                </div>

                <div className="bg-[#161510] border border-[#C9973D]/12 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-[#C9973D]/10 text-[#9A9080] text-xs font-mono uppercase tracking-wider">
                          <th className="p-4 w-16">ID</th>
                          <th className="p-4">Tên Sản Phẩm</th>
                          <th className="p-4">Phân Loại</th>
                          <th className="p-4 text-right">Giá Bán</th>
                          <th className="p-4 text-center">Tồn Kho</th>
                          <th className="p-4 w-20 text-center">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C9973D]/06">
                        {products.map((prod) => (
                          <tr key={prod.id} className="hover:bg-[#C9973D]/03 transition-all text-[#EDE8DF]">
                            <td className="p-4 font-mono text-[#5C5850] text-xs">{prod.id}</td>
                            <td className="p-4 font-medium">{prod.productName}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#C9973D]/12 text-[#C9973D] border border-[#C9973D]/20">
                                {prod.category}
                              </span>
                            </td>
                            <td className="p-4 text-right font-semibold text-[#C9973D] font-mono">${prod.price?.toFixed(2)}</td>
                            <td className="p-4 text-center font-medium font-mono">{prod.availability}</td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => handleEditClick(prod)}
                                  className="p-2 rounded-xl text-blue-400 hover:bg-blue-500/10 active:scale-90 transition-all" title="Sửa sản phẩm">
                                  <FiEdit2 />
                                </button>
                                <button onClick={() => handleDeleteProduct(prod.id)}
                                  className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 active:scale-90 transition-all" title="Xóa sản phẩm">
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ─── 4. USERS ─── */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <h3 className="font-display text-xl font-light text-[#EDE8DF]">Danh Sách Tài Khoản ({usersList.length})</h3>
                <div className="bg-[#161510] border border-[#C9973D]/12 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-[#C9973D]/10 text-[#9A9080] text-xs font-mono uppercase tracking-wider">
                          <th className="p-4 w-16">ID</th>
                          <th className="p-4">Tên Đăng Nhập</th>
                          <th className="p-4">Vai Trò</th>
                          <th className="p-4">Email</th>
                          <th className="p-4 text-center">Trạng Thái</th>
                          <th className="p-4 w-32 text-center">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C9973D]/06">
                        {usersList.map((usr) => (
                          <tr key={usr.id} className="hover:bg-[#C9973D]/03 transition-all text-[#EDE8DF]">
                            <td className="p-4 font-mono text-[#5C5850] text-xs">{usr.id}</td>
                            <td className="p-4 font-medium">{usr.userName}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                usr.role?.roleName === 'ROLE_ADMIN'
                                  ? 'bg-[#C9973D]/15 text-[#C9973D] border-[#C9973D]/30'
                                  : 'bg-[#1E1C18] text-[#9A9080] border-[#C9973D]/15'
                              }`}>
                                {usr.role?.roleName || 'N/A'}
                              </span>
                            </td>
                            <td className="p-4 text-[#9A9080] text-xs">{usr.userDetails?.email || 'N/A'}</td>
                            <td className="p-4 text-center">
                              {usr.active === 1
                                ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-[#6B9E78]/15 text-[#6B9E78] border border-[#6B9E78]/30 font-semibold">Hoạt Động</span>
                                : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold">Đang Khóa</span>
                              }
                            </td>
                            <td className="p-4 text-center">
                              {usr.role?.roleName !== 'ROLE_ADMIN' ? (
                                usr.active === 1 ? (
                                  <button onClick={() => handleToggleUserStatus(usr.id, usr.active)}
                                    className="flex items-center gap-1 mx-auto px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold hover:bg-rose-500/20 active:scale-95 transition-all">
                                    <FiUserX /> Khóa Acc
                                  </button>
                                ) : (
                                  <button onClick={() => handleToggleUserStatus(usr.id, usr.active)}
                                    className="flex items-center gap-1 mx-auto px-3 py-1.5 rounded-full bg-[#6B9E78]/10 text-[#6B9E78] border border-[#6B9E78]/20 text-xs font-semibold hover:bg-[#6B9E78]/20 active:scale-95 transition-all">
                                    <FiUserCheck /> Mở Khóa
                                  </button>
                                )
                              ) : (
                                <span className="text-xs text-[#5C5850] italic">Hệ thống</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ─── 5. KAFKA LOGS ─── */}
            {activeTab === 'notifications' && (() => {
              const formatLogTime = (ts) => {
                if (!ts) return 'N/A';
                try {
                  const date = new Date(ts);
                  if (isNaN(date.getTime())) return ts;
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const year = date.getFullYear();
                  return `${hours}:${minutes} - ${day}/${month}/${year}`;
                } catch {
                  return ts;
                }
              };

              const getLogIcon = (msg) => {
                const lower = msg?.toLowerCase() || '';
                if (lower.includes('email')) return FiMail;
                if (lower.includes('thanh toán') || lower.includes('payment') || lower.includes('giao dịch')) return FiCreditCard;
                if (lower.includes('đơn hàng') || lower.includes('order')) return FiShoppingBag;
                return FiBell;
              };

              const getLogColor = (msg, type) => {
                if (type === 'HIGH-VALUE') return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
                const lower = msg?.toLowerCase() || '';
                if (lower.includes('email')) return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
                if (lower.includes('thanh toán') || lower.includes('payment') || lower.includes('giao dịch')) return 'bg-[#6B9E78]/10 border-[#6B9E78]/20 text-[#6B9E78]';
                if (lower.includes('đơn hàng') || lower.includes('order')) return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
                return 'bg-[#C9973D]/10 border-[#C9973D]/20 text-[#C9973D]';
              };

              const filteredLogs = notifications.filter(notif => {
                const msg = notif.message?.toLowerCase() || '';
                if (logFilter === 'ALL') return true;
                if (logFilter === 'EMAIL') return msg.includes('email');
                if (logFilter === 'ORDER') return msg.includes('đơn hàng') || msg.includes('order');
                if (logFilter === 'PAYMENT') return msg.includes('thanh toán') || msg.includes('payment') || msg.includes('giao dịch');
                return true;
              });

              const logPageSize = 6;
              const totalLogPages = Math.ceil(filteredLogs.length / logPageSize);
              const activeLogPage = Math.min(logPage, Math.max(1, totalLogPages));
              const startIndex = (activeLogPage - 1) * logPageSize;
              const reversedLogs = [...filteredLogs].reverse();
              const currentLogs = reversedLogs.slice(startIndex, startIndex + logPageSize);

              return (
                <div className="space-y-6">
                  {/* Filter Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161510] border border-[#C9973D]/12 rounded-2xl p-4">
                    <div>
                      <h3 className="font-display text-lg font-medium text-[#EDE8DF]">Kafka Cloud Event Log Feed</h3>
                      <p className="text-xs text-[#9A9080] mt-0.5">Giám sát các sự kiện microservices phát sinh thời gian thực</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { key: 'ALL', label: 'Tất Cả', icon: FiBell },
                        { key: 'ORDER', label: 'Đơn Hàng', icon: FiShoppingBag },
                        { key: 'PAYMENT', label: 'Thanh Toán', icon: FiCreditCard },
                        { key: 'EMAIL', label: 'Emails', icon: FiMail }
                      ].map(filter => {
                        const isSelected = logFilter === filter.key;
                        const Icon = filter.icon;
                        return (
                          <button
                            key={filter.key}
                            onClick={() => {
                              setLogFilter(filter.key);
                              setLogPage(1);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                              isSelected
                                ? 'bg-[#C9973D] border-[#C9973D] text-[#0C0B09] font-bold'
                                : 'bg-[#0C0B09]/40 border-[#C9973D]/10 text-[#9A9080] hover:text-[#C9973D] hover:border-[#C9973D]/25'
                            }`}
                          >
                            <Icon className="text-xs" />
                            {filter.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Log List */}
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-20 bg-[#161510] border border-[#C9973D]/12 rounded-2xl">
                      <FiBell className="text-4xl text-[#C9973D]/30 mx-auto mb-4" />
                      <p className="text-[#9A9080] text-sm">Không tìm thấy log thông báo nào trùng khớp.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentLogs.map((notif, idx) => {
                        const Icon = getLogIcon(notif.message);
                        const colorClass = getLogColor(notif.message, notif.type);
                        return (
                          <div key={notif.id || idx} className="bg-[#161510] border border-[#C9973D]/08 rounded-xl p-4 flex items-start gap-4 hover:border-[#C9973D]/20 transition-all">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${colorClass}`}>
                              <Icon className="text-sm" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[#EDE8DF] leading-relaxed font-light">{notif.message}</p>
                              <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-[#5C5850]">
                                <span className="px-1.5 py-0.2 bg-[#0C0B09] border border-[#C9973D]/08 rounded text-[#9A9080]">
                                  Tới: {notif.target || 'ADMIN'}
                                </span>
                                <span>•</span>
                                <span>{formatLogTime(notif.timestamp || notif.createdAt)}</span>
                              </div>
                            </div>
                            {notif.type === 'HIGH-VALUE' && (
                              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold font-mono flex-shrink-0">
                                HIGH-VALUE
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {/* Pagination Bar */}
                      {totalLogPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#C9973D]/10 pt-4 mt-6">
                          <span className="text-xs text-[#5C5850] font-mono">
                            Hiển thị {startIndex + 1}-{Math.min(startIndex + logPageSize, filteredLogs.length)} trên tổng số {filteredLogs.length} logs
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setLogPage(prev => Math.max(1, prev - 1))}
                              disabled={activeLogPage === 1}
                              className="p-2 rounded-lg border border-[#C9973D]/15 text-[#9A9080] hover:text-[#C9973D] hover:border-[#C9973D]/30 transition-all disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <FiChevronLeft />
                            </button>
                            {[...Array(totalLogPages)].map((_, idx) => {
                              const pageNum = idx + 1;
                              const isNearActive = Math.abs(pageNum - activeLogPage) <= 1;
                              if (pageNum === 1 || pageNum === totalLogPages || isNearActive) {
                                return (
                                  <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => setLogPage(pageNum)}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                                      activeLogPage === pageNum
                                        ? 'bg-[#C9973D] border-[#C9973D] text-[#0C0B09] font-bold'
                                        : 'bg-transparent border-[#C9973D]/15 text-[#9A9080] hover:border-[#C9973D]/30'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              }
                              if (pageNum === 2 || pageNum === totalLogPages - 1) {
                                return <span key={pageNum} className="text-[#5C5850] font-mono text-xs px-1">...</span>;
                              }
                              return null;
                            })}
                            <button
                              type="button"
                              onClick={() => setLogPage(prev => Math.min(totalLogPages, prev + 1))}
                              disabled={activeLogPage === totalLogPages}
                              className="p-2 rounded-lg border border-[#C9973D]/15 text-[#9A9080] hover:text-[#C9973D] hover:border-[#C9973D]/30 transition-all disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <FiChevronRight />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ─── 6. COUPONS ─── */}
            {activeTab === 'coupons' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Add Coupon Form */}
                  <div className="lg:col-span-1 bg-[#161510] border border-[#C9973D]/15 rounded-2xl p-6">
                    <h3 className="font-display text-lg font-medium text-[#EDE8DF] mb-5">Tạo Mã Giảm Giá Mới</h3>
                    <form onSubmit={handleAddCoupon} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#9A9080] uppercase tracking-wider mb-1">Mã Code (In Hoa)</label>
                        <input type="text" required placeholder="Ví dụ: WINTER20"
                          value={newCoupon.code}
                          onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                          className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#9A9080] uppercase tracking-wider mb-1">Phần Trăm Chiết Khấu (%)</label>
                        <input type="number" min="1" max="100" required
                          value={newCoupon.discountPercent}
                          onChange={(e) => setNewCoupon({ ...newCoupon, discountPercent: Number(e.target.value) })}
                          className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#9A9080] uppercase tracking-wider mb-1">Ngày Hết Hạn</label>
                        <input type="date" required
                          value={newCoupon.expirationDate}
                          onChange={(e) => setNewCoupon({ ...newCoupon, expirationDate: e.target.value })}
                          className={inputCls} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#9A9080] uppercase tracking-wider mb-1">Lượt Sử Dụng Tối Đa</label>
                        <input type="number" min="1" required
                          value={newCoupon.maxUses}
                          onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: Number(e.target.value) })}
                          className={inputCls} />
                      </div>
                      <button type="submit"
                        className="w-full py-3 rounded-full bg-[#C9973D] text-[#0C0B09] hover:bg-[#DDB05A] active:scale-95 transition-all text-sm font-semibold mt-2">
                        Thêm Mã Giảm Giá
                      </button>
                    </form>
                  </div>

                  {/* Coupon List */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-display text-xl font-light text-[#EDE8DF]">Mã Khuyến Mãi Hiện Có ({coupons.length})</h3>
                    <div className="bg-[#161510] border border-[#C9973D]/12 rounded-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-[#C9973D]/10 text-[#9A9080] text-xs font-mono uppercase tracking-wider">
                              <th className="p-4">Mã Code</th>
                              <th className="p-4 text-center">Giảm Giá</th>
                              <th className="p-4">Ngày Hết Hạn</th>
                              <th className="p-4 text-center">Lượt Dùng</th>
                              <th className="p-4 text-center">Trạng Thái</th>
                              <th className="p-4 text-center">Thao Tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#C9973D]/06">
                            {coupons.map((c) => (
                              <tr key={c.id} className="hover:bg-[#C9973D]/03 transition-all text-[#EDE8DF]">
                                <td className="p-4 font-mono font-bold text-[#C9973D]">{c.code}</td>
                                <td className="p-4 text-center font-mono text-[#6B9E78] font-semibold">{c.discountPercent}%</td>
                                <td className="p-4 font-mono text-xs text-[#9A9080]">{c.expirationDate}</td>
                                <td className="p-4 text-center font-mono text-xs">{c.usedCount} / {c.maxUses}</td>
                                <td className="p-4 text-center">
                                  <button onClick={() => handleToggleCoupon(c.id)}
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
                                      c.active
                                        ? 'bg-[#6B9E78]/15 text-[#6B9E78] border-[#6B9E78]/30 hover:bg-[#6B9E78]/25'
                                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
                                    }`}>
                                    {c.active ? 'Active' : 'Locked'}
                                  </button>
                                </td>
                                <td className="p-4 text-center">
                                  <button onClick={() => handleDeleteCoupon(c.id)}
                                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 active:scale-90 transition-all" title="Xóa mã">
                                    <FiTrash2 />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* ─── ADD / EDIT PRODUCT MODAL ─── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161510] border border-[#C9973D]/15 max-w-2xl w-full p-6 rounded-2xl shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 border-b border-[#C9973D]/10 pb-3">
              <h3 className="font-display text-xl font-medium text-[#EDE8DF]">
                {newProduct.id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#C9973D]/10 transition-all text-[#9A9080] hover:text-[#EDE8DF]">
                <FiX />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              {/* Row 1: Tên sản phẩm */}
              <div>
                <label className="block text-xs font-semibold text-[#9A9080] uppercase tracking-wider mb-1">Tên sản phẩm</label>
                <input type="text" required placeholder="Ví dụ: Le Labo Santal 33"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className={inputCls} />
              </div>

              {/* Row 2: Giá bán & Tồn kho & Phân loại */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9A9080] uppercase tracking-wider mb-1">Giá bán ($)</label>
                  <input type="number" step="0.01" required placeholder="299.99"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9A9080] uppercase tracking-wider mb-1">Tồn kho</label>
                  <input type="number" required placeholder="10"
                    value={newProduct.availability}
                    onChange={(e) => setNewProduct({ ...newProduct, availability: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9A9080] uppercase tracking-wider mb-1">Phân loại</label>
                  <select value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className={inputCls}>
                    <option value="Men">Nam (Men)</option>
                    <option value="Women">Nữ (Women)</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Nhóm hương & Nồng độ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9A9080] uppercase tracking-wider mb-1">Nhóm hương (Olfactory Family)</label>
                  <input type="text" placeholder="Ví dụ: Woody Floral Musk, Oriental, Citrus..."
                    value={newProduct.olfactoryFamily}
                    onChange={(e) => setNewProduct({ ...newProduct, olfactoryFamily: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9A9080] uppercase tracking-wider mb-1">Nồng độ (Concentration)</label>
                  <select value={newProduct.concentration}
                    onChange={(e) => setNewProduct({ ...newProduct, concentration: e.target.value })}
                    className={inputCls}>
                    <option value="EDP">Eau de Parfum (EDP)</option>
                    <option value="EDT">Eau de Toilette (EDT)</option>
                    <option value="Parfum">Parfum / Extrait</option>
                    <option value="Cologne">Eau de Cologne (EDC)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Hương đầu, giữa, cuối */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9A9080] uppercase tracking-wider mb-1">Hương đầu (Top Notes)</label>
                  <input type="text" placeholder="Lavender, Cam Tươi..."
                    value={newProduct.topNotes}
                    onChange={(e) => setNewProduct({ ...newProduct, topNotes: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9A9080] uppercase tracking-wider mb-1">Hương giữa (Heart Notes)</label>
                  <input type="text" placeholder="Iris, Jasmine..."
                    value={newProduct.middleNotes}
                    onChange={(e) => setNewProduct({ ...newProduct, middleNotes: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9A9080] uppercase tracking-wider mb-1">Hương cuối (Base Notes)</label>
                  <input type="text" placeholder="Sandalwood, Amber..."
                    value={newProduct.baseNotes}
                    onChange={(e) => setNewProduct({ ...newProduct, baseNotes: e.target.value })}
                    className={inputCls} />
                </div>
              </div>

              {/* Row 5: Độ lưu hương & Độ tỏa hương */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9A9080] uppercase tracking-wider mb-1">Độ lưu hương (Longevity)</label>
                  <input type="text" placeholder="Ví dụ: 8-12 giờ, 6-8 giờ..."
                    value={newProduct.longevity}
                    onChange={(e) => setNewProduct({ ...newProduct, longevity: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9A9080] uppercase tracking-wider mb-1">Độ tỏa hương (Sillage)</label>
                  <input type="text" placeholder="Ví dụ: Trong vòng 1 cánh tay, Mạnh..."
                    value={newProduct.sillage}
                    onChange={(e) => setNewProduct({ ...newProduct, sillage: e.target.value })}
                    className={inputCls} />
                </div>
              </div>

              {/* Row 6: Hình ảnh */}
              <div>
                <label className="block text-xs font-semibold text-[#9A9080] uppercase tracking-wider mb-1">Hình ảnh (URL)</label>
                <div className="flex items-center gap-3">
                  {newProduct.imageUrl && (
                    <img src={newProduct.imageUrl} alt="Preview"
                      className="w-12 h-12 object-cover rounded-xl border border-[#C9973D]/12" />
                  )}
                  <input type="text" placeholder="https://... hoặc để trống"
                    value={newProduct.imageUrl || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    className={`${inputCls} flex-1`} />
                </div>
              </div>

              {/* Row 7: Mô tả */}
              <div>
                <label className="block text-xs font-semibold text-[#9A9080] uppercase tracking-wider mb-1">Mô tả sản phẩm</label>
                <textarea rows="3" placeholder="Mô tả tóm tắt tính năng sản phẩm..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className={`${inputCls} resize-none`} />
              </div>

              <div className="pt-3 border-t border-[#C9973D]/10">
                <button type="submit"
                  className="w-full py-3.5 rounded-full bg-[#C9973D] text-[#0C0B09] font-semibold text-sm hover:bg-[#DDB05A] active:scale-[0.98] transition-all shadow-[0_0_16px_rgba(201,151,61,0.2)]">
                  Lưu sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
