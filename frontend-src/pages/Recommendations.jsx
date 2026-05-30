import React, { useState, useEffect } from 'react';
import { recommendations as recsApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const MOCK_RECS = [
  { id: 1, type: 'FLIGHT', title: 'Delhi → Goa', subtitle: 'Air India · 2h 35m', price: 4200, reason: 'You booked a beach destination last month', tag: 'Beach lover', score: 0.94, image: '🏖' },
  { id: 2, type: 'FLIGHT', title: 'Mumbai → Manali', subtitle: 'IndiGo · 1h 45m', price: 3800, reason: 'Trending among users with your travel profile', tag: 'Trending', score: 0.88, image: '🏔' },
  { id: 3, type: 'HOTEL',  title: 'Taj Exotica, Goa', subtitle: '5★ · Beachfront resort', price: 12000, reason: 'Matches your preferred hotel tier and location', tag: 'Luxury', score: 0.91, image: '🏨' },
  { id: 4, type: 'DEST',   title: 'Bali, Indonesia', subtitle: 'International · 5h 30m', price: 18500, reason: 'You liked beaches! 73% of users like you visited Bali', tag: 'You may love', score: 0.85, image: '🌴' },
  { id: 5, type: 'FLIGHT', title: 'Delhi → Kochi', subtitle: 'Vistara · 3h 10m', price: 5100, reason: 'Frequently booked after visiting Goa in your segment', tag: 'Commonly paired', score: 0.79, image: '⛵' },
  { id: 6, type: 'HOTEL',  title: 'The Leela Palace, Delhi', subtitle: '5★ · City center', price: 15000, reason: 'Based on your business-class preference pattern', tag: 'Business traveler', score: 0.76, image: '🏛' },
];

const TYPE_META = {
  FLIGHT: { label: 'Flight',      color: '#1A73E8', bg: 'rgba(26,115,232,0.12)' },
  HOTEL:  { label: 'Hotel',       color: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
  DEST:   { label: 'Destination', color: '#00C853', bg: 'rgba(0,200,83,0.12)'   },
};

const FEEDBACK_OPTIONS = [
  { key: 'HELPFUL',    label: '👍 Helpful',       color: '#00C853' },
  { key: 'NOT_NOW',   label: '⏸ Not right now',  color: '#F5A623' },
  { key: 'NOT_INTERESTED', label: '👎 Not for me', color: 'var(--red)' },
];

function RecCard({ rec, feedback, onFeedback }) {
  const [showWhy, setShowWhy] = useState(false);
  const [booking, setBooking] = useState(false);
  const typeMeta = TYPE_META[rec.type];
  const fb = feedback[rec.id];

  return (
    <div className="glass glass-hover" style={{
      borderRadius: 'var(--radius-md)', padding: 24,
      opacity: fb === 'NOT_INTERESTED' ? 0.45 : 1,
      transition: 'opacity 0.3s',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Score bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, height: 3, width: `${rec.score * 100}%`, background: `linear-gradient(to right, ${typeMeta.color}, ${typeMeta.color}88)`, borderRadius: '3px 0 0 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: '2rem', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', background: typeMeta.bg, border: `1px solid ${typeMeta.color}30`, borderRadius: 12 }}>
            {rec.image}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', marginBottom: 3 }}>{rec.title}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{rec.subtitle}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: typeMeta.color }}>
            ₹{rec.price.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>per person</div>
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{ padding: '3px 10px', borderRadius: 6, background: typeMeta.bg, border: `1px solid ${typeMeta.color}25`, color: typeMeta.color, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
          {typeMeta.label.toUpperCase()}
        </span>
        <span style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600 }}>
          {rec.tag}
        </span>
        <span style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
          {Math.round(rec.score * 100)}% match
        </span>
      </div>

      {/* Why */}
      <button onClick={() => setShowWhy(s => !s)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer', marginBottom: showWhy ? 8 : 0, display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ color: typeMeta.color }}>?</span> Why this recommendation?
        <span style={{ fontSize: '0.65rem', marginLeft: 2 }}>{showWhy ? '▲' : '▼'}</span>
      </button>
      {showWhy && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: `${typeMeta.color}0D`, border: `1px solid ${typeMeta.color}20`, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
          {rec.reason}
        </div>
      )}

      {/* Feedback */}
      {fb ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Feedback recorded</span>
          <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 5, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            {FEEDBACK_OPTIONS.find(o => o.key === fb)?.label}
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {FEEDBACK_OPTIONS.map(({ key, label, color }) => (
              <button key={key} onClick={() => onFeedback(rec.id, key)} style={{
                padding: '5px 12px', borderRadius: 7, fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.target.style.borderColor = color; e.target.style.color = color; }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)'; }}
              >{label}</button>
            ))}
          </div>
          <button
            className="btn-primary"
            onClick={() => { setBooking(true); setTimeout(() => setBooking(false), 1500); }}
            style={{ padding: '7px 18px', fontSize: '0.8rem' }}
          >
            {booking ? '✓ Added!' : 'Book →'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Recommendations() {
  const { user }   = useAuth();
  const [recs, setRecs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [feedback, setFeedback]   = useState({});
  const [filter, setFilter]       = useState('ALL');

  useEffect(() => {
    recsApi.get().then(({ data }) => {
      setRecs(data?.length ? data : MOCK_RECS);
    }).catch(() => setRecs(MOCK_RECS)).finally(() => setLoading(false));
  }, []);

  const handleFeedback = async (id, type) => {
    setFeedback(prev => ({ ...prev, [id]: type }));
    try { await recsApi.feedback(id, { feedbackType: type }); } catch {}
  };

  const filtered = recs.filter(r => filter === 'ALL' || r.type === filter);
  const helpfulCount = Object.values(feedback).filter(v => v === 'HELPFUL').length;

  return (
    <div className="page-container">
      <div className="fade-in" style={{ marginBottom: 32 }}>
        <h1 className="page-title">For You</h1>
        <p className="page-subtitle">Personalized picks based on your history · Rate to improve suggestions</p>
      </div>

      {/* Personalization banner */}
      <div className="fade-in-1" style={{
        background: 'linear-gradient(135deg, rgba(0,188,212,0.1) 0%, rgba(26,115,232,0.08) 100%)',
        border: '1px solid rgba(0,188,212,0.2)', borderRadius: 'var(--radius-md)',
        padding: '18px 22px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: 2 }}>
            Hey {user?.name?.split(' ')[0] || 'Traveller'}, here's what we picked for you
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            Powered by collaborative filtering · {helpfulCount > 0 ? `${helpfulCount} helpful feedback recorded — model is improving` : 'Your feedback trains the model in real time'}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#00BCD4', background: 'rgba(0,188,212,0.1)', border: '1px solid rgba(0,188,212,0.25)', padding: '6px 12px', borderRadius: 8 }}>
          ◉ {recs.length} recommendations
        </div>
      </div>

      {/* Filter tabs */}
      <div className="fade-in-2" style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['ALL', 'FLIGHT', 'HOTEL', 'DEST'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 18px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
            background: filter === f ? 'rgba(227,24,55,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${filter === f ? 'rgba(227,24,55,0.4)' : 'var(--border)'}`,
            color: filter === f ? 'var(--red)' : 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}>
            {f === 'ALL' ? 'All' : f === 'DEST' ? 'Destinations' : f.charAt(0) + f.slice(1).toLowerCase() + 's'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loading-spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
          {filtered.map(rec => (
            <RecCard key={rec.id} rec={rec} feedback={feedback} onFeedback={handleFeedback} />
          ))}
        </div>
      )}
    </div>
  );
}
