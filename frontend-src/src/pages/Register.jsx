import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6)       { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/recommendations');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name',     label: 'Full name',       type: 'text',     placeholder: 'Your full name' },
    { key: 'email',    label: 'Email address',   type: 'email',    placeholder: 'you@example.com' },
    { key: 'password', label: 'Password',        type: 'password', placeholder: 'Min. 6 characters' },
    { key: 'confirm',  label: 'Confirm password',type: 'password', placeholder: 'Repeat password' },
  ];

  return (
    <div style={{
      minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', position: 'relative',
    }}>
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,115,232,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #1A73E8, #0D47A1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', margin: '0 auto 20px',
            boxShadow: '0 8px 24px rgba(26,115,232,0.35)',
          }}>✦</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 700, marginBottom: 6 }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Start exploring flights, hotels, and more
          </p>
        </div>

        <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: 36 }}>
          {error && <div className="error-msg" style={{ marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {fields.map(({ key, label, type, placeholder }) => (
              <div key={key} className="input-group">
                <label>{label}</label>
                <input
                  className="input-field"
                  type={type} required
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: 6, padding: '14px', fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--red)', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
