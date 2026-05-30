import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: '✈',
    title: 'Live Flight Status',
    desc: 'Real-time updates via WebSocket. Track delays, gate changes, and arrival times as they happen.',
    link: '/flight-status',
    badge: 'LIVE',
    badgeColor: '#00C853',
    accent: '#1A73E8',
  },
  {
    icon: '◈',
    title: 'Dynamic Pricing',
    desc: 'AI-powered price engine with historical graphs. Freeze your price before it spikes.',
    link: '/pricing',
    badge: 'AI',
    badgeColor: '#F5A623',
    accent: '#F5A623',
  },
  {
    icon: '⊞',
    title: 'Seat Selection',
    desc: 'Interactive seat maps with premium upgrades, legroom data, and real-time availability.',
    link: '/seats',
    badge: 'INTERACTIVE',
    badgeColor: '#7C4DFF',
    accent: '#7C4DFF',
  },
  {
    icon: '★',
    title: 'Reviews & Ratings',
    desc: 'Star ratings, photo uploads, replies, and moderation. Community-powered travel intelligence.',
    link: '/reviews',
    badge: 'COMMUNITY',
    badgeColor: '#E31837',
    accent: '#E31837',
  },
  {
    icon: '◉',
    title: 'For You',
    desc: 'Personalized recommendations using collaborative filtering. The more you fly, the smarter it gets.',
    link: '/recommendations',
    badge: 'PERSONALIZED',
    badgeColor: '#00BCD4',
    accent: '#00BCD4',
  },
  {
    icon: '⊗',
    title: 'Cancellation & Refunds',
    desc: 'Instant cancellation with transparent refund policies and a real-time refund status tracker.',
    link: '/cancellation',
    badge: 'INSTANT',
    badgeColor: '#00C853',
    accent: '#00C853',
  },
];

const STATS = [
  { value: '2M+', label: 'Bookings made' },
  { value: '98%', label: 'On-time accuracy' },
  { value: '4.9★', label: 'User rating' },
  { value: '<2s', label: 'Avg response time' },
];

export default function Home() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const heroRef   = useRef(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = ((e.clientX - left) / width - 0.5) * 20;
      const y = ((e.clientY - top)  / height - 0.5) * 10;
      el.style.setProperty('--rx', `${y}deg`);
      el.style.setProperty('--ry', `${x}deg`);
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────── */}
      <section ref={heroRef} style={{
        minHeight: '92vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '60px 24px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background mesh */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(227,24,55,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(26,115,232,0.06) 0%, transparent 60%)
          `,
        }} />

        {/* Floating orbs */}
        {[
          { size: 300, x: '10%', y: '20%', color: 'rgba(227,24,55,0.05)', blur: 80 },
          { size: 200, x: '75%', y: '60%', color: 'rgba(26,115,232,0.05)', blur: 60 },
          { size: 150, x: '50%', y: '80%', color: 'rgba(245,166,35,0.04)', blur: 50 },
        ].map((orb, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            width: orb.size, height: orb.size,
            left: orb.x, top: orb.y,
            background: orb.color,
            filter: `blur(${orb.blur}px)`,
            zIndex: 0,
            animation: `float-${i} ${6 + i * 2}s ease-in-out infinite alternate`,
          }} />
        ))}

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
          <div className="fade-in" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 20,
            background: 'rgba(227,24,55,0.1)', border: '1px solid rgba(227,24,55,0.25)',
            fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.08em',
            color: 'var(--red)', textTransform: 'uppercase', marginBottom: 28,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', display: 'inline-block', animation: 'pulse-dot 1.5s infinite' }} />
            Production-grade travel platform
          </div>

          <h1 className="fade-in-1" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 7vw, 5rem)',
            fontWeight: 900, lineHeight: 1.08,
            letterSpacing: '-0.02em', marginBottom: 24,
          }}>
            Travel smarter,<br />
            <span style={{
              background: 'linear-gradient(135deg, #E31837 0%, #F5A623 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>fly anywhere.</span>
          </h1>

          <p className="fade-in-2" style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 40,
            maxWidth: 560, margin: '0 auto 40px',
          }}>
            Real-time flight tracking, dynamic pricing, intelligent seat selection, and AI-powered recommendations — all in one platform.
          </p>

          <div className="fade-in-3" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <button className="btn-primary" onClick={() => navigate('/recommendations')} style={{ fontSize: '1rem', padding: '14px 36px' }}>
                View your dashboard →
              </button>
            ) : (
              <>
                <Link to="/register">
                  <button className="btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>
                    Get started — it's free
                  </button>
                </Link>
                <Link to="/login">
                  <button className="btn-ghost" style={{ fontSize: '1rem', padding: '14px 30px' }}>
                    Sign in
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em',
          animation: 'fadeInUp 1s 1s both',
        }}>
          <span>SCROLL</span>
          <div style={{ width: 1, height: 32, background: 'linear-gradient(to bottom, var(--text-muted), transparent)' }} />
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{
          maxWidth: 1160, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
          gap: 1, background: 'var(--border)', borderRadius: 16, overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          {STATS.map(({ value, label }) => (
            <div key={label} style={{
              background: 'var(--bg-secondary)', padding: '28px 24px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--red)', lineHeight: 1 }}>
                {value}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 6, letterSpacing: '0.04em' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section style={{ padding: '0 24px 100px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, marginBottom: 12 }}>
              Everything you need to travel
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 500, margin: '0 auto' }}>
              Six core features, production-grade code, real API integrations.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
          }}>
            {FEATURES.map(({ icon, title, desc, link, badge, badgeColor, accent }) => (
              <Link key={link} to={user ? link : '/login'} style={{ display: 'block' }}>
                <div className="glass glass-hover" style={{
                  borderRadius: 'var(--radius-lg)', padding: 28,
                  height: '100%', cursor: 'pointer',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {/* Accent glow top-left */}
                  <div style={{
                    position: 'absolute', top: -40, left: -40,
                    width: 150, height: 150, borderRadius: '50%',
                    background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`,
                    pointerEvents: 'none',
                  }} />

                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 18 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 13,
                      background: `${accent}18`, border: `1px solid ${accent}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.3rem', color: accent,
                    }}>
                      {icon}
                    </div>
                    <span style={{
                      padding: '4px 9px', borderRadius: 6,
                      background: `${badgeColor}18`, border: `1px solid ${badgeColor}30`,
                      color: badgeColor, fontSize: '0.68rem', fontWeight: 700,
                      letterSpacing: '0.08em',
                    }}>
                      {badge}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>
                    {title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.65 }}>
                    {desc}
                  </p>

                  <div style={{ marginTop: 20, fontSize: '0.82rem', color: accent, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                    Explore feature <span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      {!user && (
        <section style={{ padding: '0 24px 100px' }}>
          <div style={{
            maxWidth: 1160, margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(227,24,55,0.12) 0%, rgba(26,115,232,0.08) 100%)',
            border: '1px solid rgba(227,24,55,0.2)',
            borderRadius: 24, padding: 'clamp(40px, 6vw, 72px)',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, marginBottom: 16 }}>
              Ready to take off?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 32, maxWidth: 460, margin: '0 auto 32px' }}>
              Create your account and get access to all six platform features instantly.
            </p>
            <Link to="/register">
              <button className="btn-primary" style={{ fontSize: '1rem', padding: '14px 40px' }}>
                Create free account →
              </button>
            </Link>
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 24px',
        textAlign: 'center',
        color: 'var(--text-muted)', fontSize: '0.83rem',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
          Make<span style={{ color: 'var(--red)' }}>My</span>Trip
        </div>
        <p>© 2026 MakeMy Trip Platform · Built with Spring Boot + React · Internship Project</p>
      </footer>

      <style>{`
        @keyframes float-0 { from { transform: translate(0,0); } to { transform: translate(20px,-20px); } }
        @keyframes float-1 { from { transform: translate(0,0); } to { transform: translate(-15px,15px); } }
        @keyframes float-2 { from { transform: translate(0,0); } to { transform: translate(10px,-10px); } }
        @media (max-width: 600px) {
          div[style*="gridTemplateColumns: repeat(4"] { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </div>
  );
}
