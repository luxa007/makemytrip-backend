import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TABS = ['Overview', 'My Bookings', 'Preferences'];

const STATUS_COLOR = {
  CONFIRMED: { color:'#00C853', bg:'rgba(0,200,83,0.12)',   border:'rgba(0,200,83,0.3)' },
  CANCELLED: { color:'var(--text-muted)', bg:'rgba(255,255,255,0.04)', border:'var(--border)' },
  PENDING:   { color:'#F5A623', bg:'rgba(245,166,35,0.12)', border:'rgba(245,166,35,0.3)' },
};

const DEFAULT_BOOKINGS = [
  { id:1, flightNumber:'AI101', airline:'Air India', route:'DEL → BOM', departureDate:'2026-08-15', departureTime:'06:30', seatClass:'ECONOMY',  totalAmount:4800,  status:'CONFIRMED', bookedOn:'2026-05-20', passengers:1 },
  { id:2, flightNumber:'AI202', airline:'Air India', route:'BOM → BLR', departureDate:'2026-09-22', departureTime:'09:15', seatClass:'BUSINESS', totalAmount:12480, status:'CONFIRMED', bookedOn:'2026-05-22', passengers:2 },
  { id:3, flightNumber:'6E501', airline:'IndiGo',    route:'BLR → HYD', departureDate:'2026-04-10', departureTime:'11:30', seatClass:'ECONOMY',  totalAmount:2600,  status:'CANCELLED', bookedOn:'2026-04-01', passengers:1 },
];

const PREF_OPTIONS = {
  seat:  ['Window', 'Aisle', 'Middle', 'No preference'],
  meal:  ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain', 'No preference'],
  cabin: ['Economy', 'Business', 'First Class'],
};

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const [tab, setTab]     = useState('Overview');
  const [prefs, setPrefs] = useState({ seat:'Window', meal:'Vegetarian', cabin:'Economy', notifications:true, newsletter:false });
  const [saved, setSaved] = useState(false);

  const [bookings, setBookings] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('mmt_bookings') || '[]');
      return stored.length ? [...stored, ...DEFAULT_BOOKINGS] : DEFAULT_BOOKINGS;
    } catch { return DEFAULT_BOOKINGS; }
  });

  const handleCancel = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status:'CANCELLED' } : b));
    const updated = bookings.map(b => b.id === id ? { ...b, status:'CANCELLED' } : b);
    localStorage.setItem('mmt_bookings', JSON.stringify(updated.filter(b => !DEFAULT_BOOKINGS.find(d => d.id === b.id))));
  };

  const handleSavePrefs = () => {
    localStorage.setItem('mmt_prefs', JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const totalSpent    = bookings.filter(b => b.status === 'CONFIRMED').reduce((s,b) => s + b.totalAmount, 0);
  const activeCount   = bookings.filter(b => b.status === 'CONFIRMED').length;
  const cancelledCount = bookings.filter(b => b.status === 'CANCELLED').length;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="fade-in" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32, flexWrap:'wrap', gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <div style={{
            width:64, height:64, borderRadius:'50%',
            background:'linear-gradient(135deg, var(--red), #B01229)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1.6rem', fontWeight:700,
            boxShadow:'0 8px 24px rgba(227,24,55,0.35)',
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:700, lineHeight:1, marginBottom:6 }}>
              {user?.name || 'Traveller'}
            </h1>
            <div style={{ color:'var(--text-secondary)', fontSize:'0.88rem' }}>{user?.email}</div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, marginTop:6, padding:'3px 10px', borderRadius:6, background:'rgba(227,24,55,0.1)', border:'1px solid rgba(227,24,55,0.25)', fontSize:'0.7rem', fontWeight:700, color:'var(--red)', letterSpacing:'0.05em' }}>
              {user?.role === 'ROLE_ADMIN' ? '★ ADMIN' : '✈ MEMBER'}
            </div>
          </div>
        </div>
        <button className="btn-ghost" onClick={() => { logout(); navigate('/'); }} style={{ padding:'9px 20px', fontSize:'0.85rem' }}>
          Sign out
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:28, borderBottom:'1px solid var(--border)', paddingBottom:0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'10px 20px', background:'none', border:'none', cursor:'pointer',
            fontSize:'0.88rem', fontWeight: tab===t ? 600 : 400,
            color: tab===t ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderBottom: tab===t ? '2px solid var(--red)' : '2px solid transparent',
            marginBottom:-1, transition:'all 0.2s',
          }}>{t}</button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'Overview' && (
        <div className="fade-in">
          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:28 }} className="stats-grid">
            {[
              { label:'Total flights',     value: bookings.length,          icon:'✈', color:'#1A73E8' },
              { label:'Active bookings',   value: activeCount,               icon:'◉', color:'#00C853' },
              { label:'Total spent',       value:`₹${totalSpent.toLocaleString('en-IN')}`, icon:'◈', color:'#F5A623' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="glass" style={{ borderRadius:'var(--radius-md)', padding:'22px 24px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <span style={{ color:'var(--text-muted)', fontSize:'0.78rem', letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</span>
                  <span style={{ color, fontSize:'1rem' }}>{icon}</span>
                </div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:700, color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Recent bookings preview */}
          <div className="glass" style={{ borderRadius:'var(--radius-md)', padding:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <div style={{ fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', color:'var(--text-muted)', textTransform:'uppercase' }}>Recent bookings</div>
              <button onClick={() => setTab('My Bookings')} style={{ background:'none', border:'none', color:'var(--red)', fontSize:'0.82rem', fontWeight:600, cursor:'pointer' }}>View all →</button>
            </div>
            {bookings.slice(0,3).map(b => {
              const s = STATUS_COLOR[b.status] || STATUS_COLOR.PENDING;
              return (
                <div key={b.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:'rgba(227,24,55,0.1)', border:'1px solid rgba(227,24,55,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem' }}>✈</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.88rem' }}>{b.flightNumber} · {b.route}</div>
                      <div style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>{new Date(b.departureDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'0.92rem' }}>₹{b.totalAmount.toLocaleString('en-IN')}</div>
                    <span style={{ fontSize:'0.68rem', fontWeight:700, color:s.color }}>{b.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* My Bookings tab */}
      {tab === 'My Bookings' && (
        <div className="fade-in">
          <div style={{ display:'flex', gap:10, marginBottom:20 }}>
            <div style={{ padding:'8px 16px', borderRadius:8, background:'rgba(0,200,83,0.1)', border:'1px solid rgba(0,200,83,0.25)', fontSize:'0.8rem', color:'#00C853', fontWeight:600 }}>
              {activeCount} Active
            </div>
            <div style={{ padding:'8px 16px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', fontSize:'0.8rem', color:'var(--text-muted)', fontWeight:600 }}>
              {cancelledCount} Cancelled
            </div>
          </div>

          {bookings.map(b => {
            const s = STATUS_COLOR[b.status] || STATUS_COLOR.PENDING;
            const daysLeft = Math.ceil((new Date(b.departureDate) - Date.now()) / 86400000);
            return (
              <div key={b.id} className="glass" style={{ borderRadius:'var(--radius-md)', padding:22, marginBottom:14, opacity: b.status==='CANCELLED' ? 0.7 : 1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:14 }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                      <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'1rem' }}>{b.flightNumber}</span>
                      <span style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>{b.route}</span>
                      <span style={{ padding:'2px 8px', borderRadius:5, fontSize:'0.68rem', fontWeight:700, background:s.bg, border:`1px solid ${s.border}`, color:s.color }}>
                        {b.status}
                      </span>
                    </div>
                    <div style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>
                      {b.airline} · {new Date(b.departureDate).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})} · {b.departureTime} · {b.seatClass} · {b.passengers} pax
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'1.15rem' }}>₹{b.totalAmount.toLocaleString('en-IN')}</div>
                    {daysLeft > 0 && b.status === 'CONFIRMED' && (
                      <div style={{ color: daysLeft <= 3 ? 'var(--red)' : 'var(--text-muted)', fontSize:'0.75rem', marginTop:3 }}>
                        {daysLeft} days away
                      </div>
                    )}
                  </div>
                </div>
                {b.status === 'CONFIRMED' && daysLeft > 0 && (
                  <div style={{ display:'flex', gap:8, paddingTop:12, borderTop:'1px solid var(--border)' }}>
                    <button onClick={() => navigate('/seats')} style={{ padding:'7px 16px', borderRadius:7, background:'rgba(26,115,232,0.1)', border:'1px solid rgba(26,115,232,0.25)', color:'#5BA4F5', fontSize:'0.78rem', fontWeight:600, cursor:'pointer' }}>
                      ⊞ Select seat
                    </button>
                    <button onClick={() => handleCancel(b.id)} style={{ padding:'7px 16px', borderRadius:7, background:'rgba(227,24,55,0.08)', border:'1px solid rgba(227,24,55,0.2)', color:'var(--red)', fontSize:'0.78rem', fontWeight:600, cursor:'pointer' }}>
                      ⊗ Cancel
                    </button>
                  </div>
                )}
                {b.status === 'CANCELLED' && (
                  <div style={{ paddingTop:10, borderTop:'1px solid var(--border)', fontSize:'0.78rem', color:'var(--text-muted)' }}>
                    Refund of <strong style={{ color:'#00C853' }}>₹{Math.round(b.totalAmount*0.75).toLocaleString('en-IN')}</strong> initiated · 5–7 business days
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Preferences tab */}
      {tab === 'Preferences' && (
        <div className="fade-in" style={{ maxWidth:560 }}>
          <div className="glass" style={{ borderRadius:'var(--radius-lg)', padding:28 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
              {Object.entries(PREF_OPTIONS).map(([key, options]) => (
                <div key={key} className="input-group">
                  <label>{key.charAt(0).toUpperCase()+key.slice(1)} preference</label>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:4 }}>
                    {options.map(o => (
                      <button key={o} onClick={() => setPrefs(p => ({...p, [key]:o}))} style={{
                        padding:'8px 16px', borderRadius:8, fontSize:'0.82rem', fontWeight:600, cursor:'pointer',
                        background: prefs[key]===o ? 'rgba(227,24,55,0.15)' : 'rgba(255,255,255,0.04)',
                        border:`1px solid ${prefs[key]===o ? 'rgba(227,24,55,0.4)' : 'var(--border)'}`,
                        color: prefs[key]===o ? 'var(--red)' : 'var(--text-secondary)',
                        transition:'all 0.2s',
                      }}>{o}</button>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ display:'flex', flexDirection:'column', gap:12, paddingTop:8, borderTop:'1px solid var(--border)' }}>
                {[
                  { key:'notifications', label:'Flight status notifications' },
                  { key:'newsletter',    label:'Weekly deals newsletter' },
                ].map(({ key, label }) => (
                  <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'0.88rem', color:'var(--text-secondary)' }}>{label}</span>
                    <button onClick={() => setPrefs(p => ({...p,[key]:!p[key]}))} style={{
                      width:44, height:24, borderRadius:12, cursor:'pointer', border:'none',
                      background: prefs[key] ? 'var(--red)' : 'rgba(255,255,255,0.1)',
                      position:'relative', transition:'background 0.2s',
                    }}>
                      <div style={{ position:'absolute', top:3, left: prefs[key] ? 23 : 3, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }} />
                    </button>
                  </div>
                ))}
              </div>

              <button className="btn-primary" onClick={handleSavePrefs} style={{ padding:'13px', fontSize:'0.9rem' }}>
                {saved ? '✓ Saved!' : 'Save preferences'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width:600px) { .stats-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </div>
  );
}
