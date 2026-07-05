import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI, cartAPI, recommendationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import { FiShoppingCart, FiStar, FiArrowLeft, FiHeart } from 'react-icons/fi';

const BACKUP_IMAGES = {
  1: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
  2: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
  3: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
  4: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
  5: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&auto=format&fit=crop&q=80"
};
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";

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
    try {
      const products = await productAPI.getAll();
      const found = products?.find(p => p.id === Number(id));
      setProduct(found || null);
    } catch {
      showToast('Không thể tải thông tin sản phẩm.', 'error');
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
      showToast('Vui lòng đăng nhập trước khi mua hàng!', 'warning');
      return;
    }
    try {
      await cartAPI.addItem(product.id, 1);
      showToast(`Đã thêm '${product.productName}' vào giỏ hàng!`);
    } catch {
      showToast('Không thể thêm vào giỏ hàng.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf6] bg-grid">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            <div className="animate-shimmer h-96 rounded-2xl" />
            <div className="space-y-4">
              <div className="animate-shimmer h-6 w-1/4" />
              <div className="animate-shimmer h-10 w-3/4" />
              <div className="animate-shimmer h-8 w-1/3" />
              <div className="animate-shimmer h-24 w-full" />
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
        <div className="flex flex-col items-center justify-center pt-32 animate-fade-in">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-[#2d2a26] mb-2">Sản phẩm không tồn tại</h2>
          <Link to="/" className="text-[#c9b8a0] hover:text-[#b8a690] flex items-center gap-2 mt-2 transition-colors">
            <FiArrowLeft /> Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const imgUrl = BACKUP_IMAGES[product.id] || DEFAULT_IMAGE;

  return (
    <div className="min-h-screen bg-[#fffaf6] bg-grid">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-20">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-[#b8a690] hover:text-[#2d2a26] mb-8 transition-colors animate-fade-in">
          <FiArrowLeft /> Quay lại
        </Link>

        {/* Product Detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in-up">
          {/* Image */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#dbccb8] to-[#c9b8a0] rounded-2xl opacity-20 group-hover:opacity-40 blur-lg transition-opacity duration-300" />
            <img
              src={imgUrl}
              alt={product.productName}
              className="relative w-full h-[400px] sm:h-[500px] object-cover rounded-2xl shadow-xl"
            />
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#dbccb8]/20 border border-[#dbccb8]/30 text-[#8a7a6a] text-xs font-semibold uppercase tracking-wider">
                {product.category || 'General'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-[#2d2a26] leading-tight">
              {product.productName}
            </h1>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-gradient">
                ${product.price?.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-[#b8a690] line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[#d4b896]">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} className={i < 4 ? 'fill-current' : ''} />
              ))}
              <span className="text-[#b8a690] text-sm ml-2">(4.0)</span>
            </div>

            <p className="text-[#8a8480] leading-relaxed">
              Sản phẩm chất lượng cao từ Rainbow Forest. Được vận hành bởi hệ thống microservices
              hiện đại với đầy đủ các tính năng như giỏ hàng, thanh toán và theo dõi đơn hàng.
            </p>

            <button
              onClick={addToCart}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#dbccb8] to-[#c9b8a0] text-[#1a1a1a] font-semibold flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-[#dbccb8]/30 transition-all duration-200 btn-shine group"
            >
              <FiShoppingCart className="text-lg group-hover:scale-110 transition-transform" />
              Thêm Vào Giỏ Hàng
            </button>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-20 animate-fade-in">
            <h2 className="text-2xl font-bold text-[#2d2a26] mb-6">🌟 Gợi Ý Cho Bạn</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 stagger-children">
              {recommendations.slice(0, 5).map((rec) => (
                <Link
                  key={rec.id}
                  to={`/product/${rec.id}`}
                  className="bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden border border-[#dbccb8]/20 shadow-sm card-hover group"
                >
                  <img
                    src={BACKUP_IMAGES[rec.id] || DEFAULT_IMAGE}
                    alt={rec.productName}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <p className="text-xs text-[#2d2a26] font-medium truncate">{rec.productName}</p>
                    <p className="text-xs text-gradient font-bold mt-1">
                      ${rec.price?.toFixed(2)}
                    </p>
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
