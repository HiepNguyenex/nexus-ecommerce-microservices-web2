// API Gateway Base URL
const API_BASE = 'http://localhost:8900/api';

// Utility: Show dynamic Toast notifications
function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.innerHTML = `<span style="font-size: 1.2rem;">⚡</span> <span>${message}</span>`;
    
    // Theme color matching
    if (type === 'error') {
        toast.style.borderLeftColor = 'var(--danger)';
    } else if (type === 'warning') {
        toast.style.borderLeftColor = 'var(--warning)';
    } else {
        toast.style.borderLeftColor = 'var(--success)';
    }
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// Request Helper with JWT token injection
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('jwtToken');
    
    // Setup default headers
    options.headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Credentials for session support (cart session on Gateway)
    options.credentials = 'include';
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        if (response.status === 401) {
            // Unauthorized - clear token and redirect if trying to access secure paths
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('username');
            localStorage.removeItem('userRole');
            if (!window.location.pathname.includes('login.html')) {
                showToast('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
                setTimeout(() => window.location.href = 'login.html', 1500);
            }
            throw new Error('Unauthorized');
        }
        
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP error ${response.status}`);
        }
        
        // Handle no content (204)
        if (response.status === 204) return null;
        
        return await response.json();
    } catch (err) {
        console.error(`API Error on ${endpoint}:`, err);
        throw err;
    }
}

// Theme management (Dark / Light)
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Global Auth UI synchronization
function syncAuthUI() {
    const token = localStorage.getItem('jwtToken');
    const username = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole');
    
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
        if (token) {
            let adminLink = '';
            if (userRole === 'ROLE_ADMIN') {
                adminLink = `<li><a href="admin.html" style="color: #fbbf24; font-weight: 600;">💎 Quản Trị</a></li>`;
            }
            userMenu.innerHTML = `
                <ul class="nav-links">
                    <li><a href="index.html">Cửa Hàng</a></li>
                    <li><a href="cart.html">🛒 Giỏ Hàng</a></li>
                    ${adminLink}
                    <li style="margin-left: 1rem; color: var(--text-secondary)">Chào, <strong style="color: var(--text-primary)">${username}</strong></li>
                    <li><button onclick="logout()" class="btn-secondary" style="padding: 0.4rem 1rem;">Đăng Xuất</button></li>
                </ul>
            `;
        } else {
            userMenu.innerHTML = `
                <button onclick="window.location.href='login.html'" class="btn-primary">Đăng Nhập</button>
            `;
        }
    }
}

function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    showToast('Đã đăng xuất thành công!');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    syncAuthUI();
});
