import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight, FiSmartphone, FiMapPin, FiDroplet } from 'react-icons/fi';
import { motion } from 'motion/react';

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
        showToast('Đăng nhập thành công!');
        navigate('/');
      } else {
        const nameParts = (form.fullName || '').trim().split(/\s+/);
        const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0] || 'User';
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '.';
        await authAPI.register({
          userName: form.username, userPassword: form.password, active: 1,
          userDetails: {
            firstName, lastName, email: form.email,
            phoneNumber: form.phone || '', street: form.address || '',
            streetNumber: '1', zipCode: '10000', locality: 'Hanoi', country: 'Vietnam'
          }
        });
        showToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
        setIsLogin(true);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.', 'error');
    } finally { setLoading(false); }
  };

  const fillDemo = (u, p) => { setForm({ ...form, username: u, password: p }); showToast(`Đã điền tài khoản ${u}`); };

  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl bg-[#1E1C18] border border-[#C9973D]/15 text-[#EDE8DF] placeholder-[#5C5850] outline-none focus:border-[#C9973D]/50 focus:ring-1 focus:ring-[#C9973D]/20 transition-all text-sm";

  return (
    <div className="min-h-screen bg-[#0C0B09] bg-grid flex flex-col">
      <Navbar />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-[#C9973D]/05 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-[#C9973D]/04 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-28 relative z-10">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#C9973D]/10 border border-[#C9973D]/20 mb-4">
              <FiDroplet className="text-[#C9973D] text-2xl" />
            </div>
            <h1 className="font-display text-3xl font-light text-[#EDE8DF] mb-1">
              {isLogin ? 'Chào Mừng Trở Lại' : 'Tạo Tài Khoản'}
            </h1>
            <p className="text-sm text-[#9A9080]">
              {isLogin ? 'Đăng nhập để khám phá bộ sưu tập mùi hương' : 'Tham gia cộng đồng Aroma Forest'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-[#161510] border border-[#C9973D]/12 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50">
            {/* Tabs */}
            <div className="flex mb-6 bg-[#0C0B09] rounded-xl p-1 border border-[#C9973D]/10">
              {['Đăng Nhập', 'Đăng Ký'].map((tab, i) => (
                <button key={tab} onClick={() => setIsLogin(i === 0)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    (isLogin && i === 0) || (!isLogin && i === 1)
                      ? 'bg-[#C9973D] text-[#0C0B09] font-semibold shadow-sm'
                      : 'text-[#9A9080] hover:text-[#EDE8DF]'
                  }`}>{tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9080]" />
                <input type="text" name="username" placeholder="Tên đăng nhập" value={form.username} onChange={handleChange} required className={inputClass} />
              </div>

              {/* Register extra fields */}
              {!isLogin && (
                <div className="space-y-4 animate-fade-in">
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9080]" />
                    <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className={inputClass} />
                  </div>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9080]" />
                    <input type="text" name="fullName" placeholder="Họ và tên" value={form.fullName} onChange={handleChange} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <FiSmartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9080]" />
                      <input type="text" name="phone" placeholder="SĐT" value={form.phone} onChange={handleChange} className={inputClass} />
                    </div>
                    <div className="relative">
                      <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9080]" />
                      <input type="text" name="address" placeholder="Địa chỉ" value={form.address} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9080]" />
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Mật khẩu" value={form.password} onChange={handleChange} required className={`${inputClass} pr-12`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A9080] hover:text-[#EDE8DF] transition-colors">
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-full bg-[#C9973D] text-[#0C0B09] font-semibold flex items-center justify-center gap-2 hover:bg-[#DDB05A] disabled:opacity-50 transition-all duration-200 shadow-[0_0_20px_rgba(201,151,61,0.25)] active:scale-[0.98]">
                {loading
                  ? <div className="w-5 h-5 border-2 border-[#0C0B09]/30 border-t-[#0C0B09] rounded-full animate-spin" />
                  : <>{isLogin ? 'Đăng Nhập' : 'Đăng Ký'} <FiArrowRight /></>
                }
              </button>
            </form>

            {/* Demo accounts */}
            {isLogin && (
              <div className="mt-6 pt-6 border-t border-[#C9973D]/10 animate-fade-in">
                <p className="text-[10px] text-[#5C5850] text-center mb-4 uppercase tracking-wider font-mono">Tài khoản dùng thử</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => fillDemo('admin', '123456')}
                    className="group px-4 py-3 rounded-xl bg-[#0C0B09] border border-[#C9973D]/15 hover:border-[#C9973D]/40 text-left transition-all duration-200">
                    <p className="text-xs font-semibold text-[#EDE8DF] group-hover:text-[#C9973D] transition-colors">Admin</p>
                    <p className="text-[10px] text-[#5C5850] font-mono">admin / 123456</p>
                  </button>
                  <button onClick={() => fillDemo('johndoe', 'password123')}
                    className="group px-4 py-3 rounded-xl bg-[#0C0B09] border border-[#C9973D]/15 hover:border-[#C9973D]/40 text-left transition-all duration-200">
                    <p className="text-xs font-semibold text-[#EDE8DF] group-hover:text-[#C9973D] transition-colors">User</p>
                    <p className="text-[10px] text-[#5C5850] font-mono">johndoe / password123</p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
