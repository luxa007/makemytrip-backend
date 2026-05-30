import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname || '/recommendations';

  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', position: 'relative',
    }}>
      {/* Glow */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(227,24,55,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #E31837, #B01229)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', margin: '0 auto 20px',
            boxShadow: '0 8px 24px rgba(227,24,55,0.35)',
          }}>✈</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 700, marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Sign in to your MakeMy Trip account
          </p>
        </div>

        {/* Card */}
        <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: 36 }}>
          {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="input-group">
              <label>Email address</label>
              <input
                className="input-field"
                type="email" required
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                className="input-field"
                type="password" required
                placeholder="Your password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: 6, padding: '14px', fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            No account yet?{' '}
            <Link to="/register" style={{ color: 'var(--red)', fontWeight: 600 }}>
              Create one free
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <div style={{
          marginTop: 20, padding: '12px 16px', borderRadius: 10,
          background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)',
          fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center',
        }}>
          Demo: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>test@test.com</span> / <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>test123</span>
        </div>
      </div>
    </div>
  );
}
