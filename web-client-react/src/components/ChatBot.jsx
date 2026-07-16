import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { sendChatMessage } from '../services/openrouter';
import { productAPI } from '../services/api';

/* ── Icons ── */
const SparkleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3L13.4 8.6L19 10L13.4 11.4L12 17L10.6 11.4L5 10L10.6 8.6L12 3Z" fill="currentColor" stroke="none"/>
    <path d="M19 15L19.7 17.3L22 18L19.7 18.7L19 21L18.3 18.7L16 18L18.3 17.3L19 15Z" fill="currentColor" stroke="none"/>
    <path d="M5 2L5.4 3.6L7 4L5.4 4.4L5 6L4.6 4.4L3 4L4.6 3.6L5 2Z" fill="currentColor" stroke="none" opacity="0.7"/>
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18"/><path d="M6 6L18 18"/>
  </svg>
);

const BotAvatar = () => (
  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C9973D] to-[#A87B2C] flex items-center justify-center flex-shrink-0 shadow-sm">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L13.4 8.6L19 10L13.4 11.4L12 17L10.6 11.4L5 10L10.6 8.6L12 3Z" fill="#0C0B09"/>
    </svg>
  </div>
);

/* ── Fallback Images for Products ── */
const CATEGORY_IMAGES = {
  Unisex: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80",
  Men:    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=80",
  Women:  "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80",
};
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80";

/* ── Quick Actions ── */
const QUICK_ACTIONS = [
  { emoji: '🌸', label: 'Nước hoa cho nữ', prompt: 'Gợi ý cho tôi những chai nước hoa phù hợp cho nữ giới trong cửa hàng' },
  { emoji: '🌿', label: 'Mùi tươi mát', prompt: 'Gợi ý nước hoa có mùi tươi mát, phù hợp mùa hè' },
  { emoji: '💎', label: 'Cao cấp nhất', prompt: 'Cho tôi xem những chai nước hoa cao cấp nhất trong cửa hàng' },
  { emoji: '🎁', label: 'Tư vấn quà tặng', prompt: 'Tôi muốn mua nước hoa làm quà tặng, bạn gợi ý giúp tôi' },
  { emoji: '📦', label: 'Cách đặt hàng', prompt: 'Hướng dẫn tôi cách đặt hàng trên website' },
  { emoji: '🔍', label: 'Giải thích nốt hương', prompt: 'Giải thích cho tôi về top notes, middle notes và base notes trong nước hoa' },
];

/* ── Simple Markdown renderer ── */
function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded bg-white/5 text-[#DDB05A] text-xs font-mono">$1</code>')
    .replace(/\n/g, '<br/>');
}

/* ── Custom Product Card Widget ── */
function ProductCard({ product, onSelect }) {
  const imageUrl = product.imageUrl || CATEGORY_IMAGES[product.category] || DEFAULT_IMAGE;
  const price = product.price ? Number(product.price).toLocaleString('vi-VN') + 'đ' : 'N/A';
  
  // Lấy giá min từ variants nếu có
  const minPriceStr = product.variants && product.variants.length > 0
    ? Number(Math.min(...product.variants.map(v => v.price))).toLocaleString('vi-VN') + 'đ'
    : null;

  return (
    <div className="flex gap-3 p-3 my-2.5 rounded-xl bg-white/[0.04] border border-[#C9973D]/15 hover:border-[#C9973D]/30 transition-all text-[#EDE8DF] shadow-md animate-fade-in">
      {/* Product Image */}
      <img
        src={imageUrl}
        alt={product.productName}
        className="w-16 h-16 object-cover rounded-lg bg-[#1E1C18] border border-[#C9973D]/10 flex-shrink-0"
        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
      />
      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h4 className="text-xs font-semibold truncate text-[#EDE8DF]">{product.productName}</h4>
          <p className="text-[10px] text-[#9A9080] truncate mt-0.5">
            {product.olfactoryFamily ? `🌸 ${product.olfactoryFamily}` : `📦 ${product.category || 'Nước hoa'}`}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-bold text-[#C9973D]">
            {minPriceStr ? `${minPriceStr} (2ml)` : price}
          </span>
          <button
            onClick={() => onSelect(product.id)}
            className="px-2.5 py-1 rounded-lg bg-[#C9973D]/10 hover:bg-[#C9973D] text-[#C9973D] hover:text-[#0C0B09] text-[10px] font-semibold tracking-wider uppercase transition-all duration-200"
          >
            Xem Chi Tiết
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Message Parser to Split Text and Product Cards ── */
function parseMessageContent(content, productsList) {
  if (!content) return [];
  
  const regex = /\[ProductCard:\s*(\d+)\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    // Thêm phần text trước thẻ tag
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        value: content.substring(lastIndex, match.index)
      });
    }
    
    // Thêm thẻ ProductCard nếu tìm thấy product tương ứng trong list
    const productId = parseInt(match[1], 10);
    const product = productsList.find(p => p.id === productId);
    
    if (product) {
      parts.push({
        type: 'product',
        value: product
      });
    } else {
      // Fallback: Nếu không tìm thấy trong list, chỉ hiển thị dạng link text
      parts.push({
        type: 'text',
        value: `[Sản phẩm #${productId}]`
      });
    }
    
    lastIndex = regex.lastIndex;
  }
  
  // Thêm phần text còn lại sau thẻ tag cuối cùng
  if (lastIndex < content.length) {
    let remainingText = content.substring(lastIndex);
    
    // Xử lý khi AI đang stream dở tag như "[ProductCard: 1" hoặc "[ProductCard:"
    const partialTagIndex = remainingText.lastIndexOf('[');
    if (partialTagIndex !== -1 && 
        remainingText.substring(partialTagIndex).includes('ProductCard') && 
        !remainingText.substring(partialTagIndex).includes(']')) {
      remainingText = remainingText.substring(0, partialTagIndex);
    }
    
    if (remainingText) {
      parts.push({
        type: 'text',
        value: remainingText
      });
    }
  }
  
  return parts;
}

/* ── Typing indicator ── */
function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 chat-message-in">
      <BotAvatar />
      <div className="glass rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot w-2 h-2 rounded-full bg-[#C9973D]" style={{ animationDelay: '0ms' }} />
          <span className="typing-dot w-2 h-2 rounded-full bg-[#C9973D]" style={{ animationDelay: '150ms' }} />
          <span className="typing-dot w-2 h-2 rounded-full bg-[#C9973D]" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('aroma-chat-history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [showFab, setShowFab] = useState(false);
  const [productsList, setProductsList] = useState([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Ẩn chatbot trên trang Login
  const isLoginPage = location.pathname === '/login';

  // Hiệu ứng FAB xuất hiện sau 1.5s
  useEffect(() => {
    const timer = setTimeout(() => setShowFab(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Lấy dữ liệu sản phẩm từ CSDL của dự án (project database)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await productAPI.getAll();
        const list = Array.isArray(res) ? res : (res?.content || []);
        setProductsList(list);
      } catch (err) {
        console.warn('Chatbot failed to load database products:', err);
      }
    };
    loadProducts();
  }, []);

  // Lưu lịch sử vào sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('aroma-chat-history', JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  // Auto scroll xuống khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, isLoading]);

  // Focus input khi mở chat
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = useCallback(async (customPrompt = null) => {
    const text = customPrompt || input.trim();
    if (!text || isLoading) return;

    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    try {
      const reply = await sendChatMessage(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        (partial) => setStreamingContent(partial)
      );

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const errorMsg = err.message?.includes('API Key')
        ? '⚠️ API Key chưa được cấu hình. Vui lòng thêm `VITE_OPENROUTER_API_KEY` vào file `.env`.'
        : '⚠️ Không thể kết nối đến AI. Vui lòng thử lại sau giây lát.';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg, isError: true }]);
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  }, [input, messages, isLoading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleProductSelect = (productId) => {
    navigate(`/product/${productId}`);
    // Đóng panel chat trên màn hình nhỏ, giữ nguyên trên desktop
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    sessionStorage.removeItem('aroma-chat-history');
  };

  if (isLoginPage) return null;

  return (
    <>
      {/* ── FAB Button ── */}
      {!isOpen && showFab && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#C9973D] to-[#A87B2C] text-[#0C0B09] flex items-center justify-center shadow-[0_4px_24px_rgba(201,151,61,0.4)] hover:shadow-[0_6px_32px_rgba(201,151,61,0.6)] hover:scale-110 transition-all duration-300 animate-bounce-in chat-glow"
          aria-label="Mở chat tư vấn nước hoa"
        >
          <SparkleIcon />
          {messages.length === 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#6B9E78] border-2 border-[#0C0B09] animate-pulse-soft" />
          )}
        </button>
      )}

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[390px] h-full sm:h-[580px] flex flex-col animate-slide-up-chat">
          <div className="flex flex-col h-full glass-strong rounded-none sm:rounded-2xl overflow-hidden shadow-[0_8px_60px_rgba(0,0,0,0.6)] border-0 sm:border border-[#C9973D]/15">

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#C9973D]/12 bg-[#0C0B09]/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9973D] to-[#A87B2C] flex items-center justify-center shadow-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3L13.4 8.6L19 10L13.4 11.4L12 17L10.6 11.4L5 10L10.6 8.6L12 3Z" fill="#0C0B09"/>
                    </svg>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#6B9E78] border-2 border-[#0C0B09] rounded-full" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold text-[#EDE8DF] leading-tight">Aroma Concierge</h3>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#C9973D]/70 font-mono">Tư vấn nước hoa AI</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="p-2 rounded-lg text-[#9A9080] hover:text-[#B05A5A] hover:bg-[#B05A5A]/10 transition-all"
                    title="Xóa lịch sử chat"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-[#9A9080] hover:text-[#EDE8DF] hover:bg-white/[0.06] transition-all"
                  aria-label="Đóng chat"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* ── Messages Area ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">

              {/* Welcome message khi chưa có tin nhắn */}
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center text-center py-6 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C9973D]/20 to-[#A87B2C]/10 flex items-center justify-center mb-4 border border-[#C9973D]/20">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3L13.4 8.6L19 10L13.4 11.4L12 17L10.6 11.4L5 10L10.6 8.6L12 3Z" fill="#C9973D" opacity="0.8"/>
                      <path d="M19 15L19.7 17.3L22 18L19.7 18.7L19 21L18.3 18.7L16 18L18.3 17.3L19 15Z" fill="#C9973D" opacity="0.5"/>
                    </svg>
                  </div>
                  <h4 className="font-display text-lg font-semibold text-[#EDE8DF] mb-1">Xin chào! ✨</h4>
                  <p className="text-sm text-[#9A9080] max-w-[260px] leading-relaxed">
                    Tôi là <span className="text-[#C9973D]">Aroma Concierge</span> — chuyên gia tư vấn nước hoa kết nối trực tiếp với CSDL hệ thống. Hãy hỏi tôi về sản phẩm nhé!
                  </p>

                  {/* Quick Actions */}
                  <div className="mt-5 flex flex-wrap gap-2 justify-center max-w-[320px]">
                    {QUICK_ACTIONS.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(action.prompt)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#C9973D]/20 text-xs text-[#9A9080] hover:text-[#EDE8DF] hover:border-[#C9973D]/40 hover:bg-[#C9973D]/5 transition-all duration-200"
                      >
                        <span>{action.emoji}</span>
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-start gap-2.5 chat-message-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'assistant' && <BotAvatar />}

                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[#C9973D] to-[#A87B2C] text-[#0C0B09] rounded-tr-sm'
                      : msg.isError
                        ? 'glass border-[#B05A5A]/30 text-[#EDE8DF] rounded-tl-sm'
                        : 'glass text-[#EDE8DF] rounded-tl-sm'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div>
                        {parseMessageContent(msg.content, productsList).map((part, idx) => {
                          if (part.type === 'product') {
                            return (
                              <ProductCard 
                                key={idx} 
                                product={part.value} 
                                onSelect={handleProductSelect} 
                              />
                            );
                          }
                          return (
                            <span 
                              key={idx} 
                              dangerouslySetInnerHTML={{ __html: renderMarkdown(part.value) }} 
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-[#252319] border border-[#C9973D]/20 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-[#C9973D]">
                      You
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming content */}
              {isLoading && streamingContent && (
                <div className="flex items-start gap-2.5 chat-message-in">
                  <BotAvatar />
                  <div className="max-w-[80%] glass rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-[#EDE8DF] leading-relaxed">
                    <div>
                      {parseMessageContent(streamingContent, productsList).map((part, idx) => {
                        if (part.type === 'product') {
                          return (
                            <ProductCard 
                              key={idx} 
                              product={part.value} 
                              onSelect={handleProductSelect} 
                            />
                          );
                        }
                        return (
                          <span 
                            key={idx} 
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(part.value) }} 
                          />
                        );
                      })}
                    </div>
                    <span className="inline-block w-1.5 h-4 bg-[#C9973D] rounded-sm ml-0.5 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {isLoading && !streamingContent && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Area ── */}
            <div className="px-4 py-3 border-t border-[#C9973D]/12 bg-[#0C0B09]/30 flex-shrink-0">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Hỏi về nước hoa..."
                    rows={1}
                    className="w-full bg-[#1E1C18] border border-[#C9973D]/12 rounded-xl px-4 py-2.5 text-sm text-[#EDE8DF] placeholder-[#5C5850] resize-none focus:outline-none focus:border-[#C9973D]/40 focus:ring-1 focus:ring-[#C9973D]/20 transition-all max-h-24"
                    style={{ minHeight: '40px' }}
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9973D] to-[#A87B2C] text-[#0C0B09] flex items-center justify-center hover:shadow-[0_0_16px_rgba(201,151,61,0.3)] disabled:opacity-30 disabled:hover:shadow-none transition-all duration-200 flex-shrink-0"
                  aria-label="Gửi tin nhắn"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-[#0C0B09] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <SendIcon />
                  )}
                </button>
              </div>
              <p className="text-[9px] text-[#5C5850] text-center mt-2 tracking-wide">
                Powered by AI · Aroma Forest Concierge
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
