import React, { useState, useEffect, useRef, useCallback } from 'react';
import { flights as flightsApi } from '../utils/api';

const STATUS_META = {
  ON_TIME:   { label: 'On Time',   color: '#00C853', bg: 'rgba(0,200,83,0.12)',   icon: '●' },
  DELAYED:   { label: 'Delayed',   color: '#F5A623', bg: 'rgba(245,166,35,0.12)', icon: '▲' },
  BOARDING:  { label: 'Boarding',  color: '#1A73E8', bg: 'rgba(26,115,232,0.12)', icon: '▶' },
  CANCELLED: { label: 'Cancelled', color: '#E31837', bg: 'rgba(227,24,55,0.12)',  icon: '✕' },
  SCHEDULED: { label: 'Scheduled', color: '#8892A4', bg: 'rgba(136,146,164,0.12)',icon: '○' },
  IN_FLIGHT: { label: 'In Flight', color: '#00BCD4', bg: 'rgba(0,188,212,0.12)',  icon: '✈' },
  LANDED:    { label: 'Landed',    color: '#7C4DFF', bg: 'rgba(124,77,255,0.12)', icon: '▼' },
};

const MOCK_FLIGHTS = [
  { id: 1, flightNumber: 'AI101', origin: 'DEL', destination: 'BOM', departureTime: '06:30', arrivalTime: '08:45', status: 'ON_TIME',   delay: null, gate: 'A12', aircraft: 'A320' },
  { id: 2, flightNumber: 'AI202', origin: 'BOM', destination: 'BLR', departureTime: '09:15', arrivalTime: '11:00', status: 'DELAYED',   delay: '45 min', gate: 'B07', aircraft: 'B737' },
  { id: 3, flightNumber: '6E501', origin: 'BLR', destination: 'HYD', departureTime: '11:30', arrivalTime: '12:40', status: 'BOARDING',  delay: null, gate: 'C03', aircraft: 'A320neo' },
  { id: 4, flightNumber: 'SG304', origin: 'DEL', destination: 'CCU', departureTime: '14:00', arrivalTime: '16:15', status: 'SCHEDULED', delay: null, gate: 'D11', aircraft: 'B737' },
  { id: 5, flightNumber: 'UK802', origin: 'HYD', destination: 'DEL', departureTime: '16:45', arrivalTime: '18:50', status: 'IN_FLIGHT', delay: null, gate: '—',   aircraft: 'A320' },
  { id: 6, flightNumber: 'AI303', origin: 'CCU', destination: 'MAA', departureTime: '08:00', arrivalTime: '10:10', status: 'LANDED',    delay: null, gate: '—',   aircraft: 'B777' },
];

function FlightCard({ flight, tracked, onToggle }) {
  const meta = STATUS_META[flight.status] || STATUS_META.SCHEDULED;

  return (
    <div className="glass glass-hover" style={{ borderRadius: 'var(--radius-md)', padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: meta.color, borderRadius: '3px 0 0 3px' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '1.05rem' }}>{flight.flightNumber}</span>
            <span style={{
              padding: '3px 9px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700,
              background: meta.bg, color: meta.color, border: `1px solid ${meta.color}30`,
              display: 'flex', alignItems: 'center', gap: 5,
              letterSpacing: '0.05em',
            }}>
              {flight.status === 'IN_FLIGHT' || flight.status === 'ON_TIME' ? (
                <span style={{ animation: 'pulse-dot 1.5s infinite', width: 5, height: 5, borderRadius: '50%', background: meta.color, display: 'inline-block' }} />
              ) : null}
              {meta.label}
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{flight.aircraft}</div>
        </div>

        <button
          onClick={() => onToggle(flight.id)}
          style={{
            padding: '6px 14px', borderRadius: 8,
            background: tracked ? 'rgba(227,24,55,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${tracked ? 'rgba(227,24,55,0.35)' : 'var(--border)'}`,
            color: tracked ? 'var(--red)' : 'var(--text-secondary)',
            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {tracked ? '★ Tracked' : '☆ Track'}
        </button>
      </div>

      {/* Route */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 700, lineHeight: 1 }}>{flight.origin}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: 3 }}>{flight.departureTime}</div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ color: meta.color, fontSize: '0.9rem' }}>✈</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 700, lineHeight: 1 }}>{flight.destination}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: 3 }}>{flight.arrivalTime}</div>
        </div>
      </div>

      {/* Details row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Gate', value: flight.gate },
          { label: 'Delay', value: flight.delay || 'None', valueColor: flight.delay ? '#F5A623' : 'var(--text-secondary)' },
        ].map(({ label, value, valueColor }) => (
          <div key={label} style={{ fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)', marginRight: 5 }}>{label}</span>
            <span style={{ color: valueColor || 'var(--text-primary)', fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FlightStatus() {
  const [flightList, setFlightList]   = useState(MOCK_FLIGHTS);
  const [tracked, setTracked]         = useState(new Set([1]));
  const [wsStatus, setWsStatus]       = useState('connecting');
  const [updates, setUpdates]         = useState([]);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const wsRef = useRef(null);
  const tickRef = useRef(null);

  // Try real WebSocket, fall back to mock polling
  useEffect(() => {
    let ws;
    try {
      ws = new WebSocket(`ws://localhost:8080/ws/flight-status`);
      ws.onopen    = () => setWsStatus('connected');
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setFlightList(prev => prev.map(f => f.id === data.flightId ? { ...f, status: data.status, delay: data.delay } : f));
          addUpdate(`${data.flightNumber} → ${STATUS_META[data.status]?.label}`);
        } catch {}
      };
      ws.onerror   = () => { setWsStatus('mock'); startMock(); };
      ws.onclose   = () => { if (wsStatus === 'connected') setWsStatus('disconnected'); };
      wsRef.current = ws;
    } catch { setWsStatus('mock'); startMock(); }

    return () => { ws?.close(); clearInterval(tickRef.current); };
  }, []); // eslint-disable-line

  const addUpdate = (msg) => {
    const ts = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setUpdates(prev => [{ msg, ts, id: Date.now() }, ...prev].slice(0, 12));
  };

  const startMock = useCallback(() => {
    const statuses = Object.keys(STATUS_META);
    tickRef.current = setInterval(() => {
      setFlightList(prev => {
        const idx = Math.floor(Math.random() * prev.length);
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const updated = prev.map((f, i) => i === idx ? { ...f, status: newStatus, delay: newStatus === 'DELAYED' ? `${(Math.floor(Math.random()*6)+1)*10} min` : null } : f);
        addUpdate(`${prev[idx].flightNumber} → ${STATUS_META[newStatus]?.label}`);
        return updated;
      });
    }, 4000);
  }, []);

  const toggleTrack = (id) => setTracked(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const filtered = flightList.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.flightNumber.toLowerCase().includes(q) || f.origin.toLowerCase().includes(q) || f.destination.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'ALL' || f.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const trackedFlights = flightList.filter(f => tracked.has(f.id));

  return (
    <div className="page-container">
      {/* Header */}
      <div className="fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 className="page-title" style={{ margin: 0 }}>Live Flight Status</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20,
              background: wsStatus === 'connected' ? 'rgba(0,200,83,0.12)' : wsStatus === 'mock' ? 'rgba(245,166,35,0.12)' : 'rgba(136,146,164,0.12)',
              border: `1px solid ${wsStatus === 'connected' ? 'rgba(0,200,83,0.3)' : wsStatus === 'mock' ? 'rgba(245,166,35,0.3)' : 'var(--border)'}`,
              fontSize: '0.72rem', fontWeight: 600,
              color: wsStatus === 'connected' ? '#00C853' : wsStatus === 'mock' ? '#F5A623' : 'var(--text-secondary)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block', animation: 'pulse-dot 1.5s infinite' }} />
              {wsStatus === 'connected' ? 'WebSocket Live' : wsStatus === 'mock' ? 'Simulated Live' : 'Connecting…'}
            </div>
          </div>
          <p className="page-subtitle" style={{ margin: 0 }}>Real-time updates every 4 seconds · Track multiple flights</p>
        </div>
      </div>

      {/* Tracked flights */}
      {trackedFlights.length > 0 && (
        <div className="fade-in-1" style={{ marginBottom: 32 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
            Your tracked flights ({trackedFlights.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {trackedFlights.map(f => (
              <div key={f.id} style={{ border: '1px solid rgba(227,24,55,0.25)', borderRadius: 'var(--radius-md)', padding: '16px 20px', background: 'rgba(227,24,55,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{f.flightNumber}</span>
                  <span style={{ fontSize: '0.75rem', color: STATUS_META[f.status]?.color, fontWeight: 600 }}>
                    {STATUS_META[f.status]?.icon} {STATUS_META[f.status]?.label}
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 6 }}>
                  {f.origin} → {f.destination} · {f.departureTime}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layout: flights + updates */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }} className="status-grid">
        <div>
          {/* Search + filter */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <input
              className="input-field"
              placeholder="Search flight, route…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 180 }}
            />
            <select
              className="input-field"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ minWidth: 140 }}
            >
              <option value="ALL">All statuses</option>
              {Object.keys(STATUS_META).map(s => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No flights match your search</div>
            ) : filtered.map(f => (
              <FlightCard key={f.id} flight={f} tracked={tracked.has(f.id)} onToggle={toggleTrack} />
            ))}
          </div>
        </div>

        {/* Live updates feed */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
            Live updates
          </div>
          <div className="glass" style={{ borderRadius: 'var(--radius-md)', padding: 16, maxHeight: 480, overflowY: 'auto' }}>
            {updates.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '20px 0' }}>Waiting for updates…</p>
            ) : updates.map(u => (
              <div key={u.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', animation: 'fadeInUp 0.3s ease' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: 3 }}>{u.msg}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{u.ts}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) { .status-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
