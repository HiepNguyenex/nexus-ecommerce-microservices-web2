import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, cartAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { FiSearch, FiShoppingCart, FiStar, FiArrowRight, FiTrendingUp, FiShield, FiZap, FiGlobe } from 'react-icons/fi';

const CATEGORY_IMAGES = {
  Electronics: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60",
  Clothing: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60",
  Books: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60"
};
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";

const CATEGORIES = [
  { key: 'Tất Cả', label: 'Tất Cả', icon: '🎯' },
  { key: 'Electronics', label: 'Công Nghệ', icon: '💻' },
  { key: 'Clothing', label: 'Thời Trang', icon: '👕' },
  { key: 'Books', label: 'Sách', icon: '📚' },
];

const FEATURES = [
  { icon: FiZap, title: 'Siêu Tốc', desc: 'Vận hành bởi microservices' },
  { icon: FiShield, title: 'Bảo Mật', desc: 'JWT Authentication' },
  { icon: FiGlobe, title: 'Cloud Native', desc: 'Kafka & Docker Ready' },
  { icon: FiTrendingUp, title: 'Thông Minh', desc: 'AI Recommendations' },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('Tất Cả');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => {
    let result = products;
    if (category !== 'Tất Cả') {
      const m = { Electronics: 'Electronics', Clothing: 'Clothing', Books: 'Books' };
      result = result.filter(p => p.category === m[category]);
    }
    if (search) result = result.filter(p => p.productName?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [products, category, search]);

  const loadProducts = async () => {
    try {
      const data = await productAPI.getAll();
      setProducts(Array.isArray(data) ? data : (data?.data ? (Array.isArray(data.data) ? data.data : []) : []));
    } catch { showToast('Không thể kết nối đến API Catalog.', 'error');
    } finally { setLoading(false); }
  };

  const addToCart = async (e, product) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return showToast('Vui lòng đăng nhập trước khi mua hàng!', 'warning');
    try { await cartAPI.addItem(product.id, 1); showToast(`Đã thêm '${product.productName}' vào giỏ hàng!`); }
    catch { showToast('Không thể thêm vào giỏ hàng.', 'error'); }
  };

  return (
    <div className="min-h-screen bg-[#fffaf6] bg-grid">
      <Navbar />

      <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-glow-warm pointer-events-none" />
        <div className="absolute inset-0 bg-glow-warm-2 pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#dbccb8]/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#c9b8a0]/15 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#dbccb8]/20 border border-[#dbccb8]/30 text-[#8a7a6a] text-sm font-medium mb-6 backdrop-blur-sm animate-fade-in">
            <FiStar className="text-xs" /> 9 Microservices · E-Commerce Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] mb-6 animate-fade-in-up text-[#2d2a26]">
            Khám Phá{' '}
            <span className="text-gradient">Rainbow Forest</span>
            <br />
            <span className="text-2xl sm:text-3xl lg:text-4xl text-[#b8a690] font-light">Nơi Công Nghệ Gặp Gỡ Thương Mại</span>
          </h1>
          <p className="text-lg text-[#8a8480] max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Hệ thống microservices tiên tiến với Eureka, API Gateway, JWT Auth, Kafka Streaming, và nhiều hơn nữa.
          </p>

          <div className="relative max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute -inset-1 bg-gradient-to-r from-[#dbccb8] to-[#c9b8a0] rounded-2xl opacity-20 blur-lg" />
            <div className="relative flex items-center bg-white/80 backdrop-blur-md rounded-2xl border border-[#dbccb8]/30 focus-within:border-[#c9b8a0]/60 transition-all duration-300 shadow-sm">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#b8a690]" />
              <input type="text" placeholder="Tìm kiếm sản phẩm..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent pl-12 pr-4 py-4 text-[#2d2a26] placeholder-[#b8a690] outline-none" />
              {search && <button onClick={() => setSearch('')} className="mr-3 px-3 py-1 rounded-lg bg-[#dbccb8]/20 text-[#8a8480] hover:text-[#2d2a26] text-xs transition-all">✕</button>}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex flex-wrap gap-3 mb-10 animate-fade-in-up">
          {CATEGORIES.map((cat) => (
            <button key={cat.key} onClick={() => setCategory(cat.key)}
              className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                category === cat.key ? 'bg-gradient-to-r from-[#dbccb8] to-[#c9b8a0] text-[#1a1a1a] shadow-lg shadow-[#dbccb8]/30 scale-105' : 'glass text-[#8a8480] hover:text-[#2d2a26]'
              }`}>
              <span className="relative z-10 flex items-center gap-2"><span>{cat.icon}</span> {cat.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="animate-shimmer h-52 w-full" />
                <div className="p-4 space-y-3"><div className="animate-shimmer h-4 w-1/3" /><div className="animate-shimmer h-5 w-3/4" /><div className="animate-shimmer h-5 w-1/4" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="text-7xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-[#2d2a26] mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-[#b8a690]">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
            {filtered.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`}
                className="group bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden card-hover cursor-pointer border border-[#dbccb8]/20 shadow-sm hover:shadow-xl hover:shadow-[#dbccb8]/20">
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img src={CATEGORY_IMAGES[product.category] || DEFAULT_IMAGE} alt={product.productName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#fffaf6] via-[#fffaf6]/10 to-transparent opacity-60" />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-[#dbccb8]/30 text-[#8a7a6a] text-[10px] font-semibold uppercase tracking-wider">{product.category || 'General'}</span>
                  </div>
                  <button onClick={(e) => addToCart(e, product)}
                    className="absolute top-3 right-3 w-10 h-10 rounded-xl bg-white/60 backdrop-blur-md border border-[#dbccb8]/20 text-[#5a5550] flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#dbccb8] hover:text-white">
                    <FiShoppingCart className="text-sm" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-[#2d2a26] mb-2 line-clamp-1 group-hover:text-[#c9b8a0] transition-colors">{product.productName}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-gradient">${product.price?.toFixed(2)}</span>
                      {product.availability > 0 && <span className="block text-[10px] text-[#a8c5a0] mt-0.5">● Còn {product.availability} sản phẩm</span>}
                    </div>
                    <button onClick={(e) => addToCart(e, product)}
                      className="md:hidden w-9 h-9 rounded-full bg-gradient-to-r from-[#dbccb8] to-[#c9b8a0] text-[#1a1a1a] flex items-center justify-center shadow-sm">
                      <FiShoppingCart className="text-xs" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-[#dbccb8]/20 shadow-xl">
          <div className="absolute inset-0 bg-glow-warm pointer-events-none" />
          <div className="absolute inset-0 bg-glow-warm-2 pointer-events-none" />
          <div className="text-center mb-12 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#2d2a26] mb-4">🚀 Vận Hành Bởi <span className="text-gradient">Microservices</span></h2>
            <p className="text-[#b8a690] max-w-xl mx-auto">9 services độc lập, phối hợp nhịp nhàng qua Eureka và API Gateway</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="text-center p-6 rounded-2xl hover:bg-[#dbccb8]/10 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#dbccb8]/20 to-[#c9b8a0]/20 border border-[#dbccb8]/20 flex items-center justify-center">
                  <f.icon className="text-2xl text-[#c9b8a0]" />
                </div>
                <h3 className="text-lg font-semibold text-[#2d2a26] mb-1">{f.title}</h3>
                <p className="text-sm text-[#b8a690]">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-10 relative z-10">
            {['eureka-server','api-gateway','user-service','order-service','payment-service','inventory-service','notification-service','catalog-service','recommendation-service'].map(s => (
              <span key={s} className="px-3 py-1.5 rounded-full bg-[#dbccb8]/10 border border-[#dbccb8]/20 text-xs text-[#8a8480] font-mono hover:text-[#2d2a26] hover:border-[#c9b8a0]/40 transition-all">{s}</span>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#dbccb8]/20 py-8 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-[#b8a690]">🌈 Rainbow Forest · Nguyễn Vũ Hiệp · 2123110161</p>
          <p className="text-xs text-[#c9b8a0] mt-1">Spring Boot · Eureka · API Gateway · JWT · Kafka · Redis · MySQL</p>
        </div>
      </footer>
    </div>
  );
}
