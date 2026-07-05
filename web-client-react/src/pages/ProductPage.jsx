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
  5: "https://images.unsplash.com/photo-1588405748373-122b2321bc31?w=800&auto=format&fit=crop&q=80"
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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadProduct();
    loadRecommendations();
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

  const imgUrl = BACKUP_IMAGES[product.id] || DEFAULT_IMAGE;
  const notes = SCENT_NOTES[product.id] || { top: "Hương trái cây tự nhiên", heart: "Hoa nhài, Hoa hồng", base: "Gỗ xạ hương, Hổ phách" };

  return (
    <div className="min-h-screen bg-[#fffaf6] bg-grid pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-24">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase font-mono tracking-wider text-[#b8a690] hover:text-[#2d2a26] mb-8 transition-colors">
          <FiArrowLeft /> QUAY LẠI CỬA HÀNG
        </Link>

        {/* Product Detail (Editorial Split Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[#dbccb8]/20">
          
          {/* Left: Sticky Image (6 Columns) */}
          <div className="md:col-span-6 flex items-center justify-center bg-[#fffaf6] border border-[#dbccb8]/20 p-8">
            <img
              src={imgUrl}
              alt={product.productName}
              className="w-full h-auto max-h-[500px] object-cover grayscale opacity-95 hover:grayscale-0 transition-all duration-700"
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
                  <FiStar className="fill-current" />
                  <FiStar className="fill-current" />
                  <FiStar className="fill-current" />
                  <FiStar className="fill-current" />
                  <FiStar />
                </div>
                <span className="font-mono ml-1">4.8 / 5.0 (28 reviews)</span>
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
                        className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
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
