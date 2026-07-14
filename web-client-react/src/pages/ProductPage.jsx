import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI, cartAPI, recommendationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import { FiShoppingCart, FiStar, FiArrowLeft } from 'react-icons/fi';

const BACKUP_IMAGES = {
  1: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80",
  2: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80",
  3: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=80",
  4: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80",
  5: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80"
};
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80";

const SCENT_NOTES = {
  1: { top: "Bạch đậu khấu, Hoa diên vĩ", heart: "Hoa violet, Giấy cói", base: "Gỗ đàn hương, Gỗ tuyết tùng, Hổ phách" },
  2: { top: "Hương An-đê-hít, Hoa ngọc lan tây, Dầu hoa cam", heart: "Hoa nhài, Hoa hồng", base: "Gỗ đàn hương, Vani, Cỏ hương bài" },
  3: { top: "Cam Bergamot Calabria, Tiêu Tứ Xuyên", heart: "Hoa oải hương, Tiêu hồng, Cỏ hương bài", base: "Long diên hương, Gỗ tuyết tùng" },
  4: { top: "Cam Bergamot, Quả chanh vàng, Cây bách xù", heart: "Hương trầm, Kim thông, Rễ diên vĩ", base: "Hổ phách, Gỗ đàn hương, Vani" },
  5: { top: "Bưởi tây, Chanh vàng, Bạc hà", heart: "Gừng, Nhục đậu khấu, Hoa nhài", base: "Hương trầm, Gỗ đàn hương, Hoắc hương" }
};

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadProduct();
    loadRecommendations();
    loadReviews();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const products = await productAPI.getAll();
      const found = products?.find(p => p.id === Number(id));
      setProduct(found || null);
    } catch {
      showToast('Không thể tải thông tin sản phẩm nước hoa.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const data = await recommendationAPI.getAll();
      setRecommendations(data || []);
    } catch {
      // silently fail
    }
  };

  const loadReviews = async () => {
    try {
      const data = await recommendationAPI.getByProduct(id);
      setReviews(data || []);
    } catch {
      setReviews([]);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      showToast('Vui lòng đăng nhập để viết đánh giá.', 'warning');
      return;
    }
    setSubmittingReview(true);
    try {
      await recommendationAPI.addRecommendation(user.id, product.id, newRating, newComment);
      showToast('Cảm ơn bạn đã chia sẻ đánh giá mùi hương! ✨');
      setNewComment('');
      setNewRating(5);
      loadReviews();
    } catch {
      showToast('Không thể gửi đánh giá. Vui lòng thử lại.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      showToast('Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ!', 'warning');
      return;
    }
    try {
      await cartAPI.addItem(product.id, 1);
      showToast(`Đã thêm '${product.productName}' vào túi hương của bạn!`);
    } catch {
      showToast('Không thể thêm vào giỏ hàng.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf6] bg-grid">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
            <div className="h-[400px] sm:h-[500px] bg-slate-200/50 rounded-xl" />
            <div className="space-y-6">
              <div className="h-4 bg-slate-200/50 w-1/4" />
              <div className="h-10 bg-slate-200/50 w-3/4" />
              <div className="h-6 bg-slate-200/50 w-1/3" />
              <div className="h-32 bg-slate-200/50 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fffaf6] bg-grid">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-xl font-light text-[#2d2a26] mb-2">Mùi hương này chưa được điều chế</h2>
          <Link to="/" className="text-xs uppercase font-mono tracking-wider text-[#c9b8a0] hover:text-[#b8a690] flex items-center gap-2 mt-2 transition-all">
            <FiArrowLeft /> Trở lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const imgUrl = product.imageUrl || BACKUP_IMAGES[product.id] || DEFAULT_IMAGE;
  const notes = SCENT_NOTES[product.id] || { top: "Hương trái cây tự nhiên", heart: "Hoa nhài, Hoa hồng", base: "Gỗ xạ hương, Hổ phách" };
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-[#fffaf6] bg-grid pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-24">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase font-mono tracking-wider text-[#b8a690] hover:text-[#2d2a26] mb-8 transition-colors">
          <FiArrowLeft /> QUAY LẠI CỬA HÀNG
        </Link>

        {/* Product Detail (Editorial Split Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[#dbccb8]/20 items-start">
          
          {/* Left: Sticky Image (6 Columns) */}
          <div className="md:col-span-6 md:sticky md:top-28 flex items-center justify-center bg-[#fffaf6] border border-[#dbccb8]/20 p-8">
            <img
              src={imgUrl}
              alt={product.productName}
              className="w-full h-auto max-h-[500px] object-cover transition-all duration-700"
              onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
            />
          </div>

          {/* Right: Info (6 Columns) */}
          <div className="md:col-span-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="px-2.5 py-0.5 rounded border border-[#dbccb8]/20 text-[#8a7a6a] text-[10px] font-mono uppercase tracking-widest">
                  {product.category || 'Unisex'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-light text-[#2d2a26] leading-tight tracking-tight">
                {product.productName}
              </h1>

              <div className="flex items-center gap-4">
                <span className="text-2xl font-semibold text-[#1a1a1a]">
                  ${product.price?.toFixed(2)}
                </span>
                {product.availability > 0 ? (
                  <span className="text-[10px] text-[#a8c5a0] font-mono tracking-wider">● CÒN HÀNG ({product.availability})</span>
                ) : (
                  <span className="text-[10px] text-rose-400 font-mono tracking-wider">● HẾT HÀNG</span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5 text-xs text-[#b8a690]">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      className={star <= Math.round(Number(avgRating)) ? "fill-current" : ""}
                    />
                  ))}
                </div>
                <span className="font-mono ml-1">{avgRating} / 5.0 ({reviews.length} đánh giá)</span>
              </div>

              {/* Scent notes details (Editorial Style Spec Sheet) */}
              <div className="border-t border-[#dbccb8]/20 pt-6 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-[#b8a690]">Cấu trúc mùi hương</h3>
                <div className="grid grid-cols-3 gap-4 text-xs font-light">
                  <div className="border-l border-[#dbccb8]/30 pl-3">
                    <p className="font-mono text-[#b8a690] text-[10px] uppercase mb-1">Top Notes</p>
                    <p className="text-[#2d2a26] leading-relaxed">{notes.top}</p>
                  </div>
                  <div className="border-l border-[#dbccb8]/30 pl-3">
                    <p className="font-mono text-[#b8a690] text-[10px] uppercase mb-1">Heart Notes</p>
                    <p className="text-[#2d2a26] leading-relaxed">{notes.heart}</p>
                  </div>
                  <div className="border-l border-[#dbccb8]/30 pl-3">
                    <p className="font-mono text-[#b8a690] text-[10px] uppercase mb-1">Base Notes</p>
                    <p className="text-[#2d2a26] leading-relaxed">{notes.base}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-[#dbccb8]/20 pt-6">
                <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-[#b8a690] mb-2">Mô tả</h3>
                <p className="text-sm text-[#8a8480] leading-relaxed font-light">
                  {product.discription || "Một sáng tạo mùi hương đầy chiều sâu và tinh tế từ Aroma Forest."} Chai nước hoa được thổi thủ công tinh xảo, phản ánh tư duy nghệ thuật tối giản đậm chất Bắc Âu.
                </p>
              </div>
            </div>

            {/* Add to Cart CTA */}
            <div className="pt-8">
              <button
                onClick={addToCart}
                disabled={product.availability === 0}
                className={`w-full py-4 transition-all text-xs font-mono uppercase tracking-[0.25em] active:scale-[0.98] ${
                  product.availability === 0
                    ? 'bg-[#dbccb8]/30 text-[#8a8480] cursor-not-allowed border border-[#dbccb8]/20'
                    : 'bg-[#1a1a1a] text-[#fffaf6] hover:bg-[#2d2a26]'
                }`}
              >
                {product.availability === 0 ? 'TẠM HẾT HÀNG' : 'THÊM VÀO TÚI HƯƠNG'}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20 border-t border-[#dbccb8]/20 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Reviews List (7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-2xl font-light text-[#2d2a26] mb-6">
                Đánh giá từ khách hàng ({reviews.length})
              </h2>

              {reviews.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-[#dbccb8]/30 rounded-2xl bg-[#fffaf6]/20">
                  <p className="text-sm text-[#8a8480] font-light">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên chia sẻ cảm nhận!</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="glass-strong rounded-2xl p-5 border border-[#dbccb8]/10">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#dbccb8]/40 flex items-center justify-center text-[#2d2a26] text-xs font-semibold">
                            {rev.user?.userName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-[#2d2a26] block">{rev.user?.userName}</span>
                            <span className="text-[10px] text-[#8a8480] font-mono">Khách hàng Aroma</span>
                          </div>
                        </div>

                        <div className="flex text-amber-400 text-xs">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <FiStar key={s} className={s <= rev.rating ? "fill-current" : ""} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[#5a5550] leading-relaxed font-light pl-11">
                        {rev.comment || "Sản phẩm tuyệt vời! Mùi hương lưu lâu, quyến rũ và rất tinh tế."}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write Review Form (5 Columns) */}
            <div className="lg:col-span-5">
              <div className="glass-strong rounded-3xl p-6 border border-[#dbccb8]/20 sticky top-28">
                <h3 className="text-lg font-semibold text-[#2d2a26] mb-4">Chia sẻ cảm nhận của bạn</h3>
                {user ? (
                  <form onSubmit={submitReview} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-medium text-[#5a5550] mb-2">Đánh giá của bạn</label>
                      <div className="flex gap-2 text-xl text-[#b8a690]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="transition-transform hover:scale-110 active:scale-95"
                          >
                            <FiStar className={star <= newRating ? "text-amber-400 fill-current" : ""} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#5a5550] mb-1.5">Bình luận về mùi hương</label>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                        rows="4"
                        className="w-full px-4 py-3 rounded-2xl border border-[#dbccb8]/40 bg-[#fffaf6]/50 focus:outline-none focus:border-[#2d2a26] transition-all text-xs text-[#2d2a26] leading-relaxed resize-none"
                        placeholder="Hãy chia sẻ cảm nhận thực tế của bạn về nốt hương, độ lưu hương và thiết kế của chai nước hoa này..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full py-3.5 rounded-full bg-[#1a1a1a] hover:bg-[#2d2a26] text-[#fffaf6] text-xs font-mono uppercase tracking-widest transition-all disabled:opacity-50 active:scale-[0.98]"
                    >
                      {submittingReview ? "ĐANG GỬI..." : "GỬI ĐÁNH GIÁ"}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <p className="text-xs text-[#8a8480] leading-relaxed font-light">Vui lòng đăng nhập tài khoản của bạn để viết bình luận và gửi đánh giá cho chai nước hoa này.</p>
                    <Link to="/login" className="inline-block w-full py-3 rounded-full border border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#fffaf6] text-[#1a1a1a] text-xs font-mono uppercase tracking-widest transition-all text-center">
                      ĐĂNG NHẬP NGAY
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section (Minimalist Grid Row) */}
        {recommendations.length > 0 && (
          <div className="mt-20">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#b8a690] block mb-2">Gợi ý trải nghiệm</span>
            <h2 className="text-2xl font-light text-[#2d2a26] mb-8">Có Thể Bạn Sẽ Thích</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-l border-[#dbccb8]/20">
              {recommendations.slice(0, 4).map((rec) => (
                <Link
                  key={rec.id}
                  to={`/product/${rec.id}`}
                  className="bg-[#fffaf6] p-6 border-r border-b border-[#dbccb8]/20 hover:bg-[#dbccb8]/5 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="aspect-square bg-[#fffaf6] overflow-hidden mb-4">
                      <img
                        src={BACKUP_IMAGES[rec.id] || DEFAULT_IMAGE}
                        alt={rec.productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
                      />
                    </div>
                    <p className="text-sm font-light text-[#2d2a26] group-hover:italic transition-all duration-300 leading-snug">{rec.productName}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#1a1a1a] mt-3">
                    ${rec.price?.toFixed(2)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
