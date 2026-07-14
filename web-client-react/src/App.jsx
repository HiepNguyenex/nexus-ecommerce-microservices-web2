import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffaf6] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#dbccb8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  return children;
}

export default function App() {
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user?.username) return;

    // Connect to SSE stream via Gateway routing
    const sseUrl = `http://localhost:8900/api/notification/stream?username=${user.username}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.addEventListener("ORDER_STATUS", (e) => {
      showToast(e.data, "success");
    });

    eventSource.addEventListener("INIT", (e) => {
      console.log("SSE Init: ", e.data);
    });

    eventSource.onerror = (err) => {
      console.warn("SSE connection error, closing stream: ", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [user]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/cart" element={
        <ProtectedRoute>
          <CartPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <AdminPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
