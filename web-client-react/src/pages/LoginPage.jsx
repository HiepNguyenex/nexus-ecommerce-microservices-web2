import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight, FiSmartphone, FiMapPin } from 'react-icons/fi';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', email: '', fullName: '', phone: '', address: '' });
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await authAPI.login(form.username, form.password);
        login(res.token, res.username || form.username, res.role || 'ROLE_USER', res.refreshToken, res.userId);
        showToast('Đăng nhập thành công! 🎉');
        navigate('/');
      } else {
        const nameParts = (form.fullName || '').trim().split(/\s+/);
        const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0] || 'User';
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '.';
        
        const payload = {
          userName: form.username,
          userPassword: form.password,
          active: 1,
          userDetails: {
            firstName: firstName,
            lastName: lastName,
            email: form.email,
            phoneNumber: form.phone || '',
            street: form.address || '',
            streetNumber: '1',
            zipCode: '10000',
            locality: 'Hanoi',
            country: 'Vietnam'
          }
        };
        await authAPI.register(payload);
        showToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
        setIsLogin(true);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.', 'error');
    } finally { setLoading(false); }
  };

  const fillDemo = (u, p) => { setForm({ ...form, username: u, password: p }); showToast(`Đã điền tài khoản ${u}`, 'success'); };

  return (
    <div className="min-h-screen bg-[#fffaf6] bg-grid flex flex-col">
      <Navbar />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#dbccb8]/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#c9b8a0]/15 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-24 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="text-6xl mb-4 animate-float inline-block">🌈</div>
            <h1 className="text-3xl font-bold text-[#2d2a26] mb-2">{isLogin ? 'Chào Mừng Trở Lại' : 'Tạo Tài Khoản'}</h1>
            <p className="text-[#b8a690]">{isLogin ? 'Đăng nhập để khám phá sản phẩm mới nhất' : 'Tham gia cùng hàng ngàn người dùng'}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-xl shadow-[#dbccb8]/20 border border-[#dbccb8]/20 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex mb-6 bg-[#dbccb8]/10 rounded-xl p-1">
              {['Đăng Nhập', 'Đăng Ký'].map((tab, i) => (
                <button key={tab} onClick={() => setIsLogin(i === 0)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${(isLogin && i === 0) || (!isLogin && i === 1) ? 'bg-white text-[#2d2a26] shadow-sm' : 'text-[#b8a690] hover:text-[#2d2a26]'}`}>{tab}</button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8a690]" />
                <input type="text" name="username" placeholder="Tên đăng nhập" value={form.username} onChange={handleChange} required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#fffaf6] border border-[#dbccb8]/30 text-[#2d2a26] placeholder-[#b8a690] outline-none focus:border-[#c9b8a0] focus:ring-2 focus:ring-[#dbccb8]/20 transition-all" />
              </div>

              {!isLogin && (
                <div className="space-y-4 animate-fade-in">
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8a690]" />
                    <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#fffaf6] border border-[#dbccb8]/30 text-[#2d2a26] placeholder-[#b8a690] outline-none focus:border-[#c9b8a0] focus:ring-2 focus:ring-[#dbccb8]/20 transition-all" />
                  </div>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8a690]" />
                    <input type="text" name="fullName" placeholder="Họ và tên" value={form.fullName} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#fffaf6] border border-[#dbccb8]/30 text-[#2d2a26] placeholder-[#b8a690] outline-none focus:border-[#c9b8a0] focus:ring-2 focus:ring-[#dbccb8]/20 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <FiSmartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8a690]" />
                      <input type="text" name="phone" placeholder="SĐT" value={form.phone} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#fffaf6] border border-[#dbccb8]/30 text-[#2d2a26] placeholder-[#b8a690] outline-none focus:border-[#c9b8a0] focus:ring-2 focus:ring-[#dbccb8]/20 transition-all" />
                    </div>
                    <div className="relative">
                      <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8a690]" />
                      <input type="text" name="address" placeholder="Địa chỉ" value={form.address} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#fffaf6] border border-[#dbccb8]/30 text-[#2d2a26] placeholder-[#b8a690] outline-none focus:border-[#c9b8a0] focus:ring-2 focus:ring-[#dbccb8]/20 transition-all" />
                    </div>
                  </div>
                </div>
              )}

              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b8a690]" />
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Mật khẩu" value={form.password} onChange={handleChange} required
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#fffaf6] border border-[#dbccb8]/30 text-[#2d2a26] placeholder-[#b8a690] outline-none focus:border-[#c9b8a0] focus:ring-2 focus:ring-[#dbccb8]/20 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#b8a690] hover:text-[#2d2a26] transition-colors">
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <button type="submit" disabled={loading}
                className="relative w-full py-3.5 rounded-xl bg-gradient-to-r from-[#dbccb8] to-[#c9b8a0] text-[#1a1a1a] font-semibold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-[#dbccb8]/30 disabled:opacity-50 transition-all duration-300 btn-shine">
                {loading ? <div className="w-5 h-5 border-2 border-[#1a1a1a]/20 border-t-[#1a1a1a] rounded-full animate-spin" /> : <>{isLogin ? 'Đăng Nhập' : 'Đăng Ký'} <FiArrowRight /></>}
              </button>
            </form>

            {isLogin && (
              <div className="mt-6 pt-6 border-t border-[#dbccb8]/20 animate-fade-in">
                <p className="text-xs text-[#b8a690] text-center mb-4 uppercase tracking-wider">Tài khoản dùng thử</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => fillDemo('admin', '123456')}
                    className="group relative px-4 py-3 rounded-xl bg-[#fffaf6] border border-[#dbccb8]/30 hover:border-[#d4b896]/50 text-left transition-all duration-200">
                    <span className="text-lg">🔒</span>
                    <p className="text-xs font-semibold text-[#2d2a26] mt-1 group-hover:text-[#c9b8a0] transition-colors">Admin</p>
                    <p className="text-[10px] text-[#b8a690]">admin / 123456</p>
                  </button>
                  <button onClick={() => fillDemo('johndoe', 'password123')}
                    className="group relative px-4 py-3 rounded-xl bg-[#fffaf6] border border-[#dbccb8]/30 hover:border-[#c9b8a0]/50 text-left transition-all duration-200">
                    <span className="text-lg">👤</span>
                    <p className="text-xs font-semibold text-[#2d2a26] mt-1 group-hover:text-[#c9b8a0] transition-colors">User</p>
                    <p className="text-[10px] text-[#b8a690]">johndoe / password123</p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
