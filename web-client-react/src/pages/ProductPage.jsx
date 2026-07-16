import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI, cartAPI, recommendationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import { FiShoppingCart, FiStar, FiArrowLeft, FiDroplet, FiClock, FiActivity, FiAward } from 'react-icons/fi';
import { motion } from 'motion/react';

const BACKUP_IMAGES = {
  1: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80",
  2: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&auto=format&fit=crop&q=80",
  3: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=80",
  4: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80",
  5: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80",
  6: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80",
  7: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80",
  8: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80"
};
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80";

const SCENT_NOTES = {
  1: { top: "Bạch đậu khấu, Hoa diên vĩ",         heart: "Hoa violet, Giấy cói",         base: "Gỗ đàn hương, Hổ phách" },
  2: { top: "Hương An-đê-hít, Hoa ngọc lan tây",   heart: "Hoa nhài, Hoa hồng",           base: "Gỗ đàn hương, Vani" },
  3: { top: "Cam Bergamot, Tiêu Tứ Xuyên",         heart: "Oải hương, Tiêu hồng",         base: "Long diên hương, Tuyết tùng" },
  4: { top: "Cam Bergamot, Chanh vàng, Bách xù",   heart: "Hương trầm, Kim thông",        base: "Hổ phách, Gỗ đàn hương, Vani" },
  5: { top: "Bưởi tây, Chanh vàng, Bạc hà",        heart: "Gừng, Nhục đậu khấu, Nhài",   base: "Hương trầm, Hoắc hương" }
};

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('100ml');
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      const has100ml = product.variants.find(v => v.size === '100ml');
      setSelectedSize(has100ml ? '100ml' : product.variants[0].size);
    }
  }, [product]);

  useEffect(() => { loadProduct(); loadReviews(); }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const currentProd = await productAPI.getOne(id);
      setProduct(currentProd);
      if (currentProd) {
        try {
          // Lấy tất cả sản phẩm và phân loại thông minh theo Nhóm hương (olfactoryFamily) + Danh mục
          const res = await productAPI.getAll();
          const allProds = Array.isArray(res) ? res : (res?.content || []);
          const currentFamily = (currentProd.olfactoryFamily || '').toLowerCase();
          
          const scored = allProds
            .filter(p => p.id !== currentProd.id)
            .map(p => {
              let score = 0;
              const pFamily = (p.olfactoryFamily || '').toLowerCase();
              if (currentFamily && pFamily) {
                // Nếu trùng khớp từ khóa nhóm hương (ví dụ cùng có "Floral" hay "Woody")
                const words = currentFamily.split(/\s+/);
                const matches = words.filter(w => w.length > 2 && pFamily.includes(w));
                score += matches.length * 3;
              }
              if (p.category === currentProd.category) {
                score += 1;
              }
              return { product: p, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 4)
            .map(item => item.product);

          setRecommendations(scored);
        } catch {
          setRecommendations([]);
        }
      }
    } catch { 
      showToast('Không thể tải thông tin sản phẩm.', 'error'); 
    } finally { 
      setLoading(false); 
    }
  };

  const loadReviews = async () => {
    try { setReviews((await recommendationAPI.getByProduct(id)) || []); } catch { setReviews([]); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user?.id) { showToast('Vui lòng đăng nhập để viết đánh giá.', 'warning'); return; }
    setSubmittingReview(true);
    try {
      await recommendationAPI.addRecommendation(user.id, product.id, newRating, newComment);
      showToast('Cảm ơn bạn đã chia sẻ đánh giá!');
      setNewComment(''); setNewRating(5); loadReviews();
    } catch { showToast('Không thể gửi đánh giá. Vui lòng thử lại.', 'error'); }
    finally { setSubmittingReview(false); }
  };

  const addToCart = async () => {
    if (!user) { showToast('Vui lòng đăng nhập trước khi thêm vào giỏ!', 'warning'); return; }
    try { 
      await cartAPI.addItem(product.id, 1, selectedSize); 
      showToast(`Đã thêm '${product.productName}' (${selectedSize}) vào giỏ hàng!`); 
    }
    catch { showToast('Không thể thêm vào giỏ hàng.', 'error'); }
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0B09] bg-grid">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 pt-28 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
            <div className="h-[450px] animate-shimmer rounded-2xl" />
            <div className="space-y-5">
              <div className="h-3 animate-shimmer w-1/4 rounded" />
              <div className="h-10 animate-shimmer w-3/4 rounded" />
              <div className="h-6 animate-shimmer w-1/3 rounded" />
              <div className="h-32 animate-shimmer w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!product) {
    return (
      <div className="min-h-screen bg-[#0C0B09] bg-grid">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-40 gap-4">
          <FiDroplet className="text-5xl text-[#C9973D]/30" />
          <h2 className="font-display text-2xl font-light text-[#EDE8DF]">Mùi hương chưa được điều chế</h2>
          <Link to="/" className="text-xs uppercase font-mono tracking-wider text-[#C9973D] hover:text-[#DDB05A] flex items-center gap-2 transition-all">
            <FiArrowLeft /> Trở lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const imgUrl  = product.imageUrl || BACKUP_IMAGES[product.id] || DEFAULT_IMAGE;
  const notes   = SCENT_NOTES[product.id] || { top: "Hương trái cây", heart: "Hoa nhài, Hoa hồng", base: "Gỗ xạ hương, Hổ phách" };
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-[#0C0B09] bg-grid pb-20 text-[#EDE8DF]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-28">
        <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase font-mono tracking-wider text-[#9A9080] hover:text-[#C9973D] mb-8 transition-colors">
          <FiArrowLeft /> QUAY LẠI CỬA HÀNG
        </Link>

        {/* ── Product Detail ── */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[#C9973D]/10 items-start"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Left: Image */}
          <div className="md:col-span-6 md:sticky md:top-28 bg-[#161510] border border-[#C9973D]/12 rounded-2xl overflow-hidden flex items-center justify-center p-8 aspect-square">
            <img src={imgUrl} alt={product.productName}
              className="w-full h-full max-h-[480px] object-contain transition-all duration-700 hover:scale-105"
              onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }} />
          </div>

          {/* Right: Info */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            {/* Category badge */}
            <span className="inline-block px-3 py-1 rounded-full border border-[#C9973D]/25 bg-[#C9973D]/10 text-[#C9973D] text-[10px] font-mono uppercase tracking-widest w-fit">
              {product.category || 'Unisex'}
            </span>

            <h1 className="font-display text-4xl sm:text-5xl font-light text-[#EDE8DF] leading-tight tracking-tight">
              {product.productName}
            </h1>

            {/* Price + Stock */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-semibold text-[#C9973D] font-mono">
                ${(product.variants?.find(v => v.size === selectedSize)?.price || product.price)?.toFixed(2)}
              </span>
              {(product.variants?.find(v => v.size === selectedSize)?.stock ?? product.availability) > 0
                ? <span className="text-[10px] text-[#6B9E78] font-mono tracking-wider">
                    ● CÒN HÀNG ({(product.variants?.find(v => v.size === selectedSize)?.stock ?? product.availability)})
                  </span>
                : <span className="text-[10px] text-rose-400 font-mono tracking-wider">● HẾT HÀNG</span>}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 text-xs text-[#9A9080]">
              <div className="flex text-[#C9973D]">
                {[1, 2, 3, 4, 5].map(s => (
                  <FiStar key={s} className={s <= Math.round(Number(avgRating)) ? 'fill-current' : ''} />
                ))}
              </div>
              <span className="font-mono">{avgRating} / 5.0 ({reviews.length} đánh giá)</span>
            </div>

            {/* Size Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="border-t border-[#C9973D]/10 pt-5 space-y-3">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9973D]/60">Chọn dung tích (Size Options)</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedSize(v.size)}
                      className={`px-4 py-2 rounded-full border text-xs font-mono transition-all ${
                        selectedSize === v.size
                          ? 'border-[#C9973D] bg-[#C9973D] text-[#0C0B09] font-semibold'
                          : 'border-[#C9973D]/25 bg-transparent text-[#EDE8DF] hover:border-[#C9973D]/60'
                      }`}
                    >
                      {v.size} - ${v.price.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-t border-[#C9973D]/10 pt-5 space-y-4">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9973D]/60">Đặc tính mùi hương & Hiệu năng</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#9A9080] flex items-center gap-1">
                      <FiClock className="text-[#C9973D]" /> Lưu hương:
                    </span>
                    <span className="text-[#C9973D] font-semibold">{product.longevity || '6-8 giờ'}</span>
                  </div>
                  <div className="h-2 bg-[#1E1C18] rounded-full overflow-hidden border border-[#C9973D]/12 p-[2px]">
                    <div className="h-full bg-gradient-to-r from-[#A87B2C] to-[#C9973D] rounded-full transition-all duration-1000" style={{ width: product.longevity?.includes('10') || product.longevity?.includes('12') ? '90%' : '70%' }} />
                  </div>
                  <span className="block text-[8px] font-mono text-[#5C5850] text-right">
                    {product.longevity?.includes('10') || product.longevity?.includes('12') ? 'Xuất sắc (8-12h)' : 'Khá tốt (6-8h)'}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#9A9080] flex items-center gap-1">
                      <FiActivity className="text-[#C9973D]" /> Tỏa hương:
                    </span>
                    <span className="text-[#C9973D] font-semibold">{product.sillage || '1 cánh tay'}</span>
                  </div>
                  <div className="h-2 bg-[#1E1C18] rounded-full overflow-hidden border border-[#C9973D]/12 p-[2px]">
                    <div className="h-full bg-gradient-to-r from-[#A87B2C] to-[#C9973D] rounded-full transition-all duration-1000" style={{ width: product.sillage?.toLowerCase().includes('strong') || product.sillage?.toLowerCase().includes('xa') ? '85%' : '60%' }} />
                  </div>
                  <span className="block text-[8px] font-mono text-[#5C5850] text-right">
                    {product.sillage?.toLowerCase().includes('strong') || product.sillage?.toLowerCase().includes('xa') ? 'Tỏa xa (>2m)' : 'Vừa phải (1 cánh tay)'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-[10px] font-mono pt-1">
                <span className="text-[#9A9080]">Nhóm hương (Family):</span>
                <span className="text-[#C9973D] font-semibold">{product.olfactoryFamily || 'Woody'}</span>
              </div>
            </div>

            {/* Visual Olfactory Pyramid */}
            <div className="border-t border-[#C9973D]/12 pt-6 space-y-4">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9973D]/60 mb-2">Tháp Hương (Olfactory Pyramid)</h3>
              <div className="flex flex-col items-center justify-center py-4 bg-[#161510]/30 border border-[#C9973D]/08 rounded-2xl w-full max-w-md">
                <div className="relative w-full flex flex-col items-center space-y-2.5 px-4">
                  {/* Top Note */}
                  <div className="group w-[60%] relative flex flex-col items-center p-3.5 bg-[#1C1A14] hover:bg-[#C9973D]/10 border border-[#C9973D]/15 rounded-t-2xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(201,151,61,0.08)] cursor-default">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#C9973D]/05 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#C9973D]/12 text-[#C9973D] text-[9px] font-mono uppercase tracking-widest mb-1.5 font-semibold">
                      <FiDroplet className="text-[10px]" /> Hương đầu (Top)
                    </span>
                    <span className="text-[11px] font-light text-center text-[#EDE8DF] group-hover:text-[#C9973D] transition-colors">{product.topNotes || notes.top}</span>
                  </div>

                  {/* Heart Note */}
                  <div className="group w-[80%] relative flex flex-col items-center p-3.5 bg-[#181611] hover:bg-[#C9973D]/10 border border-[#C9973D]/20 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(201,151,61,0.08)] cursor-default">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#C9973D]/05 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#C9973D]/12 text-[#C9973D] text-[9px] font-mono uppercase tracking-widest mb-1.5 font-semibold">
                      <FiActivity className="text-[10px]" /> Hương giữa (Heart)
                    </span>
                    <span className="text-[11px] font-light text-center text-[#EDE8DF] group-hover:text-[#C9973D] transition-colors">{product.middleNotes || notes.heart}</span>
                  </div>

                  {/* Base Note */}
                  <div className="group w-full relative flex flex-col items-center p-3.5 bg-[#14120E] hover:bg-[#C9973D]/10 border border-[#C9973D]/25 rounded-b-2xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(201,151,61,0.08)] cursor-default">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#C9973D]/05 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl" />
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#C9973D]/12 text-[#C9973D] text-[9px] font-mono uppercase tracking-widest mb-1.5 font-semibold">
                      <FiAward className="text-[10px]" /> Hương cuối (Base)
                    </span>
                    <span className="text-[11px] font-light text-center text-[#EDE8DF] group-hover:text-[#C9973D] transition-colors">{product.baseNotes || notes.base}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-[#C9973D]/10 pt-5">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C9973D]/60 mb-2">Mô tả</h3>
              <p className="text-xs text-[#9A9080] leading-relaxed font-light">
                {product.discription || 'Một sáng tạo mùi hương đầy chiều sâu và tinh tế từ Aroma Forest.'} Chai nước hoa được thổi thủ công tinh xảo, phản ánh tư duy nghệ thuật tối giản.
              </p>
            </div>

            {/* Add to Cart */}
            <div className="pt-2">
              <button 
                onClick={addToCart} 
                disabled={(product.variants?.find(v => v.size === selectedSize)?.stock ?? product.availability) === 0}
                className={`w-full py-4 rounded-full transition-all text-xs font-mono uppercase tracking-[0.25em] active:scale-[0.98] font-semibold ${
                  (product.variants?.find(v => v.size === selectedSize)?.stock ?? product.availability) === 0
                    ? 'bg-[#1E1C18] text-[#5C5850] cursor-not-allowed border border-[#C9973D]/10'
                    : 'bg-[#C9973D] text-[#0C0B09] hover:bg-[#DDB05A] shadow-[0_0_24px_rgba(201,151,61,0.25)]'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <FiShoppingCart />
                  {(product.variants?.find(v => v.size === selectedSize)?.stock ?? product.availability) === 0 ? 'TẠM HẾT HÀNG' : 'THÊM VÀO GIỎ HÀNG'}
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Reviews ── */}
        <div className="mt-20 border-t border-[#C9973D]/10 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Reviews list */}
            <div className="lg:col-span-7 space-y-5">
              <h2 className="font-display text-2xl font-light text-[#EDE8DF]">Đánh giá từ khách hàng ({reviews.length})</h2>

              {reviews.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-[#C9973D]/15 rounded-xl bg-[#161510]/30">
                  <p className="text-sm text-[#9A9080] font-light">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="bg-[#161510] border border-[#C9973D]/10 rounded-xl p-5 hover:border-[#C9973D]/20 transition-all">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9973D] to-[#A87B2C] flex items-center justify-center text-[#0C0B09] text-xs font-bold">
                            {rev.user?.userName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-[#EDE8DF] block">{rev.user?.userName}</span>
                            <span className="text-[10px] text-[#5C5850] font-mono">Khách hàng Aroma</span>
                          </div>
                        </div>
                        <div className="flex text-[#C9973D] text-xs">
                          {[1, 2, 3, 4, 5].map(s => <FiStar key={s} className={s <= rev.rating ? 'fill-current' : 'text-[#5C5850]'} />)}
                        </div>
                      </div>
                      <p className="text-xs text-[#9A9080] leading-relaxed font-light pl-11">
                        {rev.comment || 'Sản phẩm tuyệt vời! Mùi hương lưu lâu, quyến rũ và rất tinh tế.'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write review */}
            <div className="lg:col-span-5">
              <div className="bg-[#161510] border border-[#C9973D]/12 rounded-2xl p-6 sticky top-28">
                <h3 className="font-display text-xl font-medium text-[#EDE8DF] mb-5">Chia sẻ cảm nhận</h3>
                {user ? (
                  <form onSubmit={submitReview} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-medium text-[#9A9080] mb-2">Đánh giá của bạn</label>
                      <div className="flex gap-2 text-xl">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} type="button" onClick={() => setNewRating(star)}
                            className="transition-transform hover:scale-110 active:scale-95">
                            <FiStar className={star <= newRating ? 'text-[#C9973D] fill-current' : 'text-[#5C5850]'} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#9A9080] mb-1.5">Bình luận về mùi hương</label>
                      <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} required rows="4"
                        className="w-full px-4 py-3 rounded-xl border border-[#C9973D]/15 bg-[#0C0B09] text-[#EDE8DF] placeholder-[#5C5850] focus:outline-none focus:border-[#C9973D]/40 transition-all text-xs leading-relaxed resize-none"
                        placeholder="Chia sẻ cảm nhận về nốt hương, độ lưu hương và thiết kế chai..." />
                    </div>
                    <button type="submit" disabled={submittingReview}
                      className="w-full py-3.5 rounded-full bg-[#C9973D] text-[#0C0B09] text-xs font-mono uppercase tracking-widest hover:bg-[#DDB05A] transition-all disabled:opacity-50 active:scale-[0.98] font-semibold">
                      {submittingReview ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <p className="text-xs text-[#9A9080] leading-relaxed font-light">Đăng nhập để viết đánh giá cho sản phẩm này.</p>
                    <Link to="/login" className="inline-block w-full py-3 rounded-full border border-[#C9973D]/40 text-[#C9973D] hover:bg-[#C9973D] hover:text-[#0C0B09] text-xs font-mono uppercase tracking-widest transition-all text-center">
                      ĐĂNG NHẬP NGAY
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Recommendations ── */}
        {recommendations.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl font-light text-[#EDE8DF] mb-8">Có Thể Bạn Sẽ Thích</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations.slice(0, 4).map((rec) => (
                <Link key={rec.id} to={`/product/${rec.id}`}
                  className="group bg-[#161510] border border-[#C9973D]/10 rounded-xl overflow-hidden hover:border-[#C9973D]/30 hover:shadow-[0_0_20px_rgba(0,0,0,0.4)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <div className="aspect-square bg-[#1E1C18] overflow-hidden">
                    <img src={rec.imageUrl || BACKUP_IMAGES[rec.id] || DEFAULT_IMAGE} alt={rec.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }} />
                  </div>
                  <div className="p-4">
                    <p className="font-display text-sm text-[#EDE8DF] group-hover:text-[#C9973D] transition-colors leading-snug">{rec.productName}</p>
                    <p className="text-sm font-semibold text-[#C9973D] font-mono mt-2">${rec.price?.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
