import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShoppingCart, FiUser, FiLogOut, FiShield, FiHome, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = [
    { to: '/', label: 'Trang Chủ', icon: FiHome },
    ...(user ? [{ to: '/cart', label: 'Giỏ Hàng', icon: FiShoppingCart }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: FiShield }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass-strong shadow-lg' : 'bg-transparent'
    }`}>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#dbccb8]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="text-3xl animate-float inline-block">✨</span>
            <div>
              <span className="text-xl font-bold text-[#1a1a1a] tracking-tight">Aroma Forest</span>
              <span className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-[#b8a690] font-medium -mt-0.5">
                Artisan Perfume House
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'text-[#1a1a1a] bg-[#dbccb8]/20'
                    : 'text-[#8a8480] hover:text-[#1a1a1a] hover:bg-black/[0.03]'
                }`}
              >
                <link.icon className="text-base" />
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="relative ml-4 pl-4 border-l border-[#dbccb8]/30" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/[0.03] transition-all"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#dbccb8] to-[#c9b8a0] flex items-center justify-center text-[#1a1a1a] text-sm font-bold shadow-sm">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#a8c5a0] border-2 border-[#fffaf6] rounded-full" />
                  </div>
                  <span className="text-sm text-[#5a5550]">{user.username}</span>
                  <FiChevronDown className={`text-[#b8a690] text-xs transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-xl shadow-[#dbccb8]/20 border border-[#dbccb8]/20 overflow-hidden animate-scale-in origin-top-right">
                    <div className="p-3 border-b border-[#dbccb8]/20">
                      <p className="text-sm font-semibold text-[#1a1a1a]">{user.username}</p>
                      <p className="text-xs text-[#b8a690]">{isAdmin ? '🔒 Administrator' : '👤 User'}</p>
                    </div>
                    <div className="p-1">
                      <button onClick={() => { setUserMenuOpen(false); navigate('/cart'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#5a5550] hover:bg-[#dbccb8]/10 transition-all">
                        <FiShoppingCart className="text-[#c9b8a0]" /> Giỏ Hàng
                      </button>
                      {isAdmin && (
                        <button onClick={() => { setUserMenuOpen(false); navigate('/admin'); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#5a5550] hover:bg-[#dbccb8]/10 transition-all">
                          <FiShield className="text-[#d4b896]" /> Dashboard
                        </button>
                      )}
                    </div>
                    <div className="p-1 border-t border-[#dbccb8]/20">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#c99a8a] hover:bg-[#c99a8a]/10 transition-all">
                        <FiLogOut /> Đăng Xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login"
                className="ml-4 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#dbccb8] to-[#c9b8a0] text-[#1a1a1a] text-sm font-semibold hover:shadow-xl hover:shadow-[#dbccb8]/30 transition-all duration-200 btn-shine">
                Đăng Nhập
              </Link>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-[#8a8480] hover:text-[#1a1a1a] hover:bg-black/[0.03] transition-all">
            {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-2xl border-t border-[#dbccb8]/20 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(link.to) ? 'bg-[#dbccb8]/20 text-[#1a1a1a]' : 'text-[#8a8480] hover:text-[#1a1a1a] hover:bg-black/[0.03]'
                }`}>
                <link.icon className="text-base" /> {link.label}
              </Link>
            ))}
            <div className="border-t border-[#dbccb8]/20 pt-3 mt-3">
              {user ? (
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#dbccb8] to-[#c9b8a0] flex items-center justify-center text-[#1a1a1a] text-sm font-bold">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-[#1a1a1a] block">{user.username}</span>
                      <span className="text-xs text-[#b8a690]">{isAdmin ? 'Admin' : 'User'}</span>
                    </div>
                  </div>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-[#c99a8a] hover:bg-[#c99a8a]/10 transition-all">
                    <FiLogOut /> Đăng xuất
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#dbccb8] to-[#c9b8a0] text-[#1a1a1a] text-sm font-semibold btn-shine">
                  <FiUser /> Đăng Nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
