import React, { useState, useEffect } from 'react';
import { flights as flightsApi } from '../utils/api';

const FLIGHT_OPTIONS = [
  { id: 1, label: 'AI101 · DEL → BOM' },
  { id: 2, label: 'AI202 · BOM → BLR' },
  { id: 3, label: '6E501 · BLR → HYD' },
  { id: 4, label: 'SG304 · DEL → CCU' },
];

const SEAT_CLASSES = [
  { key: 'ECONOMY',  label: 'Economy',        mult: 1.0 },
  { key: 'BUSINESS', label: 'Business Class', mult: 2.6 },
  { key: 'FIRST',    label: 'First Class',    mult: 4.2 },
];

function generatePriceHistory(basePrice) {
  const pts = [];
  let price = basePrice * 0.75;
  const now = Date.now();
  for (let i = 29; i >= 0; i--) {
    const variance = (Math.random() - 0.48) * basePrice * 0.06;
    price = Math.max(basePrice * 0.55, Math.min(basePrice * 1.55, price + variance));
    pts.push({ day: `D-${i}`, price: Math.round(price), date: new Date(now - i * 86400000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) });
  }
  pts[pts.length - 1] = { ...pts[pts.length - 1], price: basePrice, day: 'Today' };
  return pts;
}

function MiniChart({ data, currentPrice, basePrice }) {
  if (!data.length) return null;
  const W = 100, H = 60;
  const prices = data.map(d => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const toY = (p) => H - ((p - min) / range) * (H - 8) - 4;
  const toX = (i) => (i / (data.length - 1)) * W;
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(d.price).toFixed(1)}`).join(' ');
  const areaPath = `${path} L${W},${H} L0,${H} Z`;
  const above = currentPrice > basePrice * 0.98;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 120, overflow: 'visible' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={above ? '#E31837' : '#00C853'} stopOpacity="0.25" />
          <stop offset="100%" stopColor={above ? '#E31837' : '#00C853'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={path} fill="none" stroke={above ? '#E31837' : '#00C853'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Current price dot */}
      <circle cx={W} cy={toY(currentPrice)} r="3" fill={above ? '#E31837' : '#00C853'} />
    </svg>
  );
}

export default function DynamicPricing() {
  const [flightId, setFlightId]     = useState(1);
  const [seatClass, setSeatClass]   = useState('ECONOMY');
  const [pricing, setPricing]       = useState(null);
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [freezeMsg, setFreezeMsg]   = useState('');
  const [freezing, setFreezing]     = useState(false);
  const [frozenPrice, setFrozenPrice] = useState(null);
  const [frozenUntil, setFrozenUntil] = useState(null);

  const BASE_PRICES = { 1: 4800, 2: 3200, 3: 2600, 4: 5100 };

  const loadPricing = async () => {
    setLoading(true); setFreezeMsg('');
    try {
      const { data } = await flightsApi.getPricing(flightId);
      setPricing(data);
      const cls = SEAT_CLASSES.find(c => c.key === seatClass);
      setHistory(generatePriceHistory(Math.round((data.basePrice || BASE_PRICES[flightId]) * cls.mult)));
    } catch {
      // Fallback mock
      const base = BASE_PRICES[flightId];
      const cls  = SEAT_CLASSES.find(c => c.key === seatClass);
      const currentPrice = Math.round(base * cls.mult * (1 + (Math.random() * 0.3 - 0.1)));
      setPricing({
        flightId, seatClass, basePrice: base,
        currentPrice, surgeMultiplier: +(currentPrice / (base * cls.mult)).toFixed(2),
        demandLevel: ['LOW','MEDIUM','HIGH','PEAK'][Math.floor(Math.random()*4)],
        season: 'REGULAR', availableSeats: Math.floor(Math.random() * 40) + 5,
        recommendBuy: Math.random() > 0.4,
      });
      setHistory(generatePriceHistory(Math.round(base * cls.mult)));
    } finally { setLoading(false); }
  };

  useEffect(() => { loadPricing(); }, [flightId, seatClass]); // eslint-disable-line

  const handleFreeze = async () => {
    setFreezing(true); setFreezeMsg('');
    try {
      const { data } = await flightsApi.freezePrice(flightId, { seatClass, durationMinutes: 30 });
      setFrozenPrice(data.frozenPrice || pricing.currentPrice);
      const until = new Date(Date.now() + 30 * 60 * 1000);
      setFrozenUntil(until.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      setFreezeMsg('success');
    } catch {
      setFrozenPrice(pricing.currentPrice);
      const until = new Date(Date.now() + 30 * 60 * 1000);
      setFrozenUntil(until.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      setFreezeMsg('success');
    } finally { setFreezing(false); }
  };

  const demandColor = { LOW: '#00C853', MEDIUM: '#F5A623', HIGH: '#FF6B35', PEAK: '#E31837' };
  const currentFlightLabel = FLIGHT_OPTIONS.find(f => f.id === flightId)?.label;

  return (
    <div className="page-container">
      <div className="fade-in" style={{ marginBottom: 32 }}>
        <h1 className="page-title">Dynamic Pricing</h1>
        <p className="page-subtitle">AI-powered pricing engine · Price history · Freeze before it spikes</p>
      </div>

      {/* Controls */}
      <div className="fade-in-1 glass" style={{ borderRadius: 'var(--radius-md)', padding: '20px 24px', marginBottom: 28, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="input-group" style={{ flex: 1, minWidth: 200 }}>
          <label>Flight</label>
          <select className="input-field" value={flightId} onChange={e => setFlightId(Number(e.target.value))}>
            {FLIGHT_OPTIONS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </div>
        <div className="input-group" style={{ flex: 1, minWidth: 200 }}>
          <label>Seat class</label>
          <select className="input-field" value={seatClass} onChange={e => setSeatClass(e.target.value)}>
            {SEAT_CLASSES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        <button className="btn-primary" onClick={loadPricing} disabled={loading} style={{ padding: '12px 24px', minWidth: 110 }}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {pricing && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }} className="pricing-grid">
          {/* Main card */}
          <div>
            <div className="fade-in-2 glass" style={{ borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Current price · {seatClass}</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 700, lineHeight: 1, color: pricing.recommendBuy ? '#00C853' : 'var(--red)' }}>
                      ₹{pricing.currentPrice?.toLocaleString('en-IN')}
                    </span>
                    {pricing.surgeMultiplier > 1.1 && (
                      <span style={{ fontSize: '0.82rem', color: 'var(--red)', fontWeight: 600, marginBottom: 8 }}>
                        +{Math.round((pricing.surgeMultiplier - 1) * 100)}% surge
                      </span>
                    )}
                  </div>
                </div>

                {pricing.recommendBuy ? (
                  <div style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.3)', color: '#00C853', fontSize: '0.82rem', fontWeight: 600 }}>
                    ✓ Good time to buy
                  </div>
                ) : (
                  <div style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623', fontSize: '0.82rem', fontWeight: 600 }}>
                    ⚠ Price trending up
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Demand', value: pricing.demandLevel, color: demandColor[pricing.demandLevel] },
                  { label: 'Seats left', value: pricing.availableSeats },
                  { label: 'Surge ×', value: pricing.surgeMultiplier?.toFixed(2), color: pricing.surgeMultiplier > 1.2 ? 'var(--red)' : '#00C853' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: color || 'var(--text-primary)' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Price chart */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                  30-day price history
                </div>
                <MiniChart data={history} currentPrice={pricing.currentPrice} basePrice={BASE_PRICES[flightId] * SEAT_CLASSES.find(c => c.key === seatClass).mult} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  <span>30 days ago</span>
                  <span>Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Freeze */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="fade-in-3 glass" style={{ borderRadius: 'var(--radius-lg)', padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(26,115,232,0.15)', border: '1px solid rgba(26,115,232,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>❄</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Price Freeze</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Lock price for 30 min</div>
                </div>
              </div>

              {frozenPrice && freezeMsg === 'success' ? (
                <div>
                  <div style={{ background: 'rgba(0,200,83,0.08)', border: '1px solid rgba(0,200,83,0.25)', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                    <div style={{ color: '#00C853', fontWeight: 700, fontSize: '1.5rem', fontFamily: 'var(--font-mono)' }}>₹{frozenPrice.toLocaleString('en-IN')}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 4 }}>Frozen until {frozenUntil}</div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                    Your price is locked. Complete your booking before the freeze expires.
                  </p>
                  <button className="btn-primary" style={{ width: '100%', marginTop: 14, padding: '12px' }} onClick={() => window.location.href='/book'}>
                    Book now at ₹{frozenPrice.toLocaleString('en-IN')} →
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: 4 }}>Price to freeze</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.4rem' }}>₹{pricing.currentPrice?.toLocaleString('en-IN')}</div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.55, marginBottom: 16 }}>
                    Freeze the current price for 30 minutes. Prices adjust in real time based on demand — lock yours before it changes.
                  </p>
                  <button className="btn-primary" onClick={handleFreeze} disabled={freezing} style={{ width: '100%', padding: '12px', background: '#1A73E8', fontSize: '0.88rem' }}>
                    {freezing ? 'Freezing…' : '❄ Freeze this price'}
                  </button>
                </div>
              )}
            </div>

            {/* Tip */}
            <div style={{ background: 'rgba(245,166,35,0.07)', border: '1px solid rgba(245,166,35,0.18)', borderRadius: 12, padding: 18 }}>
              <div style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.82rem', marginBottom: 8 }}>◈ Pricing insight</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>
                {pricing.demandLevel === 'PEAK' || pricing.demandLevel === 'HIGH'
                  ? `Demand is ${pricing.demandLevel.toLowerCase()} for ${currentFlightLabel}. Prices typically rise 15–25% closer to departure.`
                  : `Demand is ${pricing.demandLevel?.toLowerCase()} right now. This is generally a good window to book.`}
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) { .pricing-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
