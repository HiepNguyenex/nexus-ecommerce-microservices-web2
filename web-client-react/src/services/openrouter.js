/**
 * OpenRouter AI Service — Aroma Forest Perfume Concierge
 * Gọi OpenRouter API với fallback models, streaming, và product context injection.
 */
import { productAPI } from './api';

// ── Config ──
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

// Danh sách model free theo thứ tự ưu tiên (fallback chain)
const FREE_MODELS = [
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
];

const DEFAULT_MODEL = import.meta.env.VITE_OPENROUTER_MODEL || FREE_MODELS[0];

// ── System Prompt ──
const SYSTEM_PROMPT = `Bạn là "Aroma Concierge" — chuyên gia tư vấn nước hoa cao cấp của cửa hàng Aroma Forest (Artisan Perfume House).

QUY TẮC BẮT BUỘC:
1. LUÔN trả lời bằng tiếng Việt, giọng văn lịch sự, chuyên nghiệp nhưng thân thiện.
2. Bạn là chuyên gia về nước hoa: hiểu biết sâu về nốt hương (top, middle, base notes), nhóm hương (olfactory family), nồng độ (EDP, EDT, Parfum), độ lưu hương và tỏa hương.
3. Khi tư vấn, hãy DỰA TRÊN danh sách sản phẩm thực tế của cửa hàng được cung cấp bên dưới. Ưu tiên gợi ý sản phẩm CÓ TRONG CỬA HÀNG.
4. Nếu khách hỏi về sản phẩm không có, hãy gợi ý sản phẩm tương tự từ danh sách hiện có.
5. Có thể hướng dẫn khách cách sử dụng website: thêm giỏ hàng, đặt hàng, xem wishlist, dùng tính năng Scent Finder (quiz tìm mùi hương).
6. Giữ câu trả lời NGẮN GỌN (tối đa 3-4 đoạn), dễ đọc. Sử dụng emoji phù hợp (🌸🌿💎✨🌹) để tạo cảm giác sang trọng.
7. KHÔNG bịa đặt thông tin sản phẩm. Chỉ tư vấn dựa trên dữ liệu thực.
8. Khi khách hỏi giá, luôn nêu rõ dung tích kèm theo.
9. Nếu khách chào hỏi, hãy chào lại thân thiện và giới thiệu bản thân là Aroma Concierge.
10. Trả lời trực tiếp, KHÔNG viết suy nghĩ nội tâm hay reasoning. Chỉ viết nội dung trả lời cho khách hàng.
11. Khi giới thiệu, gợi ý hoặc nhắc tới bất kỳ sản phẩm nào có trong danh sách cửa hàng dưới đây, hãy LUÔN đính kèm thẻ \`[ProductCard: ID]\` với ID là số ID thực tế của sản phẩm đó (ví dụ: \`[ProductCard: 3]\`). Hệ thống sẽ tự động chuyển thẻ này thành thẻ sản phẩm có hình ảnh trực quan cho khách hàng. Hãy đặt thẻ này ở cuối câu hoặc đoạn giới thiệu về sản phẩm đó.`;

// ── Product Context Cache ──
let cachedProductContext = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

/**
 * Lấy danh sách sản phẩm và format thành context string cho AI
 */
async function getProductContext() {
  const now = Date.now();
  if (cachedProductContext && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedProductContext;
  }

  try {
    const response = await productAPI.getAll();
    const products = Array.isArray(response) ? response : (response?.content || []);

    if (!products.length) {
      cachedProductContext = '\n\nHiện tại chưa có dữ liệu sản phẩm. Hãy tư vấn chung về nước hoa.';
      cacheTimestamp = now;
      return cachedProductContext;
    }

    const productList = products.map((p, i) => {
      const variants = p.variants?.length
        ? p.variants.map(v => `${v.size}: ${Number(v.price).toLocaleString('vi-VN')}đ`).join(', ')
        : `${Number(p.price).toLocaleString('vi-VN')}đ`;

      return [
        `${i + 1}. ${p.productName}`,
        `   Giá: ${variants}`,
        `   Danh mục: ${p.category || 'N/A'}`,
        p.topNotes ? `   Top notes: ${p.topNotes}` : '',
        p.middleNotes ? `   Middle notes: ${p.middleNotes}` : '',
        p.baseNotes ? `   Base notes: ${p.baseNotes}` : '',
        p.concentration ? `   Nồng độ: ${p.concentration}` : '',
        p.longevity ? `   Độ lưu hương: ${p.longevity}` : '',
        p.sillage ? `   Độ tỏa hương: ${p.sillage}` : '',
        p.discription ? `   Mô tả: ${p.discription.substring(0, 120)}` : '',
        `   Còn hàng: ${p.availability > 0 ? 'Có' : 'Hết hàng'}`,
      ].filter(Boolean).join('\n');
    }).join('\n\n');

    cachedProductContext = `\n\nDANH SÁCH SẢN PHẨM HIỆN CÓ TẠI AROMA FOREST:\n${productList}`;
    cacheTimestamp = now;
    return cachedProductContext;
  } catch (err) {
    console.warn('Failed to fetch product context:', err);
    return '\n\nKhông thể tải danh sách sản phẩm. Hãy tư vấn chung về nước hoa.';
  }
}

/**
 * Gửi tin nhắn đến OpenRouter API (không streaming)
 * @param {Array} messages - Lịch sử hội thoại [{role, content}]
 * @param {Function} onChunk - Callback nhận từng chunk text (giả lập streaming)
 * @returns {string} - Câu trả lời đầy đủ
 */
export async function sendChatMessage(messages, onChunk = null) {
  if (!API_KEY) {
    throw new Error('API Key OpenRouter chưa được cấu hình. Vui lòng thêm VITE_OPENROUTER_API_KEY vào file .env');
  }

  const productContext = await getProductContext();
  const systemMessage = { role: 'system', content: SYSTEM_PROMPT + productContext };

  // Giới hạn lịch sử gửi lên API (20 tin nhắn gần nhất)
  const recentMessages = messages.slice(-20);

  const allMessages = [systemMessage, ...recentMessages];

  // Thử từng model trong danh sách fallback
  const modelsToTry = [DEFAULT_MODEL, ...FREE_MODELS.filter(m => m !== DEFAULT_MODEL)];
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'X-Title': 'Aroma Forest - Perfume Concierge',
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model,
          messages: allMessages,
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (response.status === 429) {
        // Rate limited — thử model tiếp theo
        console.warn(`Model ${model} rate limited, trying next...`);
        lastError = new Error(`Rate limited on ${model}`);
        continue;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.warn(`Model ${model} error:`, errData);
        lastError = new Error(errData?.error?.message || `HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      let content = data?.choices?.[0]?.message?.content || '';

      // Một số model trả về reasoning thay vì content trực tiếp
      if (!content && data?.choices?.[0]?.message?.reasoning) {
        content = data.choices[0].message.reasoning;
      }

      if (!content) {
        lastError = new Error('Model trả về response rỗng');
        continue;
      }

      // Giả lập streaming effect bằng cách gửi từng từ
      if (onChunk) {
        const words = content.split(' ');
        let accumulated = '';
        for (let i = 0; i < words.length; i++) {
          accumulated += (i === 0 ? '' : ' ') + words[i];
          onChunk(accumulated);
          await new Promise(r => setTimeout(r, 20 + Math.random() * 30));
        }
      }

      console.log(`✅ Chat success with model: ${model}, tokens: ${data?.usage?.total_tokens || 'N/A'}`);
      return content;

    } catch (err) {
      if (err.name === 'AbortError') throw err;
      console.warn(`Model ${model} failed:`, err);
      lastError = err;
      continue;
    }
  }

  // Tất cả model đều thất bại
  throw lastError || new Error('Không thể kết nối đến AI. Vui lòng thử lại sau.');
}

/**
 * Kiểm tra API key còn hoạt động không
 */
export async function checkApiKey() {
  if (!API_KEY) return { valid: false, reason: 'No API key configured' };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    });
    if (!response.ok) return { valid: false, reason: 'Invalid key' };
    const data = await response.json();
    return {
      valid: true,
      isFree: data?.data?.is_free_tier,
      expiresAt: data?.data?.expires_at,
    };
  } catch {
    return { valid: false, reason: 'Network error' };
  }
}
