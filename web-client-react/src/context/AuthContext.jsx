import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwtToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          username: decoded.sub || localStorage.getItem('username'),
          role: decoded.roles?.[0] || localStorage.getItem('userRole'),
          id: decoded.userId || decoded.id || localStorage.getItem('userId'),
        });
      } catch {
        clearAuth();
      }
    }
    setLoading(false);
  }, [token]);

  const clearAuth = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
  };

  const login = (jwtToken, username, role, refreshToken, userId) => {
    localStorage.setItem('jwtToken', jwtToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('username', username);
    localStorage.setItem('userRole', role);
    if (userId) localStorage.setItem('userId', userId);
    setToken(jwtToken);
    try {
      const decoded = jwtDecode(jwtToken);
      setUser({
        username: decoded.sub || username,
        role: decoded.roles?.[0] || role,
        id: decoded.userId || decoded.id || userId,
      });
    } catch {
      setUser({ username, role, id: userId || null });
    }
  };

  const logout = async () => {
    const currentToken = localStorage.getItem('jwtToken');
    try {
      if (currentToken) {
        await authAPI.logout(currentToken);
      }
    } catch {
      // Bỏ qua lỗi logout (token có thể đã hết hạn)
    }
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAdmin: user?.role === 'ROLE_ADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
