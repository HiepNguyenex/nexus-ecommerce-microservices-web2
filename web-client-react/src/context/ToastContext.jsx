import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

const ICONS = {
  success: { icon: FiCheckCircle, color: 'from-[#a8c5a0] to-[#8fb894]', border: 'border-[#a8c5a0]/30' },
  error: { icon: FiAlertCircle, color: 'from-[#c99a8a] to-[#b88a78]', border: 'border-[#c99a8a]/30' },
  warning: { icon: FiAlertTriangle, color: 'from-[#d4b896] to-[#c9a880]', border: 'border-[#d4b896]/30' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, message, type, exiting: false }]);
    timers.current[id] = setTimeout(() => {
      setToasts(p => p.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => { setToasts(p => p.filter(t => t.id !== id)); delete timers.current[id]; }, 300);
    }, duration);
  }, []);

  const removeToast = (id) => {
    if (timers.current[id]) { clearTimeout(timers.current[id]); delete timers.current[id]; }
    setToasts(p => p.filter(t => t.id !== id));
  };

  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-[420px] w-full">
        {toasts.map(toast => {
          const { icon: Icon, color, border } = ICONS[toast.type] || ICONS.success;
          return (
            <div key={toast.id} onClick={() => removeToast(toast.id)}
              className={`relative overflow-hidden rounded-2xl cursor-pointer bg-white/90 backdrop-blur-2xl border ${border} shadow-xl shadow-[#dbccb8]/20 ${toast.exiting ? 'toast-exit' : 'toast-enter'}`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${color}`} />
              <div className="flex items-center gap-3 px-5 py-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="text-white text-lg" />
                </div>
                <p className="text-sm font-medium text-[#2d2a26] flex-1 leading-relaxed">{toast.message}</p>
                <button className="p-1 rounded-lg hover:bg-black/5 text-[#b8a690] hover:text-[#2d2a26] transition-all flex-shrink-0"><FiX className="text-sm" /></button>
              </div>
              <div className={`absolute bottom-0 left-1 right-1 h-[2px] rounded-full bg-gradient-to-r ${color} toast-progress`} />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
