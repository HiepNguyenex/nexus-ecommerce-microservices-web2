import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, cartAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { FiSearch, FiShoppingCart, FiHeart, FiArrowRight, FiDroplet } from 'react-icons/fi';
import heroPerfume from '../assets/hero_perfume_dark.png';
import { motion } from 'motion/react';

/* ── Category images — real perfume photography ── */
const CATEGORY_IMAGES = {
  Unisex: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80",
  Men:    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=80",
  Women:  "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80",
};
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80";

const CATEGORIES = [
  { key: 'Tất Cả', label: 'Tất Cả' },
  { key: 'Men',    label: 'Nam' },
  { key: 'Women',  label: 'Nữ' },
  { key: 'Unisex', label: 'Unisex' },
  { key: 'Wishlist', label: 'Yêu Thích' },
];

const SCENT_FAMILIES = [
  { key: '', label: 'Tất cả nhóm hương' },
  { key: 'Floral', label: '🌸 Hoa' },
  { key: 'Woody', label: '🌲 Gỗ' },
  { key: 'Fresh', label: '🌊 Tươi mát' },
  { key: 'Oriental', label: '🕌 Phương Đông' },
  { key: 'Amber', label: '🍯 Hổ phách' },
  { key: 'Citrus', label: '🍋 Cam chanh' },
  { key: 'Gourmand', label: '🍫 Bánh kẹo' },
  { key: 'Chypre', label: '🌿 Chypre' },
];

const FEATURES = [
  {
    num: '01',
    title: 'Chế Tác Thủ Công',
    desc:  'Mùi hương từ các tinh chất thảo mộc tự nhiên được chắt lọc tinh tế qua nhiều công đoạn.'
  },
  {
    num: '02',
    title: 'Lưu Hương Bền Bỉ',
    desc:  'Độ lưu hương kéo dài nhờ tinh dầu cô đặc nguyên chất, không pha trộn hóa chất.'
  },
  {
    num: '03',
    title: 'Chai Thủy Tinh Độc Bản',
    desc:  'Bình thủy tinh thổi tay mang ngôn ngữ tạo hình tối giản, thanh lịch và bền vững.'
  },
  {
    num: '04',
    title: 'Tư Vấn Cá Nhân',
    desc:  'Khám phá ký ức mùi hương riêng biệt phản ánh đúng bản sắc và phong cách của bạn.'
  },
];

/* ── Animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
};

export default function HomePage() {
  const [filtered,    setFiltered]    = useState([]);
  const [category,   setCategory]    = useState('Tất Cả');
  const [search,     setSearch]      = useState('');
  const [sortBy,     setSortBy]      = useState('default');
  const [maxPrice,   setMaxPrice]    = useState(500);
  const [scentFamily, setScentFamily] = useState('');
  const [loading,    setLoading]     = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const pageSize = 8;
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wishlist') || '[]'); }
    catch { return []; }
  });
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => { fetchProducts(); }, [category, search, currentPage, maxPrice, sortBy, scentFamily]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      if (category === 'Wishlist') {
        const data = await productAPI.getAll();
        const fullList = Array.isArray(data) ? data : (data?.data ? (Array.isArray(data.data) ? data.data : []) : []);
        let result = fullList.filter(p => wishlist.includes(p.id)).filter(p => (p.price || 0) <= maxPrice);
        if (scentFamily) result = result.filter(p => (p.olfactoryFamily || '').toLowerCase().includes(scentFamily.toLowerCase()));
        if (sortBy === 'price-asc') result.sort((a, b) => (a.price||0)-(b.price||0));
        else if (sortBy === 'price-desc') result.sort((a, b) => (b.price||0)-(a.price||0));
        else if (sortBy === 'name-asc')  result.sort((a, b) => a.productName?.localeCompare(b.productName));
        setFiltered(result); setTotalPages(1);
      } else {
        const res = await productAPI.getAll(currentPage, pageSize, search, category);
        if (res?.content) {
          let content = res.content.filter(p => (p.price||0) <= maxPrice);
          if (scentFamily) content = content.filter(p => (p.olfactoryFamily || '').toLowerCase().includes(scentFamily.toLowerCase()));
          if (sortBy === 'price-asc') content.sort((a, b) => (a.price||0)-(b.price||0));
          else if (sortBy === 'price-desc') content.sort((a, b) => (b.price||0)-(a.price||0));
          else if (sortBy === 'name-asc')  content.sort((a, b) => a.productName?.localeCompare(b.productName));
          setFiltered(content); setTotalPages(res.totalPages || 1);
        } else {
          let arr = Array.isArray(res) ? res : [];
          if (scentFamily) arr = arr.filter(p => (p.olfactoryFamily || '').toLowerCase().includes(scentFamily.toLowerCase()));
          setFiltered(arr); setTotalPages(1);
        }
      }
    } catch {
      showToast('Không thể kết nối đến hệ thống cơ sở dữ liệu mùi hương.', 'error');
    } finally { setLoading(false); }
  };

  const handleCategoryChange = (catKey) => { setCategory(catKey); setCurrentPage(0); };
  const handleSearchChange   = (val)    => { setSearch(val);       setCurrentPage(0); };
  const handleFamilyChange   = (fam)    => { setScentFamily(fam);  setCurrentPage(0); };

  const toggleWishlist = (e, productId) => {
    e.preventDefault(); e.stopPropagation();
    const updated = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    if (wishlist.includes(productId)) showToast('Đã xóa khỏi danh sách yêu thích.');
    else showToast('Đã thêm vào danh sách yêu thích.');
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  const addToCart = async (e, product) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return showToast('Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ!', 'warning');
    // Fix #3: chọn size nhỏ nhất có sẵn (2ml decant) để "thử mùi"
    const trialSize = product.variants && product.variants.length > 0
      ? product.variants.reduce((min, v) => {
          const sizes = { '2ml': 1, '5ml': 2, '10ml': 3, '30ml': 4, '50ml': 5, '100ml': 6 };
          return (sizes[v.size] || 99) < (sizes[min.size] || 99) ? v : min;
        }).size
      : '100ml';
    try {
      await cartAPI.addItem(product.id, 1, trialSize);
      showToast(`Đã thêm '${product.productName}' (${trialSize} — thử mùi) vào túi hương!`);
    } catch {
      showToast('Không thể thêm vào giỏ hàng.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0B09] bg-grid pb-12 text-[#EDE8DF]">
      <Navbar />

      {/* ══════════════════════════════════════════
          HERO SECTION — Full viewport, dark luxury
      ══════════════════════════════════════════ */}
      <section className="relative min-h-[100dvh] overflow-hidden flex items-center">
        {/* Ambient amber glow background */}
        <div className="absolute inset-0 bg-amber-radial pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-amber-radial-left pointer-events-none opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_500px] gap-0 w-full min-h-[100dvh] items-center pt-20">

          {/* ── Left: Copy ── */}
          <motion.div
            className="flex flex-col justify-center py-16 lg:py-0 lg:pr-12 xl:pr-20 relative z-10"
            initial="hidden" animate="show" variants={stagger}
          >
            {/* Eyebrow */}
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 mb-8 text-[#C9973D]/70 text-[10px] font-mono uppercase tracking-[0.3em]">
              <FiDroplet className="text-[#C9973D] text-xs" />
              Artisan Perfume House
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp}
              className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light leading-[1.0] tracking-tight text-[#EDE8DF] mb-4">
              Nốt Hương
              <br />
              <span className="font-semibold italic text-gradient">Tự Nhiên</span>
              <br />
              <span className="font-light text-[#EDE8DF]/60">Chế Tác Thủ Công</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p variants={fadeUp}
              className="text-sm text-[#9A9080] leading-relaxed max-w-[42ch] mb-10 font-light">
              Khám phá những nốt hương tinh tế từ những nhà chế tác nước hoa thủ công hàng đầu.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 mb-10">
              <Link
                to="#products"
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#C9973D] text-[#0C0B09] text-sm font-semibold rounded-full hover:bg-[#DDB05A] active:scale-95 transition-all duration-200 shadow-[0_0_30px_rgba(201,151,61,0.25)]"
              >
                Khám Phá Bộ Sưu Tập
                <FiArrowRight className="text-base" />
              </Link>
              {!user && (
                <Link to="/login"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-[#C9973D]/40 text-[#C9973D] text-sm font-medium rounded-full hover:border-[#C9973D] hover:bg-[#C9973D]/10 active:scale-95 transition-all duration-200">
                  Đăng Nhập
                </Link>
              )}
            </motion.div>

            {/* Search */}
            <motion.div variants={fadeUp} className="relative max-w-md w-full">
              <div className="relative flex items-center bg-[#161510] border border-[#C9973D]/20 rounded-full focus-within:border-[#C9973D]/50 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                <FiSearch className="absolute left-4 text-[#9A9080] text-sm" />
                <input
                  type="text"
                  placeholder="Tìm kiếm mùi hương..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-[#EDE8DF] placeholder-[#5C5850] outline-none font-light rounded-full"
                />
                {search && (
                  <button onClick={() => handleSearchChange('')}
                    className="mr-3 px-2 py-0.5 rounded-full bg-[#C9973D]/15 text-[#C9973D] hover:text-[#EDE8DF] text-[10px] font-mono transition-all">
                    clear
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: Hero image ── */}
          <motion.div
            className="relative h-72 lg:h-full lg:min-h-[100dvh] overflow-hidden order-first lg:order-last"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <img
              src={heroPerfume}
              alt="Aroma Forest — Luxury Perfume"
              className="w-full h-full object-cover object-center"
            />
            {/* Gradient mask — left edge blending */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0C0B09] via-[#0C0B09]/20 to-transparent hidden lg:block" />
            {/* Gradient mask — bottom for mobile */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0B09] via-[#0C0B09]/30 to-transparent lg:hidden" />
            {/* Ambient amber edge glow */}
            <div className="absolute inset-0 bg-gradient-to-l from-[#C9973D]/05 to-transparent" />
          </motion.div>
        </div>

        {/* Amber hairline at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9973D]/20 to-transparent" />
      </section>

      {/* ══════════════════════════════════════════
          PRODUCTS SECTION
      ══════════════════════════════════════════ */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Filters bar */}
        <div className="flex flex-col gap-4 mb-12 border-b border-[#C9973D]/12 pb-8">
          {/* Row 1: Category + Sort */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`px-5 py-2 rounded-full text-[11px] font-mono uppercase tracking-wider transition-all duration-250 border ${
                    category === cat.key
                      ? 'bg-[#C9973D] text-[#0C0B09] border-[#C9973D] font-semibold shadow-[0_0_20px_rgba(201,151,61,0.3)]'
                      : 'bg-transparent text-[#9A9080] border-[#C9973D]/20 hover:border-[#C9973D]/50 hover:text-[#EDE8DF]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Right controls */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C5850] whitespace-nowrap">Giá tối đa:</span>
                <input
                  type="range" min="0" max="500" step="10"
                  value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-32 cursor-pointer accent-[#C9973D]"
                />
                <span className="text-xs font-mono font-semibold text-[#C9973D] min-w-[48px]">${maxPrice}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C5850] whitespace-nowrap">Sắp xếp:</span>
                <select
                  value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-[#C9973D]/20 bg-[#161510] text-[#9A9080] text-xs focus:outline-none focus:border-[#C9973D]/50 transition-all font-mono"
                >
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="name-asc">Tên: A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Scent Family filter */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C5850] self-center mr-1">Nhóm hương:</span>
            {SCENT_FAMILIES.map((fam) => (
              <button
                key={fam.key}
                onClick={() => handleFamilyChange(fam.key)}
                className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all border ${
                  scentFamily === fam.key
                    ? 'bg-[#C9973D]/20 text-[#C9973D] border-[#C9973D]/50'
                    : 'bg-transparent text-[#5C5850] border-[#C9973D]/15 hover:border-[#C9973D]/35 hover:text-[#9A9080]'
                }`}
              >
                {fam.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#161510] rounded-xl p-4 animate-pulse">
                <div className="h-56 animate-shimmer w-full mb-4 rounded-lg" />
                <div className="h-3 animate-shimmer w-1/3 mb-2 rounded" />
                <div className="h-5 animate-shimmer w-3/4 mb-4 rounded" />
                <div className="h-4 animate-shimmer w-1/4 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 border border-[#C9973D]/12 bg-[#161510]/50 rounded-2xl">
            <FiDroplet className="text-4xl text-[#C9973D]/40 mx-auto mb-4" />
            <h3 className="font-display text-2xl font-light text-[#EDE8DF] mb-2">Mùi hương chưa được điều chế</h3>
            <p className="text-[10px] text-[#5C5850] uppercase font-mono tracking-wider">Thử chọn bộ lọc khác.</p>
          </div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} variants={stagger}
            >
              {filtered.map((product) => (
                <motion.div key={product.id} variants={fadeUp}>
                  <Link
                    to={`/product/${product.id}`}
                    className="group relative bg-[#161510] rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(201,151,61,0.25)] hover:-translate-y-1 block"
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden aspect-square bg-[#1E1C18]">
                      <img
                        src={product.imageUrl || CATEGORY_IMAGES[product.category] || DEFAULT_IMAGE}
                        alt={product.productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
                      />
                      {/* Wishlist button */}
                      <button
                        onClick={(e) => toggleWishlist(e, product.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-[#0C0B09]/70 border border-[#C9973D]/20 backdrop-blur-sm text-[#9A9080] hover:text-rose-400 hover:border-rose-400/40 hover:scale-110 active:scale-95 transition-all duration-200 z-10"
                        title={wishlist.includes(product.id) ? 'Xóa khỏi yêu thích' : 'Yêu thích'}
                      >
                        <FiHeart className={`text-xs ${wishlist.includes(product.id) ? 'fill-rose-400 text-rose-400' : ''}`} />
                      </button>
                      {/* Category badge */}
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#0C0B09]/70 border border-[#C9973D]/20 backdrop-blur-sm text-[#C9973D]/80 text-[9px] font-mono uppercase tracking-widest">
                        {product.category || 'General'}
                      </span>
                      {/* Dark overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0C0B09]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Info */}
                    <div className="p-5 flex flex-col flex-1 justify-between">
                      <div>
                        {/* Olfactory Family + Concentration tags */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {product.olfactoryFamily && (
                            <span className="px-2 py-0.5 rounded-full bg-[#C9973D]/10 border border-[#C9973D]/20 text-[#C9973D] text-[8px] font-mono uppercase tracking-wider">
                              {product.olfactoryFamily}
                            </span>
                          )}
                          {product.concentration && (
                            <span className="px-2 py-0.5 rounded-full bg-[#EDE8DF]/5 border border-[#EDE8DF]/10 text-[#9A9080] text-[8px] font-mono uppercase tracking-wider">
                              {product.concentration}
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-lg font-medium text-[#EDE8DF] group-hover:text-[#C9973D] transition-colors duration-300 mb-1 leading-snug">
                          {product.productName}
                        </h3>
                        <p className="text-xs text-[#5C5850] line-clamp-2 mb-4 leading-relaxed">
                          {product.discription}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-[#C9973D]/10">
                        <div>
                          <span className="text-lg font-semibold text-[#EDE8DF]">${product.price?.toFixed(2)}</span>
                          {product.variants && product.variants.length > 0 && (
                            <span className="block text-[9px] text-[#C9973D]/60 font-mono mt-0.5">từ ${Math.min(...product.variants.map(v=>v.price)).toFixed(2)} / 2ml</span>
                          )}
                          {product.availability > 0 ? (
                            <span className="block text-[9px] text-[#6B9E78] font-mono mt-0.5">● CÒN HÀNG</span>
                          ) : (
                            <span className="block text-[9px] text-[#B05A5A] font-mono mt-0.5">● HẾT HÀNG</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => addToCart(e, product)}
                          title="Thêm mẫu thử 2ml vào giỏ"
                          className="px-4 py-2 rounded-full border border-[#C9973D]/40 text-[#C9973D] text-[10px] font-mono uppercase tracking-wider hover:bg-[#C9973D] hover:text-[#0C0B09] hover:border-[#C9973D] active:scale-95 transition-all duration-200"
                        >
                          Thử Mùi
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-[#C9973D]/10">
                <button
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-full border border-[#C9973D]/20 text-xs font-mono text-[#9A9080] disabled:opacity-30 disabled:pointer-events-none hover:border-[#C9973D]/50 hover:text-[#EDE8DF] transition-all active:scale-95"
                >
                  ◀ TRƯỚC
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-8 h-8 rounded-full text-xs font-mono transition-all border ${
                        currentPage === i
                          ? 'bg-[#C9973D] text-[#0C0B09] border-[#C9973D] shadow-[0_0_16px_rgba(201,151,61,0.4)]'
                          : 'bg-transparent text-[#9A9080] border-transparent hover:border-[#C9973D]/30'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  className="px-4 py-2 rounded-full border border-[#C9973D]/20 text-xs font-mono text-[#9A9080] disabled:opacity-30 disabled:pointer-events-none hover:border-[#C9973D]/50 hover:text-[#EDE8DF] transition-all active:scale-95"
                >
                  SAU ▶
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ══════════════════════════════════════════
          FEATURES SECTION — Editorial dark grid
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[#C9973D]/10">
        {/* Section header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="font-display text-4xl sm:text-5xl font-light text-[#EDE8DF] leading-tight tracking-tight">
            Triết Lý
            <span className="italic text-gradient"> Hoàn Hảo</span>
          </h2>
          <p className="text-sm text-[#9A9080] mt-3 leading-relaxed max-w-[55ch] font-light">
            Mỗi chai nước hoa Aroma Forest là kết tinh của nỗ lực phi thường — kết nối di sản truyền thống và tư duy chế tác hiện đại.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#C9973D]/10"
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}
        >
          {FEATURES.map((f) => (
            <motion.div key={f.num} variants={fadeUp}
              className="bg-[#0C0B09] p-8 hover:bg-[#161510] transition-colors duration-300 group">
              <span className="font-display text-5xl font-light text-[#C9973D]/20 block mb-6 group-hover:text-[#C9973D]/35 transition-colors">
                {f.num}
              </span>
              <div className="w-8 h-[1px] bg-[#C9973D]/50 mb-4 group-hover:w-14 transition-all duration-400" />
              <h3 className="text-base font-semibold text-[#EDE8DF] mb-3">{f.title}</h3>
              <p className="text-sm text-[#9A9080] leading-relaxed font-light">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          TECH STACK SECTION — Compact dark
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#C9973D]/10">
        <div className="bg-[#161510] border border-[#C9973D]/12 rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#C9973D]/60 block mb-2">Hạ tầng công nghệ</span>
            <h3 className="font-display text-2xl font-light text-[#EDE8DF]">
              Microservices Architecture
            </h3>
            <p className="text-xs text-[#5C5850] mt-1 font-mono">
              9 services · Spring Boot · Eureka · Kafka · Redis · Docker
            </p>
          </div>
          <div className="flex flex-wrap gap-2 max-w-sm">
            {['eureka-server','api-gateway','user-service','order-service','payment-service','inventory-service','notification-service','catalog-service','recommendation-service'].map(s => (
              <span key={s}
                className="px-2.5 py-1 rounded-md border border-[#C9973D]/15 text-[9px] text-[#5C5850] font-mono hover:text-[#C9973D] hover:border-[#C9973D]/35 transition-all bg-[#0C0B09]">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER — Full premium footer
      ══════════════════════════════════════════ */}
      <footer className="border-t border-[#C9973D]/12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <FiDroplet className="text-[#C9973D] text-xl" />
              <span className="font-display text-lg font-semibold text-[#EDE8DF]">Aroma Forest</span>
            </div>
            <p className="text-xs text-[#5C5850] leading-relaxed font-light">
              Nhà chế tác nước hoa thủ công. Mỗi mùi hương là một câu chuyện riêng biệt — được kể bằng tinh dầu tự nhiên và tình yêu với nghệ thuật.
            </p>
            <div className="flex gap-3 mt-5">
              {['FB', 'IG', 'TK', 'YT'].map(s => (
                <a key={s} href="#" className="w-8 h-8 rounded-full border border-[#C9973D]/25 flex items-center justify-center text-[9px] font-mono text-[#5C5850] hover:border-[#C9973D] hover:text-[#C9973D] transition-all">{s}</a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9973D]/70 mb-4">Khám phá</h4>
            <ul className="space-y-2.5">
              {[
                ['/', 'Trang chủ'], 
                ['/scent-finder', 'Tìm mùi hương'], 
                ['/cart', 'Giỏ hàng'], 
                ['/profile', 'Tài khoản']
              ].map(([href, label]) => (
                <li key={href}><a href={href} className="text-xs text-[#5C5850] hover:text-[#C9973D] transition-colors font-light">{label}</a></li>
              ))}
            </ul>
          </div>

          {/* Scent Families */}
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9973D]/70 mb-4">Nhóm hương</h4>
            <ul className="space-y-2.5">
              {['Floral · Hoa', 'Woody · Gỗ', 'Fresh · Tươi mát', 'Oriental · Phương Đông', 'Gourmand · Bánh kẹo', 'Chypre · Rêu sồi'].map(f => (
                <li key={f} className="text-xs text-[#5C5850] font-light">{f}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9973D]/70 mb-4">Liên hệ</h4>
            <ul className="space-y-2.5 text-xs text-[#5C5850] font-light">
              <li>📍 TP. Hồ Chí Minh, Việt Nam</li>
              <li>✉️ hello@aromaforest.vn</li>
              <li>📞 (+84) 912 345 678</li>
              <li className="pt-2">
                <span className="px-2 py-1 rounded border border-[#6B9E78]/30 text-[#6B9E78] text-[9px] font-mono uppercase tracking-wider">
                  Giao hàng toàn quốc
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#C9973D]/10">
          <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-[#3A3830] uppercase tracking-[0.25em] font-mono">
              © 2026 Aroma Forest · Nguyễn Vũ Hiệp · MSSV: 2123110161
            </p>
            <p className="text-[10px] text-[#C9973D]/30 font-mono">
              Spring Boot · Eureka · API Gateway · JWT · Kafka · Redis · MySQL
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
