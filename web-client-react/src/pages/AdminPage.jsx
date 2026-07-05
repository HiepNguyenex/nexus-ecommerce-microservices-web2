import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminAPI, orderAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FiDollarSign, FiBell, FiTrendingUp, FiShoppingBag, FiRefreshCw, FiCheckCircle, FiClock, FiTruck, FiXCircle } from 'react-icons/fi';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [revenue, setRevenue] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) loadData();
    else setLoading(false);
  }, [isAdmin]);

  const loadData = async () => {
    try {
      const [revData, orderData, notifData, statsData] = await Promise.allSettled([
        adminAPI.getRevenue(),
        orderAPI.getAll(),
        adminAPI.getNotificationLogs(),
        adminAPI.getNotificationStats(),
      ]);
      if (revData.status === 'fulfilled') setRevenue(revData.value);
      if (orderData.status === 'fulfilled') setOrders(orderData.value || []);
      if (notifData.status === 'fulfilled') setNotifications(notifData.value || []);
      if (statsData.status === 'fulfilled') setStats(statsData.value);
    } catch {
      showToast('Không thể tải dữ liệu.', 'error');
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
      showToast('Không thể cập nhật trạng thái.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'PAYMENT_EXPECTED': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'PAID': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'SHIPPED': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'COMPLETED': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'CANCELLED': 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return styles[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0f172a]">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Truy cập bị từ chối</h2>
          <p className="text-slate-400">Bạn cần quyền Admin để truy cập trang này.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Tổng Quan', icon: FiTrendingUp },
    { id: 'orders', label: 'Đơn Hàng', icon: FiShoppingBag },
    { id: 'notifications', label: 'Thông Báo', icon: FiBell },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-100">🔒 Admin Dashboard</h1>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-slate-400 hover:text-slate-200 transition-all text-sm"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <tab.icon /> {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Tổng Doanh Thu', value: revenue ? `$${revenue.totalRevenue?.toFixed(2) || '0.00'}` : '---', icon: FiDollarSign, gradient: 'from-indigo-500 to-purple-600' },
                { title: 'Đơn Hàng', value: orders.length || '---', icon: FiShoppingBag, gradient: 'from-emerald-500 to-teal-600' },
                { title: 'Thông Báo', value: stats?.totalLogs || notifications.length || '---', icon: FiBell, gradient: 'from-amber-500 to-orange-600' },
                { title: 'Đã Giao', value: orders.filter(o => o.status === 'SHIPPED' || o.status === 'COMPLETED').length, icon: FiCheckCircle, gradient: 'from-rose-500 to-pink-600' },
              ].map((card) => (
                <div key={card.title} className="glass rounded-2xl p-6 card-hover">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400 text-sm font-medium">{card.title}</span>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                      <card.icon className="text-white text-lg" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-100">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Revenue Details */}
            {revenue && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Chi Tiết Doanh Thu</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-800/50">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Tổng</p>
                    <p className="text-2xl font-bold text-gradient mt-1">${revenue.totalRevenue?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Từ ngày</p>
                    <p className="text-sm font-medium text-slate-200 mt-1">{revenue.from || '---'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Đến ngày</p>
                    <p className="text-sm font-medium text-slate-200 mt-1">{revenue.to || '---'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Stats */}
            {stats && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Thống Kê Thông Báo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Tổng logs', value: stats.totalLogs },
                    { label: 'HIGH-VALUE', value: stats.highValueCount },
                    { label: 'ADMIN alerts', value: stats.adminAlertCount },
                  ].map((s) => (
                    <div key={s.label} className="p-4 rounded-xl bg-slate-800/50">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">{s.label}</p>
                      <p className="text-2xl font-bold text-slate-100 mt-1">{s.value || 0}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            {orders.length === 0 ? (
              <div className="text-center py-20 glass rounded-2xl">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-slate-400">Chưa có đơn hàng nào.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="glass rounded-2xl p-5 card-hover animate-fade-in">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-slate-100">Đơn hàng #{order.id}</span>
                          <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">
                          Người dùng: {order.userId} · Ngày: {order.orderDate || '---'}
                        </p>
                        {(order.shippingPhone || order.shippingFullName) && (
                          <p className="text-xs text-slate-500 mt-1">
                            📞 {order.shippingFullName || ''} - {order.shippingPhone || ''} - {order.shippingAddress || ''}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-gradient">
                          ${order.total?.toFixed(2)}
                        </span>
                        <div className="flex gap-2">
                          {order.status === 'PAYMENT_EXPECTED' && (
                            <button onClick={() => updateStatus(order.id, 'SHIPPED')} className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-semibold hover:bg-purple-500/30 transition-all flex items-center gap-1">
                              <FiTruck /> Giao hàng
                            </button>
                          )}
                          {order.status === 'SHIPPED' && (
                            <button onClick={() => updateStatus(order.id, 'COMPLETED')} className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-all flex items-center gap-1">
                              <FiCheckCircle /> Hoàn tất
                            </button>
                          )}
                          {['PAYMENT_EXPECTED', 'PAID'].includes(order.status) && (
                            <button onClick={() => updateStatus(order.id, 'CANCELLED')} className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 text-xs font-semibold hover:bg-red-500/30 transition-all flex items-center gap-1">
                              <FiXCircle /> Hủy
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="animate-fade-in">
            {notifications.length === 0 ? (
              <div className="text-center py-20 glass rounded-2xl">
                <div className="text-6xl mb-4">🔔</div>
                <p className="text-slate-400">Chưa có thông báo nào.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif, idx) => (
                  <div key={notif.id || idx} className="glass rounded-xl p-4 flex items-start gap-4 card-hover animate-fade-in">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      notif.type === 'HIGH-VALUE' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'
                    }`}>
                      <FiBell />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200">{notif.message}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {notif.target || 'ADMIN'} · {notif.timestamp || notif.createdAt || '---'}
                      </p>
                    </div>
                    {notif.type === 'HIGH-VALUE' && (
                      <span className="px-2 py-1 rounded-md bg-rose-500/10 text-rose-400 text-xs font-semibold flex-shrink-0">
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
    </div>
  );
}
