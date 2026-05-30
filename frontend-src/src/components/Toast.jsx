import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const colors = {
    success: { bg: 'rgba(0,200,83,0.12)', border: 'rgba(0,200,83,0.3)', color: '#00C853', icon: '✅' },
    error:   { bg: 'rgba(227,24,55,0.12)', border: 'rgba(227,24,55,0.3)', color: '#E31837', icon: '❌' },
    info:    { bg: 'rgba(26,115,232,0.12)', border: 'rgba(26,115,232,0.3)', color: '#1A73E8', icon: 'ℹ️' },
    warning: { bg: 'rgba(245,166,35,0.12)', border: 'rgba(245,166,35,0.3)', color: '#F5A623', icon: '⚠️' },
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map(toast => {
          const c = colors[toast.type] || colors.success;
          return (
            <div key={toast.id} style={{
              background: 'rgba(13,20,38,0.97)', border: `1px solid ${c.border}`,
              borderRadius: 12, padding: '14px 20px', minWidth: 280, maxWidth: 380,
              display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              animation: 'slideInRight 0.3s ease',
              backdropFilter: 'blur(16px)',
            }}>
              <span style={{ fontSize: '1.1rem' }}>{c.icon}</span>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.88rem', lineHeight: 1.4 }}>{toast.message}</span>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
