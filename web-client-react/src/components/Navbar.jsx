import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShoppingCart, FiUser, FiLogOut, FiShield, FiHome, FiMenu, FiX, FiChevronDown, FiDroplet, FiHeart } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';

/* ── Inline SVG perfume-drop mark ── */
const PerfumeMark = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <path
      d="M14 3C14 3 7 11.5 7 17C7 20.866 10.134 24 14 24C17.866 24 21 20.866 21 17C21 11.5 14 3Z"
      fill="#C9973D"
      fillOpacity="0.9"
    />
    <path
      d="M14 3C14 3 7 11.5 7 17C7 20.866 10.134 24 14 24"
      stroke="#DDB05A"
      strokeWidth="0.5"
      strokeLinecap="round"
    />
    <ellipse cx="14" cy="17" rx="3.5" ry="2" fill="rgba(255,255,255,0.15)" />
    {/* Stopper neck */}
    <rect x="12" y="1" width="4" height="3" rx="1" fill="#A87B2C" />
  </svg>
);

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
    { to: '/scent-finder', label: 'Tìm Mùi Hương', icon: FiDroplet },
    { to: '/wishlist', label: 'Yêu Thích', icon: FiHeart },
    ...(user ? [
      { to: '/profile', label: 'Tài Khoản', icon: FiUser },
      { to: '/cart', label: 'Giỏ Hàng', icon: FiShoppingCart }
    ] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: FiShield }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
      scrolled ? 'glass-strong shadow-[0_8px_40px_rgba(0,0,0,0.5)]' : 'bg-transparent'
    }`}>
      {/* Amber border line bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9973D]/25 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 group">
            <PerfumeMark />
            <div>
              <span className="font-display text-xl font-semibold text-[#EDE8DF] tracking-tight leading-none block">
                Aroma Forest
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-[0.25em] text-[#C9973D]/70 font-mono mt-0.5">
                Artisan Perfume House
              </span>
            </div>
          </Link>

          {/* ── Desktop nav links ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'text-[#C9973D] bg-[#C9973D]/10'
                    : 'text-[#9A9080] hover:text-[#EDE8DF] hover:bg-white/[0.04]'
                }`}
              >
                <link.icon className="text-base" />
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="relative ml-4 pl-4 border-l border-[#C9973D]/15" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-all"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9973D] to-[#A87B2C] flex items-center justify-center text-[#0C0B09] text-sm font-bold shadow-sm">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#6B9E78] border-2 border-[#0C0B09] rounded-full" />
                  </div>
                  <span className="text-sm text-[#9A9080]">{user.username}</span>
                  <FiChevronDown className={`text-[#C9973D]/60 text-xs transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#161510]/95 backdrop-blur-2xl rounded-xl shadow-2xl shadow-black/50 border border-[#C9973D]/15 overflow-hidden animate-scale-in origin-top-right">
                    <div className="p-3 border-b border-[#C9973D]/10">
                      <p className="text-sm font-semibold text-[#EDE8DF]">{user.username}</p>
                      <p className="text-xs text-[#9A9080]">{isAdmin ? 'Administrator' : 'Member'}</p>
                    </div>
                    <div className="p-1">
                      <button onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#9A9080] hover:bg-[#C9973D]/10 hover:text-[#EDE8DF] transition-all">
                        <FiUser className="text-[#C9973D]" /> Trang Cá Nhân
                      </button>
                      <button onClick={() => { setUserMenuOpen(false); navigate('/cart'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#9A9080] hover:bg-[#C9973D]/10 hover:text-[#EDE8DF] transition-all">
                        <FiShoppingCart className="text-[#C9973D]" /> Giỏ Hàng
                      </button>
                      {isAdmin && (
                        <button onClick={() => { setUserMenuOpen(false); navigate('/admin'); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#9A9080] hover:bg-[#C9973D]/10 hover:text-[#EDE8DF] transition-all">
                          <FiShield className="text-[#C9973D]" /> Dashboard
                        </button>
                      )}
                    </div>
                    <div className="p-1 border-t border-[#C9973D]/10">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#B05A5A] hover:bg-[#B05A5A]/10 transition-all">
                        <FiLogOut /> Đăng Xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login"
                className="ml-4 px-5 py-2 rounded-full border border-[#C9973D]/50 text-[#C9973D] text-sm font-medium hover:bg-[#C9973D] hover:text-[#0C0B09] hover:border-[#C9973D] transition-all duration-200 btn-shine">
                Đăng Nhập
              </Link>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-[#9A9080] hover:text-[#EDE8DF] hover:bg-white/[0.04] transition-all">
            {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0C0B09]/95 backdrop-blur-2xl border-t border-[#C9973D]/12 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to) ? 'bg-[#C9973D]/15 text-[#C9973D]' : 'text-[#9A9080] hover:text-[#EDE8DF] hover:bg-white/[0.04]'
                }`}>
                <link.icon className="text-base" /> {link.label}
              </Link>
            ))}
            <div className="border-t border-[#C9973D]/12 pt-3 mt-3">
              {user ? (
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9973D] to-[#A87B2C] flex items-center justify-center text-[#0C0B09] text-sm font-bold">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-[#EDE8DF] block">{user.username}</span>
                      <span className="text-xs text-[#9A9080]">{isAdmin ? 'Admin' : 'Member'}</span>
                    </div>
                  </div>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[#B05A5A] hover:bg-[#B05A5A]/10 transition-all">
                    <FiLogOut /> Đăng xuất
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[#C9973D]/50 text-[#C9973D] text-sm font-medium btn-shine">
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
