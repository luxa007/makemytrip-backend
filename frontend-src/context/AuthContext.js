import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// Mock users for demo — works without backend
const MOCK_USERS = [
  { email: 'test@test.com',  password: 'test123',  name: 'Test User',  role: 'ROLE_USER' },
  { email: 'demo@demo.com',  password: 'demo123',  name: 'Demo User',  role: 'ROLE_USER' },
  { email: 'admin@mmt.com',  password: 'admin123', name: 'Admin User', role: 'ROLE_ADMIN' },
];

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('mmt_user');
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    // Try real backend first
    try {
      const res = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:8080') + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('mmt_token', data.token);
        localStorage.setItem('mmt_user', JSON.stringify({ email: data.email, name: data.name, role: data.role }));
        setUser({ email: data.email, name: data.name, role: data.role });
        return data;
      }
    } catch {
      // Backend unreachable — fall through to mock
    }

    // Mock login fallback
    const mock = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (mock) {
      const userData = { email: mock.email, name: mock.name, role: mock.role };
      localStorage.setItem('mmt_token', 'mock-token-' + Date.now());
      localStorage.setItem('mmt_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }

    throw new Error('Invalid email or password');
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    try {
      const res = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:8080') + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('mmt_token', data.token);
          localStorage.setItem('mmt_user', JSON.stringify({ email: data.email, name: data.name || fullName, role: data.role || 'ROLE_USER' }));
          setUser({ email: data.email, name: data.name || fullName, role: data.role || 'ROLE_USER' });
        }
        return data;
      }
    } catch {}

    // Mock register fallback
    const userData = { email, name: fullName, role: 'ROLE_USER' };
    localStorage.setItem('mmt_token', 'mock-token-' + Date.now());
    localStorage.setItem('mmt_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mmt_token');
    localStorage.removeItem('mmt_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
