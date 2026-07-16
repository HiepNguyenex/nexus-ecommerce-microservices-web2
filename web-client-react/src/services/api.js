import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag để tránh refresh token bị loop vô hạn
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-unwrap response.data and handle errors with refresh token
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Nếu 401 và chưa thử refresh, thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // Không có refresh token, logout
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${API_BASE}/accounts/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data;

        localStorage.setItem('jwtToken', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Nếu 401 và đang refresh, queue request
    if (error.response?.status === 401 && !originalRequest._retry && isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth APIs
export const authAPI = {
  login: (username, password) =>
    api.post('/accounts/login', { username, password }),
  register: (data) =>
    api.post('/accounts/registration', data),
  refresh: (refreshToken) =>
    axios.post('/api/accounts/refresh', { refreshToken }).then(r => r.data),
  logout: (accessToken) =>
    api.post('/accounts/logout', { accessToken }),
  getUsers: () => api.get('/accounts/users'),
  getUser: (id) => api.get(`/accounts/users/${id}`),
  toggleUserStatus: (id, active) =>
    api.put(`/accounts/users/${id}/status?active=${active}`),
  updateDetails: (id, details) =>
    api.put(`/accounts/users/${id}/details`, details),
};

// Product APIs
export const productAPI = {
  getAll: (page, size, search, category) => {
    if (page !== undefined) {
      return api.get('/catalog/products', { params: { page, size, search, category } });
    }
    return api.get('/catalog/products');
  },
  getOne: (id) => api.get(`/catalog/products/${id}`),
  addProduct: (product) => api.post('/catalog/admin/products', product),
  deleteProduct: (id) => api.delete(`/catalog/admin/products/${id}`),
  uploadImage: (formData) => api.post('/catalog/admin/products/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
};

// Cart APIs
export const cartAPI = {
  getCart: () => api.get('/shop/cart'),
  addItem: (productId, quantity = 1, size = '100ml') =>
    api.post(`/shop/cart?productId=${productId}&quantity=${quantity}&size=${size}`),
  removeItem: (productId, size = '100ml') =>
    api.delete(`/shop/cart?productId=${productId}&size=${size}`),
};

// Coupon APIs
export const couponAPI = {
  validate: (code) => api.get(`/shop/coupons/validate?code=${encodeURIComponent(code)}`),
  getActive: () => api.get('/shop/coupons/active'),
  getAll: () => api.get('/shop/admin/coupons'),
  add: (coupon) => api.post('/shop/admin/coupons', coupon),
  delete: (id) => api.delete(`/shop/admin/coupons/${id}`),
  toggle: (id) => api.post(`/shop/admin/coupons/${id}/toggle`),
};

// Order APIs
export const orderAPI = {
  createOrder: (userId, promoCode, shippingDetails = {}) => {
    const params = new URLSearchParams();
    if (promoCode) params.append('promoCode', promoCode);
    if (shippingDetails.fullName) params.append('shippingName', shippingDetails.fullName);
    if (shippingDetails.phone) params.append('shippingPhone', shippingDetails.phone);
    if (shippingDetails.email) params.append('shippingEmail', shippingDetails.email);
    if (shippingDetails.address) params.append('shippingAddress', shippingDetails.address);
    if (shippingDetails.paymentMethod) params.append('paymentMethod', shippingDetails.paymentMethod);
    const query = params.toString();
    return api.post(`/shop/order/${userId}${query ? `?${query}` : ''}`);
  },
  getAll: () => api.get('/shop/orders'),
  getMyOrders: () => api.get('/shop/orders/my'),
  getByUserId: (userId) => api.get(`/shop/orders/user/${userId}`),
  getById: (orderId) => api.get(`/shop/orders/${orderId}`),
  updateStatus: (orderId, status) =>
    api.put(`/shop/orders/${orderId}/status?status=${status}`),
};

// Payment APIs
export const paymentAPI = {
  createStripeSession: (orderId, amount, successUrl, cancelUrl) =>
    api.post('/payment/stripe/create-session', { orderId, amount, successUrl, cancelUrl }),
  confirmPayment: (orderId) =>
    api.post(`/payment/stripe/confirm-payment?orderId=${orderId}`),
};

// Recommendation APIs
export const recommendationAPI = {
  getAll: () => api.get('/review/recommendations'),
  getByProduct: (productId) => api.get(`/review/recommendations/product/${productId}`),
  addRecommendation: (userId, productId, rating, comment) =>
    api.post(`/review/${userId}/recommendations/${productId}?rating=${rating}${comment ? `&comment=${encodeURIComponent(comment)}` : ''}`),
  deleteRecommendation: (id) => api.delete(`/review/recommendations/${id}`),
};

// Admin APIs
export const adminAPI = {
  getRevenue: (from, to) =>
    api.get('/admin/revenue', { params: { from, to } }),
  getNotificationLogs: () => api.get('/notifications/logs'),
  getNotificationStats: () => api.get('/notifications/logs/stats'),
};
