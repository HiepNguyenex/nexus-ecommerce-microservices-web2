import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FiArrowRight, FiRotateCcw, FiShoppingCart, FiInfo, FiAward } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { productAPI, cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const QUESTIONS = [
  {
    id: 1,
    question: "Bạn đang tìm kiếm mùi hương dành cho ai?",
    options: [
      { text: "Dành cho Nữ (Feminine)", value: "Women" },
      { text: "Dành cho Nam (Masculine)", value: "Men" },
      { text: "Cho cả hai / Phi giới tính (Unisex)", value: "Unisex" }
    ]
  },
  {
    id: 2,
    question: "Phong cách cá nhân nổi bật của bạn là gì?",
    options: [
      { text: "Tự do, sảng khoái & năng động", value: "fresh" },
      { text: "Thanh lịch, lãng mạn & dịu dàng", value: "elegant" },
      { text: "Bí ẩn, gợi cảm & đầy cuốn hút", value: "seductive" },
      { text: "Sang trọng, quyền lực & cổ điển", value: "classic" }
    ]
  },
  {
    id: 3,
    question: "Thời điểm bạn muốn sử dụng chai nước hoa này nhất?",
    options: [
      { text: "Hằng ngày đi làm, đi học (Văn phòng nhẹ nhàng)", value: "daily" },
      { text: "Hẹn hò lãng mạn, đi chơi buổi tối", value: "date" },
      { text: "Dịp đặc biệt, tiệc tùng sang trọng", value: "party" }
    ]
  },
  {
    id: 4,
    question: "Nhóm mùi hương nào khiến bạn cảm thấy dễ chịu nhất?",
    options: [
      { text: "Hương hoa cỏ tự nhiên, trái cây ngọt ngào", value: "floral" },
      { text: "Hương gỗ ấm áp, rêu sồi ẩm ướt và hổ phách", value: "woody" },
      { text: "Hương cam chanh tươi mát, muối biển sảng khoái", value: "aquatic" },
      { text: "Hương gia vị cay ấm, khói trầm trầm mặc", value: "spicy" }
    ]
  }
];

export default function ScentFinderPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    productAPI.getAll().then(data => setProducts(data || [])).catch(() => { });
  }, []);

  const handleSelectOption = (optionValue) => {
    const updatedAnswers = { ...answers, [QUESTIONS[currentStep].id]: optionValue };
    setAnswers(updatedAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      calculateResults(updatedAnswers);
    }
  };

  const calculateResults = (finalAnswers) => {
    const genderPref = finalAnswers[1]; // Women, Men, Unisex
    const stylePref = finalAnswers[2];  // fresh, elegant, seductive, classic
    const occasionPref = finalAnswers[3]; // daily, date, party
    const scentPref = finalAnswers[4];  // floral, woody, aquatic, spicy

    // Scoring algorithm for each product
    const scoredProducts = products.map(product => {
      let score = 0;

      // 1. Gender Match
      if (genderPref === "Unisex") {
        score += 2; // Unisex matches anything
      } else if (product.category === genderPref) {
        score += 4;
      } else if (product.category === "Unisex") {
        score += 3;
      }

      // 2. Olfactory Family & Scent Preference Match
      const family = (product.olfactoryFamily || '').toLowerCase();
      const desc = (product.discription || '').toLowerCase();

      if (scentPref === "floral" && (family.includes('floral') || family.includes('flower') || desc.includes('violet') || desc.includes('rose') || desc.includes('jasmine'))) {
        score += 5;
      } else if (scentPref === "woody" && (family.includes('woody') || family.includes('wood') || family.includes('amber') || desc.includes('sandalwood') || desc.includes('cedar'))) {
        score += 5;
      } else if (scentPref === "aquatic" && (family.includes('aquatic') || family.includes('marine') || family.includes('fresh') || family.includes('citrus') || desc.includes('salt') || desc.includes('lemon') || desc.includes('sea'))) {
        score += 5;
      } else if (scentPref === "spicy" && (family.includes('spicy') || family.includes('spices') || family.includes('oriental') || desc.includes('pepper') || desc.includes('cardamom') || desc.includes('incense'))) {
        score += 5;
      }

      // 3. Style & Occasion context
      const name = product.productName.toLowerCase();
      if (stylePref === "fresh" && (family.includes('fresh') || family.includes('citrus') || family.includes('aquatic') || name.includes('sage') || name.includes('sea') || name.includes('gio') || name.includes('chance') || name.includes('chloe') || name.includes('daisy'))) {
        score += 3;
      }
      if (stylePref === "elegant" && (family.includes('floral') || family.includes('soft') || name.includes('bloom') || name.includes('daisy') || name.includes('libre') || name.includes('flowerbomb') || name.includes('chloe') || name.includes('chance') || name.includes('portrait') || name.includes('la vie'))) {
        score += 3;
      }
      if (stylePref === "seductive" && (family.includes('amber') || family.includes('oriental') || name.includes('eros') || name.includes('rouge') || name.includes('nuit') || name.includes('flowerbomb') || name.includes('tobacco') || name.includes('man in black') || name.includes('million') || name.includes('portrait'))) {
        score += 3;
      }
      if (stylePref === "classic" && (name.includes('no. 5') || name.includes('aventus') || name.includes('santal') || name.includes('oud') || name.includes('vetiver') || name.includes('guerlain') || name.includes('tobacco') || name.includes('portrait') || name.includes('profumo'))) {
        score += 3;
      }

      // Occasion matching
      if (occasionPref === "daily" && (product.price < 200 || family.includes('fresh') || family.includes('cologne') || family.includes('aquatic') || name.includes('sage') || name.includes('daisy') || name.includes('gio') || name.includes('chloe') || name.includes('chance'))) {
        score += 2;
      }
      if (occasionPref === "date" && (name.includes('santal') || name.includes('eros') || name.includes('sauvage') || name.includes('nuit') || name.includes('libre') || name.includes('flowerbomb') || name.includes('lazy sunday') || name.includes('man in black') || name.includes('chance'))) {
        score += 3;
      }
      if (occasionPref === "party" && (product.price >= 200 || name.includes('rouge') || name.includes('aventus') || name.includes('oud') || name.includes('tobacco') || name.includes('million') || name.includes('portrait') || name.includes('malle'))) {
        score += 3;
      }

      return { product, score };
    });

    // Sort by score descending and take top 3
    const topMatches = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => {
        // Calculate match percentage based on total potential score (max 15 points)
        const percent = Math.min(99, Math.max(65, Math.round((item.score / 15) * 100)));
        return {
          ...item.product,
          matchScore: percent
        };
      });

    setRecommendations(topMatches);
    setShowResults(true);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setRecommendations([]);
    setShowResults(false);
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      showToast('Vui lòng đăng nhập để thêm vào giỏ hàng.', 'warning');
      return;
    }
    // Prefer adding 10ml decants for trial or 100ml full bottle based on availability
    const selectedSize = product.variants && product.variants.length > 0
      ? (product.variants.find(v => v.size === '10ml')?.size || product.variants[0].size)
      : '100ml';

    try {
      await cartAPI.addItem(product.id, 1, selectedSize);
      showToast(`Đã thêm '${product.productName}' (${selectedSize}) vào giỏ hàng!`);
    } catch {
      showToast('Không thể thêm vào giỏ hàng.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0B09] bg-grid pb-20 text-[#EDE8DF]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-32">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full border border-[#C9973D]/25 bg-[#C9973D]/10 text-[#C9973D] text-[10px] font-mono uppercase tracking-widest mb-3">
            Scent Discovery
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-light text-[#EDE8DF] tracking-wide">
            Bộ Tìm Kiếm Mùi Hương Thông Minh
          </h1>
          <p className="text-xs text-[#9A9080] font-light max-w-md mx-auto mt-2 leading-relaxed">
            Trả lời 4 câu hỏi đơn giản để tìm ra mùi hương độc bản phản ánh cá tính và cảm xúc của bạn.
          </p>
        </div>

        <div className="bg-[#161510] border border-[#C9973D]/12 rounded-2xl p-6 sm:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <AnimatePresence mode="wait">
            {!showResults ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono text-[#9A9080] uppercase tracking-wider">
                    <span>Câu hỏi {currentStep + 1} / {QUESTIONS.length}</span>
                    <span>{Math.round(((currentStep) / QUESTIONS.length) * 100)}% Hoàn thành</span>
                  </div>
                  <div className="h-1 bg-[#1E1C18] rounded-full overflow-hidden border border-[#C9973D]/10">
                    <div
                      className="h-full bg-gradient-to-r from-[#A87B2C] to-[#C9973D] rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question Title */}
                <h2 className="font-display text-xl sm:text-2xl font-light text-[#EDE8DF] leading-snug">
                  {QUESTIONS[currentStep].question}
                </h2>

                {/* Options List */}
                <div className="grid grid-cols-1 gap-3 pt-2">
                  {QUESTIONS[currentStep].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(opt.value)}
                      className="w-full text-left px-6 py-4 rounded-xl border border-[#C9973D]/15 bg-[#0C0B09] hover:border-[#C9973D]/40 hover:bg-[#C9973D]/5 transition-all text-xs sm:text-sm font-light text-[#EDE8DF] flex items-center justify-between group active:scale-[0.99]"
                    >
                      <span>{opt.text}</span>
                      <FiArrowRight className="text-[#9A9080] group-hover:text-[#C9973D] group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <FiAward className="text-4xl text-[#C9973D] mx-auto mb-2" />
                  <h2 className="font-display text-2xl font-light text-[#EDE8DF]">Hương thơm dành riêng cho bạn</h2>
                  <p className="text-xs text-[#9A9080] font-light">Chúng tôi đã tìm thấy 3 tác phẩm mùi hương cực kỳ phù hợp với cá tính của bạn.</p>
                </div>

                {/* Matches List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {recommendations.map((prod, index) => (
                      <div
                        key={prod.id}
                        className={`relative bg-[#0C0B09] border ${index === 0 ? 'border-[#C9973D] shadow-[0_0_24px_rgba(201,151,61,0.2)]' : 'border-[#C9973D]/15'} rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#C9973D]/40 transition-all duration-300`}
                      >
                        {/* Match percentage badge */}
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#161510]/80 border border-[#C9973D]/30 text-[#C9973D] text-[9px] font-mono font-semibold z-10 flex items-center gap-1 backdrop-blur-sm">
                          <span>Độ tương thích:</span>
                          <span className="text-white font-bold">{prod.matchScore}%</span>
                        </div>

                        {index === 0 && (
                          <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-[#C9973D] text-[#0C0B09] text-[8px] font-mono uppercase tracking-widest font-semibold z-10">
                            Phù hợp nhất
                          </span>
                        )}

                        <div>
                          {/* Image */}
                          <div className="aspect-[4/3] bg-[#161510] overflow-hidden flex items-center justify-center p-4 relative pt-10">
                            <img
                              src={prod.imageUrl || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=300'}
                              alt={prod.productName}
                              className="h-full object-contain hover:scale-105 transition-all duration-500"
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=300'; }}
                            />
                          </div>
                          {/* Info */}
                          <div className="p-4 space-y-2">
                            <div className="flex flex-wrap gap-1">
                              <span className="inline-block text-[8px] font-mono uppercase text-[#C9973D] tracking-wider bg-[#C9973D]/10 px-1.5 py-0.5 rounded">
                                {prod.olfactoryFamily || 'Woody'}
                              </span>
                              <span className="inline-block text-[8px] font-mono uppercase text-[#9A9080] tracking-wider bg-[#EDE8DF]/5 px-1.5 py-0.5 rounded">
                                {prod.category}
                              </span>
                            </div>
                            <h3 className="font-display text-sm text-[#EDE8DF] line-clamp-1">{prod.productName}</h3>
                            <p className="text-[10px] text-[#9A9080] line-clamp-2 leading-relaxed font-light font-sans">
                              {prod.discription || 'Sự hòa quyện tinh túy của các nốt hương nghệ thuật.'}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 pt-0 border-t border-[#C9973D]/10 bg-[#161510]/40 space-y-2">
                          <div className="flex justify-between items-center py-2">
                            <span className="text-[10px] font-mono text-[#5C5850]">Giá khoảng:</span>
                            <span className="text-xs font-mono font-semibold text-[#C9973D]">${prod.price?.toFixed(2)}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Link
                              to={`/product/${prod.id}`}
                              className="py-2 rounded-lg border border-[#C9973D]/30 text-[#EDE8DF] hover:border-[#C9973D]/60 text-[10px] font-mono uppercase text-center flex items-center justify-center gap-1 transition-all"
                            >
                              <FiInfo /> Chi tiết
                            </Link>
                            <button
                              onClick={() => handleAddToCart(prod)}
                              className="py-2 rounded-lg bg-[#C9973D] text-[#0C0B09] text-[10px] font-mono uppercase font-semibold flex items-center justify-center gap-1 hover:bg-[#DDB05A] transition-all"
                            >
                              <FiShoppingCart /> Thử ngay
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reset button */}
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 rounded-full border border-[#C9973D]/30 hover:border-[#C9973D] text-[#C9973D] hover:text-[#EDE8DF] text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <FiRotateCcw /> Tìm lại mùi hương
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }