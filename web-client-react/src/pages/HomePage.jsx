import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, cartAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { FiSearch, FiShoppingCart, FiStar, FiArrowRight } from 'react-icons/fi';
import heroForest from '../assets/hero_forest.png';
import { motion } from 'motion/react';

const CATEGORY_IMAGES = {
  Unisex: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=60",
  Men: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=60",
  Women: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=60"
};
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=60";

const CATEGORIES = [
  { key: 'Tất Cả', label: 'Tất Cả', icon: '✨' },
  { key: 'Men', label: 'Nước Hoa Nam', icon: '👔' },
  { key: 'Women', label: 'Nước Hoa Nữ', icon: '👗' },
  { key: 'Unisex', label: 'Nước Hoa Unisex', icon: '🧪' },
];

const FEATURES = [
  { title: 'Chế Tác Thủ Công', desc: 'Mùi hương từ các tinh chất thảo mộc tự nhiên chắt lọc tinh tế.' },
  { title: 'Lưu Hương Bền Bỉ', desc: 'Độ lưu hương kéo dài nhờ tinh dầu cô đặc nguyên chất.' },
  { title: 'Thiết Kế Độc Bản', desc: 'Chai thủy tinh thổi thủ công mang phong cách tối giản thanh lịch.' },
  { title: 'Tư Vấn Cá Nhân', desc: 'Khám phá mùi hương riêng biệt phản ánh bản sắc của bạn.' },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('Tất Cả');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => { 
    loadProducts(); 
  }, []);

  useEffect(() => {
    let result = products;
    if (category !== 'Tất Cả') {
      result = result.filter(p => p.category === category);
    }
    if (search) {
      result = result.filter(p => 
        p.productName?.toLowerCase().includes(search.toLowerCase()) || 
        p.category?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [products, category, search]);

  const loadProducts = async () => {
    try {
      const data = await productAPI.getAll();
      setProducts(Array.isArray(data) ? data : (data?.data ? (Array.isArray(data.data) ? data.data : []) : []));
    } catch { 
      showToast('Không thể kết nối đến hệ thống cơ sở dữ liệu mùi hương.', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  const addToCart = async (e, product) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (!user) return showToast('Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ!', 'warning');
    try { 
      await cartAPI.addItem(product.id, 1); 
      showToast(`Đã thêm '${product.productName}' vào túi hương của bạn!`); 
    } catch { 
      showToast('Không thể thêm vào giỏ hàng.', 'error'); 
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf6] bg-grid pb-12">
      <Navbar />

      {/* ─── HERO SECTION (Split 50/50 Layout) ─── */}
      <section className="relative pt-24 md:pt-28 border-b border-[#dbccb8]/20 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 min-h-[60vh] lg:min-h-[70vh]">
          {/* Left Column: Copywriting & Search */}
          <div className="flex flex-col justify-center p-6 sm:p-12 lg:pr-16 border-r border-[#dbccb8]/10 relative z-10 bg-[#fffaf6]/90 backdrop-blur-sm">
            <div className="inline-flex items-center gap-2 mb-6 text-[#8a7a6a] text-xs font-mono uppercase tracking-[0.2em]">
              <FiStar className="text-[10px]" /> Artisan Perfume House
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-light leading-[1.05] text-[#2d2a26] mb-6 tracking-tight">
              Nốt Hương Tự Nhiên<br />
              <span className="font-semibold italic text-gradient">Chế Tác Thủ Công</span>
            </h1>
            <p className="text-base text-[#8a8480] leading-relaxed max-w-[45ch] mb-8 font-light">
              Khám phá những nốt hương tinh tế từ những nhà chế tác nước hoa thủ công hàng đầu.
            </p>

            {/* Search Input */}
            <div className="relative max-w-md w-full mb-4">
              <div className="relative flex items-center bg-[#fffaf6] border border-[#dbccb8]/30 focus-within:border-[#c9b8a0] transition-all duration-300">
                <FiSearch className="absolute left-4 text-[#b8a690] text-sm" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm mùi hương..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-[#2d2a26] placeholder-[#b8a690] outline-none font-light" 
                />
                {search && (
                  <button 
                    onClick={() => setSearch('')} 
                    className="mr-3 px-2 py-0.5 rounded bg-[#dbccb8]/20 text-[#8a8480] hover:text-[#2d2a26] text-xs font-mono"
                  >
                    clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: 3D Visual Collage */}
          <div className="relative h-64 lg:h-auto overflow-hidden bg-[#fffaf6] flex items-center justify-center">
            <img 
              src={heroForest} 
              alt="Aroma Forest Collage" 
              className="w-full h-full object-cover opacity-95 grayscale hover:grayscale-0 transition-all duration-1000 ease-out" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#fffaf6] via-transparent to-transparent hidden lg:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#fffaf6] via-transparent to-transparent lg:hidden" />
          </div>
        </div>
      </section>

      {/* ─── PRODUCTS SECTION (Minimalist Flat Grid) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-12 border-b border-[#dbccb8]/20 pb-6">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat.key} 
              onClick={() => setCategory(cat.key)}
              className={`px-6 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 border ${
                category === cat.key 
                  ? 'bg-[#1a1a1a] text-[#fffaf6] border-[#1a1a1a]' 
                  : 'bg-transparent text-[#8a8480] border-[#dbccb8]/30 hover:border-[#8a8480] hover:text-[#1a1a1a]'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 border-t border-l border-[#dbccb8]/20">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border-r border-b border-[#dbccb8]/20 p-6 animate-pulse">
                <div className="h-64 bg-slate-200/50 w-full mb-4 rounded-xl" />
                <div className="h-4 bg-slate-200/50 w-1/3 mb-2" />
                <div className="h-6 bg-slate-200/50 w-3/4 mb-4" />
                <div className="h-5 bg-slate-200/50 w-1/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 border border-[#dbccb8]/20 bg-white/30 backdrop-blur-sm">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-light text-[#2d2a26] mb-1">Mùi hương chưa được điều chế</h3>
            <p className="text-xs text-[#b8a690] uppercase font-mono tracking-wider">Thử chọn bộ lọc khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 border-t border-l border-[#dbccb8]/20">
            {filtered.map((product) => (
              <Link 
                key={product.id} 
                to={`/product/${product.id}`}
                className="group relative border-r border-b border-[#dbccb8]/20 bg-[#fffaf6] p-6 transition-all duration-300 hover:bg-[#dbccb8]/5 flex flex-col justify-between"
              >
                <div>
                  {/* Image wrapper */}
                  <div className="relative overflow-hidden mb-6 aspect-square bg-[#fffaf6]">
                    <img 
                      src={CATEGORY_IMAGES[product.category] || DEFAULT_IMAGE} 
                      alt={product.productName}
                      className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                    />
                    <div className="absolute top-0 left-0">
                      <span className="px-2 py-0.5 rounded bg-[#fffaf6] border border-[#dbccb8]/20 text-[#8a7a6a] text-[9px] font-mono uppercase tracking-widest">
                        {product.category || 'General'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-light text-[#2d2a26] group-hover:italic transition-all duration-300 mb-1 leading-snug">
                    {product.productName}
                  </h3>
                  <p className="text-xs text-[#8a8480] line-clamp-2 mb-4 font-light leading-relaxed">
                    {product.discription}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#dbccb8]/10">
                  <div>
                    <span className="text-lg font-semibold text-[#1a1a1a]">${product.price?.toFixed(2)}</span>
                    {product.availability > 0 ? (
                      <span className="block text-[9px] text-[#a8c5a0] font-mono mt-0.5">● IN STOCK ({product.availability})</span>
                    ) : (
                      <span className="block text-[9px] text-rose-400 font-mono mt-0.5">● OUT OF STOCK</span>
                    )}
                  </div>

                  <button 
                    onClick={(e) => addToCart(e, product)}
                    className="px-4 py-2 rounded-full border border-[#dbccb8]/40 hover:border-[#1a1a1a] text-[10px] font-mono uppercase tracking-wider text-[#5a5550] hover:text-[#1a1a1a] transition-all bg-[#fffaf6] group-hover:bg-[#1a1a1a] group-hover:text-[#fffaf6] group-hover:border-[#1a1a1a] active:scale-95"
                  >
                    MUA NGAY
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ─── FEATURES SECTION (Editorial Spec Style) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#dbccb8]/20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Section title left */}
          <div className="lg:col-span-1">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#b8a690] block mb-3">Triết lý thiết kế</span>
            <h2 className="text-3xl font-light text-[#2d2a26] leading-tight tracking-tight">
              Sự Hoàn Hảo Đến Từ<br />
              <span className="font-semibold italic text-gradient">Sự Tối Giản</span>
            </h2>
            <p className="text-sm text-[#8a8480] mt-4 leading-relaxed font-light">
              Mỗi chai nước hoa tại Aroma Forest đều đại diện cho nỗ lực phi thường của những chuyên gia mùi hương, kết nối di sản truyền thống và tư duy chế tác hiện đại.
            </p>
          </div>

          {/* Features spec list right */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8 gap-y-12">
            {FEATURES.map((f, idx) => (
              <div key={idx} className="border-t border-[#dbccb8]/20 pt-4 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#b8a690] block mb-2">0{idx + 1} // SPEC</span>
                  <h3 className="text-lg font-medium text-[#1a1a1a] mb-2">{f.title}</h3>
                  <p className="text-sm text-[#8a8480] leading-relaxed font-light">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MICROSERVICES TECH STACK SECTION ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#dbccb8]/20">
        <div className="bg-[#fffaf6] border border-[#dbccb8]/20 p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#b8a690] block mb-2">Hạ tầng công nghệ</span>
            <h3 className="text-2xl font-light text-[#2d2a26]">
              Vận Hành Bởi <span className="font-semibold italic text-gradient">Microservices Architecture</span>
            </h3>
            <p className="text-xs text-[#8a8480] mt-2 font-mono uppercase tracking-wider">
              9 services · Spring Boot · Eureka · Kafka Cloud · Redis · Docker
            </p>
          </div>
          <div className="flex flex-wrap gap-2 max-w-md justify-start md:justify-end">
            {['eureka-server', 'api-gateway', 'user-service', 'order-service', 'payment-service', 'inventory-service', 'notification-service', 'catalog-service', 'recommendation-service'].map(s => (
              <span 
                key={s} 
                className="px-3 py-1 rounded border border-[#dbccb8]/30 text-[10px] text-[#8a8480] font-mono hover:text-[#2d2a26] hover:border-[#1a1a1a] transition-all bg-[#fffaf6]"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#dbccb8]/20 mt-12 pt-8 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs text-[#b8a690] uppercase tracking-[0.25em] font-mono">🌈 Aroma Forest · Nguyễn Vũ Hiệp · 2123110161</p>
          <p className="text-[10px] text-[#c9b8a0] mt-2 font-mono">Spring Boot · Eureka · API Gateway · JWT · Kafka Cloud · Redis · MySQL</p>
        </div>
      </footer>
    </div>
  );
}
