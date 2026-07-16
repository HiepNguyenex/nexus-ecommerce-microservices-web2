import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import { FiHeart, FiShoppingCart, FiShare2, FiArrowLeft, FiTrash2 } from 'react-icons/fi';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&auto=format&fit=crop&q=80";

export default function WishlistPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wishlist') || '[]');
    } catch {
      return [];
    }
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [wishlist]);

  const loadProducts = async () => {
    try {
      const data = await productAPI.getAll();
      const filtered = (data || []).filter(p => wishlist.includes(p.id));
      setProducts(filtered);
    } catch {
      showToast('Không thể tải danh sách sản phẩm yêu thích.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (productId) => {
    const updated = wishlist.filter(id => id !== productId);
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    showToast('Đã xóa sản phẩm khỏi danh sách yêu thích.');
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      return showToast('Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ!', 'warning');
    }

    const trialSize = product.variants && product.variants.length > 0
      ? product.variants.reduce((min, v) => {
          const sizes = { '2ml': 1, '5ml': 2, '10ml': 3, '30ml': 4, '50ml': 5, '100ml': 6 };
          return (sizes[v.size] || 99) < (sizes[min.size] || 99) ? v : min;
        }).size
      : '100ml';

    try {
      await cartAPI.addItem(product.id, 1, trialSize);
      showToast(`Đã thêm '${product.productName}' (${trialSize} — mẫu thử) vào giỏ hàng!`, 'success');
    } catch {
      showToast('Không thể thêm vào giỏ hàng.', 'error');
    }
  };

  const handleShare = () => {
    if (wishlist.length === 0) {
      return showToast('Danh sách yêu thích đang trống, không có gì để chia sẻ.', 'warning');
    }
    const listStr = wishlist.join(',');
    const shareUrl = `${window.location.origin}/?wishlist=${listStr}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('Đã sao chép liên kết danh sách yêu thích vào bộ nhớ tạm!', 'success');
  };

  return (
    <div className="min-h-screen bg-[#0C0B09] bg-grid pb-20 text-[#EDE8DF]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-28">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase font-mono tracking-wider text-[#9A9080] hover:text-[#C9973D] mb-4 transition-colors">
              <FiArrowLeft /> QUAY LẠI TRANG CHỦ
            </Link>
            <h1 className="font-display text-4xl sm:text-5xl font-light text-[#EDE8DF] leading-tight tracking-tight">
              Túi Hương <span className="italic text-gradient">Yêu Thích</span>
            </h1>
          </div>
          
          <button 
            onClick={handleShare}
            className="self-start sm:self-center flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#C9973D]/25 bg-transparent hover:border-[#C9973D] text-xs font-mono uppercase tracking-wider text-[#EDE8DF] transition-all hover:shadow-[0_0_15px_rgba(201,151,61,0.15)] active:scale-95"
          >
            <FiShare2 /> Chia sẻ bộ sưu tập
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-96 rounded-2xl bg-[#161510]/50 border border-[#C9973D]/10 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-[#C9973D]/20 bg-[#161510]/40 rounded-3xl max-w-xl mx-auto">
            <FiHeart className="text-5xl text-[#C9973D]/30 mx-auto mb-4" />
            <h3 className="font-display text-2xl font-light text-[#EDE8DF] mb-2">Chưa lưu hương thơm nào</h3>
            <p className="text-xs text-[#9A9080] font-mono uppercase tracking-wider mb-6">Khám phá các chai nước hoa tinh tuyển và lưu lại mùi hương bạn yêu thích</p>
            <Link to="/" className="inline-block px-6 py-3 rounded-full bg-[#C9973D] text-[#0C0B09] text-xs font-mono uppercase tracking-widest hover:bg-[#DDB05A] transition-all font-semibold shadow-[0_0_24px_rgba(201,151,61,0.2)]">Mua Sắm Ngay</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group relative bg-[#161510] border border-[#C9973D]/12 rounded-2xl overflow-hidden hover:border-[#C9973D]/30 transition-all duration-500 flex flex-col h-full hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                {/* Image */}
                <div className="relative aspect-[4/5] bg-[#1E1C18] overflow-hidden flex-shrink-0">
                  <img 
                    src={product.imageUrl || DEFAULT_IMAGE} 
                    alt={product.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161510] via-[#161510]/10 to-transparent opacity-60" />
                  
                  {/* Remove Button */}
                  <button 
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#0C0B09]/80 border border-rose-500/20 text-[#9A9080] hover:text-rose-400 hover:border-rose-500/40 flex items-center justify-center transition-all duration-300 backdrop-blur-sm active:scale-90"
                    title="Xóa khỏi danh sách"
                  >
                    <FiTrash2 className="text-xs" />
                  </button>

                  <span className="absolute bottom-4 left-4 text-[9px] font-mono tracking-widest text-[#C9973D] bg-[#C9973D]/10 border border-[#C9973D]/20 px-2 py-0.5 rounded uppercase">
                    {product.olfactoryFamily || 'Woody'}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div className="space-y-1 mb-4">
                    <Link to={`/product/${product.id}`} className="block">
                      <h3 className="font-display text-lg font-light text-[#EDE8DF] hover:text-[#C9973D] transition-colors line-clamp-1">
                        {product.productName}
                      </h3>
                    </Link>
                    <p className="text-xs text-[#9A9080] line-clamp-2 leading-relaxed font-light">
                      {product.discription || 'Một sáng tạo mùi hương đầy chiều sâu và tinh tế từ Aroma Forest.'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-t border-[#C9973D]/08 pt-3">
                      <span className="text-[10px] font-mono text-[#5C5850]">GIÁ THỬ MÙI</span>
                      <span className="text-sm font-bold text-[#C9973D] font-mono">
                        ${product.variants && product.variants.length > 0 
                          ? Math.min(...product.variants.map(v => v.price)).toFixed(2)
                          : '0.00'}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-3 rounded-xl bg-[#C9973D] text-[#0C0B09] hover:bg-[#DDB05A] text-xs font-mono uppercase tracking-wider font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_4px_12px_rgba(201,151,61,0.15)]"
                    >
                      <FiShoppingCart className="text-xs" /> Thêm Mẫu Thử
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
