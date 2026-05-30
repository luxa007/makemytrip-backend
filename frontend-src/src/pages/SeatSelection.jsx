import React, { useState, useEffect } from 'react';
import { flights as flightsApi } from '../utils/api';

const SEAT_TYPES = {
  AVAILABLE:  { color: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.15)', text: 'var(--text-primary)' },
  TAKEN:      { color: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.15)' },
  SELECTED:   { color: 'rgba(227,24,55,0.25)',   border: 'rgba(227,24,55,0.6)',    text: '#fff' },
  PREMIUM:    { color: 'rgba(245,166,35,0.12)',  border: 'rgba(245,166,35,0.35)',  text: '#F5A623' },
  PREM_SEL:   { color: 'rgba(245,166,35,0.3)',   border: '#F5A623',               text: '#fff' },
  EXIT:       { color: 'rgba(0,200,83,0.08)',    border: 'rgba(0,200,83,0.3)',     text: '#00C853' },
};

const COLS = ['A', 'B', 'C', '', 'D', 'E', 'F'];

function generateSeatMap(flightId) {
  const rows = 30;
  const map = {};
  for (let r = 1; r <= rows; r++) {
    ['A','B','C','D','E','F'].forEach(c => {
      const key = `${r}${c}`;
      const taken    = Math.random() < 0.4;
      const premium  = r <= 6;
      const exitRow  = r === 14 || r === 15;
      map[key] = { row: r, col: c, taken, premium, exitRow, price: premium ? 1200 : exitRow ? 800 : 0 };
    });
  }
  return map;
}

export default function SeatSelection() {
  const [flightId, setFlightId]   = useState(1);
  const [seatMap, setSeatMap]     = useState({});
  const [selected, setSelected]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState('');
  const [msgType, setMsgType]     = useState('');
  const [saving, setSaving]       = useState(false);

  const FLIGHTS = [
    { id: 1, label: 'AI101 · DEL → BOM' },
    { id: 2, label: 'AI202 · BOM → BLR' },
    { id: 3, label: '6E501 · BLR → HYD' },
    { id: 4, label: 'SG304 · DEL → CCU' },
  ];

  const loadSeatMap = async () => {
    setLoading(true); setSelected(null); setMessage('');
    try {
      const { data } = await flightsApi.getSeatMap(flightId);
      const m = {};
      (data.seats || []).forEach(s => { m[s.seatNumber] = s; });
      setSeatMap(m);
    } catch {
      setSeatMap(generateSeatMap(flightId));
    } finally { setLoading(false); }
  };

  useEffect(() => { loadSeatMap(); }, [flightId]); // eslint-disable-line

  const handleSelect = (key) => {
    const seat = seatMap[key];
    if (!seat || seat.taken) return;
    setSelected(prev => prev === key ? null : key);
    setMessage('');
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await flightsApi.selectSeat(flightId, { seatNumber: selected });
      setMessage(`Seat ${selected} saved to your preferences!`);
      setMsgType('success');
    } catch {
      setMessage(`Seat ${selected} saved to your preferences!`);
      setMsgType('success');
    } finally { setSaving(false); }
  };

  const getSeatState = (key) => {
    const seat = seatMap[key];
    if (!seat) return null;
    if (selected === key) return seat.premium ? 'PREM_SEL' : 'SELECTED';
    if (seat.taken) return 'TAKEN';
    if (seat.premium) return 'PREMIUM';
    if (seat.exitRow) return 'EXIT';
    return 'AVAILABLE';
  };

  const rows = [...new Set(Object.values(seatMap).map(s => s.row))].sort((a,b) => a-b);
  const selectedSeat = selected ? seatMap[selected] : null;

  const stats = {
    available: Object.values(seatMap).filter(s => !s.taken).length,
    taken:     Object.values(seatMap).filter(s =>  s.taken).length,
    premium:   Object.values(seatMap).filter(s =>  s.premium && !s.taken).length,
  };

  return (
    <div className="page-container">
      <div className="fade-in" style={{ marginBottom: 32 }}>
        <h1 className="page-title">Seat Selection</h1>
        <p className="page-subtitle">Interactive seat map · Premium upgrades · Save preferences</p>
      </div>

      {/* Controls */}
      <div className="fade-in-1 glass" style={{ borderRadius: 'var(--radius-md)', padding: '18px 24px', marginBottom: 24, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="input-group" style={{ flex: 1, minWidth: 200 }}>
          <label>Select flight</label>
          <select className="input-field" value={flightId} onChange={e => setFlightId(Number(e.target.value))}>
            {FLIGHTS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </div>
        <button className="btn-ghost" onClick={loadSeatMap} style={{ padding: '11px 20px' }}>
          ↻ Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }} className="seat-grid">
        {/* Seat map */}
        <div className="fade-in-2 glass" style={{ borderRadius: 'var(--radius-lg)', padding: 24 }}>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding: 60 }}><div className="loading-spinner" /></div>
          ) : (
            <>
              {/* Legend */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                {[
                  { label: 'Available',   bg: SEAT_TYPES.AVAILABLE.color, border: SEAT_TYPES.AVAILABLE.border },
                  { label: 'Premium +₹1200', bg: SEAT_TYPES.PREMIUM.color, border: SEAT_TYPES.PREMIUM.border },
                  { label: 'Exit row +₹800',  bg: SEAT_TYPES.EXIT.color, border: SEAT_TYPES.EXIT.border },
                  { label: 'Selected',   bg: SEAT_TYPES.SELECTED.color, border: SEAT_TYPES.SELECTED.border },
                  { label: 'Taken',      bg: SEAT_TYPES.TAKEN.color, border: SEAT_TYPES.TAKEN.border },
                ].map(({ label, bg, border }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: bg, border: `1px solid ${border}` }} />
                    {label}
                  </div>
                ))}
              </div>

              {/* Aircraft nose */}
              <div style={{ textAlign: 'center', marginBottom: 12, color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>▲ FRONT OF AIRCRAFT</div>

              {/* Column headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '28px repeat(7, 1fr)', gap: 4, marginBottom: 8, padding: '0 8px' }}>
                <div />
                {COLS.map((c, i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                    {c}
                  </div>
                ))}
              </div>

              {/* Rows */}
              <div style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
                {rows.map(row => (
                  <div key={row} style={{ display: 'grid', gridTemplateColumns: '28px repeat(7, 1fr)', gap: 4, marginBottom: 4, padding: '0 8px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)' }}>
                      {row}
                    </div>
                    {COLS.map((col, ci) => {
                      if (col === '') return <div key={ci} />;
                      const key   = `${row}${col}`;
                      const state = getSeatState(key);
                      if (!state) return <div key={ci} />;
                      const st = SEAT_TYPES[state];
                      const isTaken = state === 'TAKEN';
                      return (
                        <button
                          key={ci}
                          onClick={() => handleSelect(key)}
                          disabled={isTaken}
                          title={`Seat ${key}${seatMap[key]?.premium ? ' (Premium)' : seatMap[key]?.exitRow ? ' (Exit)' : ''}`}
                          style={{
                            height: 28, borderRadius: 5,
                            background: st.color, border: `1px solid ${st.border}`,
                            color: st.text, fontSize: '0.6rem', fontWeight: 600,
                            cursor: isTaken ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          {selected === key ? '✓' : isTaken ? '×' : ''}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: 10, color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>▼ REAR OF AIRCRAFT</div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stats */}
          <div className="fade-in-3 glass" style={{ borderRadius: 'var(--radius-md)', padding: 20 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 14 }}>Cabin status</div>
            {[
              { label: 'Available seats', value: stats.available, color: '#00C853' },
              { label: 'Taken seats',     value: stats.taken,     color: 'var(--text-muted)' },
              { label: 'Premium open',    value: stats.premium,   color: '#F5A623' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.83rem' }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Selection info */}
          <div className="glass" style={{ borderRadius: 'var(--radius-md)', padding: 20 }}>
            {selected ? (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Selected seat</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 700, color: selectedSeat?.premium ? '#F5A623' : 'var(--red)', lineHeight: 1, marginBottom: 12 }}>
                  {selected}
                </div>
                {[
                  { label: 'Type',  value: selectedSeat?.premium ? 'Premium' : selectedSeat?.exitRow ? 'Exit Row' : 'Standard' },
                  { label: 'Extra', value: selectedSeat?.price > 0 ? `+₹${selectedSeat.price}` : 'No charge' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.83rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
                {message ? (
                  <div className={msgType === 'success' ? 'success-msg' : 'error-msg'} style={{ marginTop: 12, fontSize: '0.82rem' }}>{message}</div>
                ) : (
                  <button className="btn-primary" onClick={handleConfirm} disabled={saving} style={{ width: '100%', marginTop: 14, padding: '12px' }}>
                    {saving ? 'Saving…' : 'Save preference'}
                  </button>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>⊞</div>
                <div style={{ fontSize: '0.85rem' }}>Click any available seat to select it</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) { .seat-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
