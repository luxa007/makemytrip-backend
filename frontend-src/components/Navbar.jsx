import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/book',            label: 'Book',        icon: '✈' },
  { to: '/flight-status',   label: 'Live Status', icon: '●' },
  { to: '/pricing',         label: 'Pricing',     icon: '◈' },
  { to: '/seats',           label: 'Seats',       icon: '⊞' },
  { to: '/reviews',         label: 'Reviews',     icon: '★' },
  { to: '/recommendations', label: 'For You',     icon: '◉' },
  { to: '/hotels',          label: 'Hotels',      icon: '🏨' },
  { to: '/cancellation',    label: 'Bookings',    icon: '⊗' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(10,15,30,0.95)' : 'rgba(10,15,30,0.7)',
        backdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'linear-gradient(135deg, #E31837, #B01229)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', boxShadow: '0 4px 12px rgba(227,24,55,0.4)',
            }}>✈</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
              Make<span style={{ color: 'var(--red)' }}>My</span>Trip
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', gap: 2, alignItems: 'center', overflow: 'hidden' }} className="nav-desktop">
            {user && NAV_LINKS.map(({ to, label, icon }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to} style={{
                  padding: '6px 11px', borderRadius: 7, fontSize: '0.8rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#fff' : 'var(--text-secondary)',
                  background: active ? 'rgba(227,24,55,0.15)' : 'transparent',
                  border: active ? '1px solid rgba(227,24,55,0.3)' : '1px solid transparent',
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <span style={{ fontSize: '0.72rem' }}>{icon}</span> {label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            {user ? (
              <>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name?.split(' ')[0]}
                  </span>
                </Link>
                <button className="btn-ghost" onClick={handleLogout} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login"><button className="btn-ghost" style={{ padding: '7px 16px', fontSize: '0.82rem' }}>Sign in</button></Link>
                <Link to="/register"><button className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.82rem' }}>Get started</button></Link>
              </>
            )}
            <button onClick={() => setMenuOpen(o => !o)} className="hamburger" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '1.3rem', display: 'none', padding: 4 }}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 68, left: 0, right: 0, zIndex: 999,
          background: 'rgba(10,15,30,0.98)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)', padding: '12px 16px 20px',
          display: 'flex', flexDirection: 'column', gap: 3,
        }}>
          {user && NAV_LINKS.map(({ to, label, icon }) => (
            <Link key={to} to={to} style={{
              padding: '11px 14px', borderRadius: 9,
              color: location.pathname === to ? '#fff' : 'var(--text-secondary)',
              background: location.pathname === to ? 'rgba(227,24,55,0.15)' : 'transparent',
              fontWeight: location.pathname === to ? 600 : 400,
              display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.92rem',
            }}>
              <span>{icon}</span> {label}
            </Link>
          ))}
          {user && (
            <>
              <Link to="/profile" style={{ padding:'11px 14px', borderRadius:9, color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:10, fontSize:'0.92rem' }}>
                👤 My Profile
              </Link>
              <button onClick={handleLogout} style={{ padding:'11px 14px', borderRadius:9, background:'rgba(227,24,55,0.08)', border:'1px solid rgba(227,24,55,0.2)', color:'var(--red)', fontSize:'0.88rem', fontWeight:600, cursor:'pointer', marginTop:4, textAlign:'left' }}>
                Sign out
              </button>
            </>
          )}
          {!user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <Link to="/login"><button className="btn-ghost" style={{ width: '100%' }}>Sign in</button></Link>
              <Link to="/register"><button className="btn-primary" style={{ width: '100%' }}>Get started</button></Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 960px) { .nav-desktop { display: none !important; } }
        @media (max-width: 960px) { .hamburger { display: block !important; } }
      `}</style>
    </>
  );
}
