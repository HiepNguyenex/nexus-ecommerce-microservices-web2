import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminAPI, orderAPI, productAPI, authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { 
  FiDollarSign, 
  FiBell, 
  FiTrendingUp, 
  FiShoppingBag, 
  FiRefreshCw, 
  FiCheckCircle, 
  FiClock, 
  FiTruck, 
  FiXCircle, 
  FiPlus, 
  FiTrash2, 
  FiUserCheck, 
  FiUserX, 
  FiBox, 
  FiUsers, 
  FiX 
} from 'react-icons/fi';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [revenue, setRevenue] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for Add Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Electronics',
    availability: 10
  });

  useEffect(() => {
    if (isAdmin) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [revData, orderData, notifData, statsData, prodData, userData] = await Promise.allSettled([
        adminAPI.getRevenue(),
        orderAPI.getAll(),
        adminAPI.getNotificationLogs(),
        adminAPI.getNotificationStats(),
        productAPI.getAll(),
        authAPI.getUsers(),
      ]);

      if (revData.status === 'fulfilled') setRevenue(revData.value);
      if (orderData.status === 'fulfilled') setOrders(orderData.value || []);
      if (notifData.status === 'fulfilled') setNotifications(notifData.value || []);
      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (prodData.status === 'fulfilled') setProducts(prodData.value || []);
      if (userData.status === 'fulfilled') setUsersList(userData.value || []);
    } catch {
      showToast('Không thể tải một số dữ liệu quản trị.', 'error');
    } finally {
      setLoading(false);
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
      };
      await productAPI.addProduct(payload);
      showToast('Thêm sản phẩm mới thành công!');
      setIsAddModalOpen(false);
      setNewProduct({ name: '', price: '', description: '', category: 'Electronics', availability: 10 });
      loadData();
    } catch (err) {
      showToast('Không thể thêm sản phẩm mới.', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await productAPI.deleteProduct(id);
      showToast('Đã xóa sản phẩm thành công!');
      loadData();
    } catch (err) {
      showToast('Không thể xóa sản phẩm.', 'error');
    }
  };

  const handleToggleUserStatus = async (userId, currentActive) => {
    try {
      const newActive = currentActive === 1 ? 0 : 1;
      await authAPI.toggleUserStatus(userId, newActive);
      showToast(newActive === 1 ? 'Đã kích hoạt tài khoản thành công!' : 'Đã khóa tài khoản thành công!');
      loadData();
    } catch (err) {
      showToast('Không thể cập nhật trạng thái người dùng.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'PAYMENT_EXPECTED': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      'PAID': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'SHIPPED': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      'COMPLETED': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      'CANCELLED': 'bg-red-500/10 text-red-600 border-red-500/20',
    };
    return styles[status] || 'bg-slate-500/10 text-slate-600 border-slate-500/20';
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#fffaf6] bg-grid">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32">
          <div className="text-6xl mb-4 animate-float">🔒</div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">Truy cập bị từ chối</h2>
          <p className="text-[#8a8480]">Bạn cần quyền Admin để truy cập trang này.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Tổng Quan', icon: FiTrendingUp },
    { id: 'orders', label: 'Đơn Hàng', icon: FiShoppingBag },
    { id: 'products', label: 'Sản Phẩm', icon: FiBox },
    { id: 'users', label: 'Người Dùng', icon: FiUsers },
    { id: 'notifications', label: 'Logs Kafka', icon: FiBell },
  ];

  return (
    <div className="min-h-screen bg-[#fffaf6] bg-grid pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a1a] tracking-tight">🔒 Admin Dashboard</h1>
            <p className="text-sm text-[#8a8480]">Hệ thống quản lý bán hàng & dữ liệu microservices.</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full glass text-[#5a5550] hover:text-[#1a1a1a] hover:shadow-md transition-all text-sm font-medium"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Làm mới hệ thống
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[#dbccb8]/20 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#dbccb8] to-[#c9b8a0] text-[#1a1a1a] shadow-sm'
                  : 'text-[#8a8480] hover:text-[#1a1a1a] hover:bg-black/[0.02]'
              }`}
            >
              <tab.icon /> {tab.label}
            </button>
          ))}
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#dbccb8] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* CONTENT CHUNKS */}
        {!loading && (
          <div className="animate-fade-in">
            {/* 1. DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: 'Tổng Doanh Thu', value: revenue ? `$${revenue.totalRevenue?.toFixed(2) || '0.00'}` : '$0.00', icon: FiDollarSign, color: 'bg-emerald-500/10 text-emerald-600' },
                    { title: 'Tổng Đơn Hàng', value: orders.length || 0, icon: FiShoppingBag, color: 'bg-blue-500/10 text-blue-600' },
                    { title: 'Tổng Sản Phẩm', value: products.length || 0, icon: FiBox, color: 'bg-amber-500/10 text-amber-600' },
                    { title: 'Kafka Event Logs', value: stats?.totalLogs || notifications.length || 0, icon: FiBell, color: 'bg-rose-500/10 text-rose-600' },
                  ].map((card, idx) => (
                    <div key={idx} className="glass-strong rounded-2xl p-6 card-hover shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[#8a8480] text-sm font-medium">{card.title}</span>
                        <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                          <card.icon className="text-lg" />
                        </div>
                      </div>
                      <p className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight">{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* Revenue Details */}
                <div className="glass-strong rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Chi Tiết Doanh Thu (Hệ thống Order-Service)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-black/[0.01] border border-[#dbccb8]/10">
                      <p className="text-xs text-[#8a8480] uppercase tracking-wider">Tổng Thu</p>
                      <p className="text-2xl font-bold text-[#1a1a1a] mt-1">${revenue?.totalRevenue?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/[0.01] border border-[#dbccb8]/10">
                      <p className="text-xs text-[#8a8480] uppercase tracking-wider">Từ Ngày</p>
                      <p className="text-sm font-medium text-[#2d2a26] mt-1.5">{revenue?.from || '---'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/[0.01] border border-[#dbccb8]/10">
                      <p className="text-xs text-[#8a8480] uppercase tracking-wider">Đến Ngày</p>
                      <p className="text-sm font-medium text-[#2d2a26] mt-1.5">{revenue?.to || '---'}</p>
                    </div>
                  </div>
                </div>

                {/* Kafka Stats */}
                {stats && (
                  <div className="glass-strong rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Báo Cáo Sự Kiện Kafka Cloud</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { label: 'Tổng số logs sự kiện', value: stats.totalLogs, tint: 'border-slate-200' },
                        { label: 'Sự kiện giá trị lớn (High-Value)', value: stats.highValueCount, tint: 'border-rose-200 text-rose-600' },
                        { label: 'Cảnh báo của Admin', value: stats.adminAlertCount, tint: 'border-amber-200 text-amber-600' },
                      ].map((s, idx) => (
                        <div key={idx} className={`p-4 rounded-xl bg-black/[0.01] border ${s.tint}`}>
                          <p className="text-xs text-[#8a8480] uppercase tracking-wider">{s.label}</p>
                          <p className="text-2xl font-bold mt-1">{s.value || 0}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-20 glass-strong rounded-2xl">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-[#8a8480] text-sm">Chưa có đơn hàng nào trong hệ thống.</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="glass-strong rounded-2xl p-5 card-hover shadow-sm border border-[#dbccb8]/20">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-[#1a1a1a]">Đơn hàng #{order.id}</span>
                            <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#8a8480]">
                            Khách hàng ID: {order.userId} · Ngày đặt: {order.orderDate || 'Chưa cập nhật'}
                          </p>
                          {(order.shippingPhone || order.shippingFullName) && (
                            <p className="text-xs text-[#5a5550] mt-1.5">
                              📞 {order.shippingFullName || 'N/A'} - {order.shippingPhone || 'N/A'} - {order.shippingAddress || 'N/A'}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-extrabold text-[#1a1a1a]">
                            ${order.total?.toFixed(2)}
                          </span>
                          <div className="flex gap-2">
                            {order.status === 'PAYMENT_EXPECTED' && (
                              <button onClick={() => updateStatus(order.id, 'SHIPPED')} className="px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-700 text-xs font-semibold hover:bg-purple-500/20 active:scale-95 transition-all flex items-center gap-1">
                                <FiTruck /> Giao Hàng
                              </button>
                            )}
                            {order.status === 'SHIPPED' && (
                              <button onClick={() => updateStatus(order.id, 'COMPLETED')} className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-semibold hover:bg-emerald-500/20 active:scale-95 transition-all flex items-center gap-1">
                                <FiCheckCircle /> Hoàn Tất
                              </button>
                            )}
                            {['PAYMENT_EXPECTED', 'PAID'].includes(order.status) && (
                              <button onClick={() => updateStatus(order.id, 'CANCELLED')} className="px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-700 text-xs font-semibold hover:bg-rose-500/20 active:scale-95 transition-all flex items-center gap-1">
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

            {/* 3. PRODUCTS TAB (CRUD) */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#1a1a1a]">Danh Sách Sản Phẩm ({products.length})</h3>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#dbccb8] to-[#c9b8a0] text-[#1a1a1a] hover:shadow-lg active:scale-95 transition-all text-sm font-semibold btn-shine"
                  >
                    <FiPlus /> Thêm sản phẩm mới
                  </button>
                </div>

                <div className="glass-strong rounded-2xl overflow-hidden shadow-sm border border-[#dbccb8]/20">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-black/[0.02] border-b border-[#dbccb8]/10 text-[#8a8480] font-semibold">
                          <th className="p-4 w-16">ID</th>
                          <th className="p-4">Tên Sản Phẩm</th>
                          <th className="p-4">Phân Loại</th>
                          <th className="p-4 text-right">Giá Bán</th>
                          <th className="p-4 text-center">Tồn Kho</th>
                          <th className="p-4 w-20 text-center">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dbccb8]/10">
                        {products.map((prod) => (
                          <tr key={prod.id} className="hover:bg-black/[0.01] transition-all text-[#2d2a26]">
                            <td className="p-4 font-mono text-[#8a8480]">{prod.id}</td>
                            <td className="p-4 font-medium text-[#1a1a1a]">{prod.productName}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 border border-slate-200">
                                {prod.category}
                              </span>
                            </td>
                            <td className="p-4 text-right font-semibold text-[#1a1a1a]">${prod.price?.toFixed(2)}</td>
                            <td className="p-4 text-center font-medium">{prod.availability}</td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-2 rounded-xl text-rose-600 hover:bg-rose-500/10 active:scale-90 transition-all"
                                title="Xóa sản phẩm"
                              >
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
            )}

            {/* 4. USERS TAB (STATUS LOCK/UNLOCK) */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-[#1a1a1a]">Danh Sách Tài Khoản ({usersList.length})</h3>

                <div className="glass-strong rounded-2xl overflow-hidden shadow-sm border border-[#dbccb8]/20">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-black/[0.02] border-b border-[#dbccb8]/10 text-[#8a8480] font-semibold">
                          <th className="p-4 w-16">ID</th>
                          <th className="p-4">Tên Đăng Nhập</th>
                          <th className="p-4">Vai Trò</th>
                          <th className="p-4">Email</th>
                          <th className="p-4 text-center">Trạng Thái</th>
                          <th className="p-4 w-32 text-center">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dbccb8]/10">
                        {usersList.map((usr) => (
                          <tr key={usr.id} className="hover:bg-black/[0.01] transition-all text-[#2d2a26]">
                            <td className="p-4 font-mono text-[#8a8480]">{usr.id}</td>
                            <td className="p-4 font-medium text-[#1a1a1a]">{usr.userName}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                usr.role?.roleName === 'ROLE_ADMIN' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {usr.role?.roleName || 'N/A'}
                              </span>
                            </td>
                            <td className="p-4 text-[#5a5550]">{usr.userDetails?.email || 'N/A'}</td>
                            <td className="p-4 text-center">
                              {usr.active === 1 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200">
                                  Hoạt Động
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-rose-100 text-rose-700 font-semibold border border-rose-200">
                                  Đang Khóa
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {usr.role?.roleName !== 'ROLE_ADMIN' ? (
                                usr.active === 1 ? (
                                  <button
                                    onClick={() => handleToggleUserStatus(usr.id, usr.active)}
                                    className="flex items-center gap-1 mx-auto px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-700 text-xs font-semibold hover:bg-rose-500/20 active:scale-95 transition-all"
                                  >
                                    <FiUserX /> Khóa Acc
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleToggleUserStatus(usr.id, usr.active)}
                                    className="flex items-center gap-1 mx-auto px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-semibold hover:bg-emerald-500/20 active:scale-95 transition-all"
                                  >
                                    <FiUserCheck /> Mở Khóa
                                  </button>
                                )
                              ) : (
                                <span className="text-xs text-[#8a8480] italic">Hệ thống</span>
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

            {/* 5. KAFKA LOGS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-20 glass-strong rounded-2xl">
                    <div className="text-6xl mb-4">🔔</div>
                    <p className="text-[#8a8480] text-sm">Chưa nhận được log thông báo nào từ Kafka Cloud.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif, idx) => (
                      <div key={notif.id || idx} className="glass-strong rounded-xl p-4 flex items-start gap-4 card-hover shadow-sm">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          notif.type === 'HIGH-VALUE' ? 'bg-rose-500/10 text-rose-600' : 'bg-indigo-500/10 text-indigo-600'
                        }`}>
                          <FiBell />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#2d2a26]">{notif.message}</p>
                          <p className="text-xs text-[#8a8480] mt-1">
                            Người nhận: {notif.target || 'ADMIN'} · {notif.timestamp || notif.createdAt || 'N/A'}
                          </p>
                        </div>
                        {notif.type === 'HIGH-VALUE' && (
                          <span className="px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 text-xs font-bold flex-shrink-0">
                            HIGH-VALUE
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-strong max-w-md w-full p-6 rounded-2xl shadow-2xl border border-[#dbccb8]/30 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#1a1a1a]">✨ Thêm sản phẩm mới</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full hover:bg-black/[0.05] transition-all text-[#8a8480] hover:text-[#1a1a1a]"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5a5550] uppercase tracking-wider mb-1">Tên sản phẩm</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Smart TV LG 55 inch"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dbccb8]/30 focus:border-[#dbccb8] focus:ring-1 focus:ring-[#dbccb8] bg-[#fffaf6] text-sm outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5a5550] uppercase tracking-wider mb-1">Giá bán ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="799.99"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#dbccb8]/30 focus:border-[#dbccb8] focus:ring-1 focus:ring-[#dbccb8] bg-[#fffaf6] text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5a5550] uppercase tracking-wider mb-1">Tồn kho ban đầu</label>
                  <input
                    type="number"
                    required
                    placeholder="10"
                    value={newProduct.availability}
                    onChange={(e) => setNewProduct({ ...newProduct, availability: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#dbccb8]/30 focus:border-[#dbccb8] focus:ring-1 focus:ring-[#dbccb8] bg-[#fffaf6] text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5a5550] uppercase tracking-wider mb-1">Phân loại</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dbccb8]/30 focus:border-[#dbccb8] focus:ring-1 focus:ring-[#dbccb8] bg-[#fffaf6] text-sm outline-none transition-all"
                >
                  <option value="Electronics">Electronics (Công Nghệ)</option>
                  <option value="Clothing">Clothing (Thời Trang)</option>
                  <option value="Books">Books (Sách Truyện)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5a5550] uppercase tracking-wider mb-1">Mô tả sản phẩm</label>
                <textarea
                  rows="3"
                  placeholder="Mô tả tóm tắt tính năng sản phẩm..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dbccb8]/30 focus:border-[#dbccb8] focus:ring-1 focus:ring-[#dbccb8] bg-[#fffaf6] text-sm outline-none resize-none transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#dbccb8] to-[#c9b8a0] text-[#1a1a1a] font-bold text-sm hover:shadow-lg active:scale-[0.98] transition-all btn-shine"
                >
                  ✨ Lưu sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
