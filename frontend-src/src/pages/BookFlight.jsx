import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CITIES = ['Delhi (DEL)', 'Mumbai (BOM)', 'Bangalore (BLR)', 'Hyderabad (HYD)', 'Chennai (MAA)', 'Kolkata (CCU)', 'Goa (GOI)', 'Kochi (COK)', 'Pune (PNQ)', 'Ahmedabad (AMD)'];

const MOCK_FLIGHTS = [
  { id:1, flightNumber:'AI101', airline:'Air India',    origin:'DEL', destination:'BOM', departure:'06:30', arrival:'08:45', duration:'2h 15m', price:{ ECONOMY:4800, BUSINESS:12480, FIRST:20160 }, seats:{ ECONOMY:42, BUSINESS:8, FIRST:4 }, aircraft:'Airbus A320' },
  { id:2, flightNumber:'6E302', airline:'IndiGo',       origin:'DEL', destination:'BOM', departure:'09:00', arrival:'11:10', duration:'2h 10m', price:{ ECONOMY:3200, BUSINESS:8320, FIRST:0    }, seats:{ ECONOMY:28, BUSINESS:6, FIRST:0  }, aircraft:'Airbus A320neo' },
  { id:3, flightNumber:'UK802', airline:'Vistara',      origin:'DEL', destination:'BOM', departure:'13:45', arrival:'16:00', duration:'2h 15m', price:{ ECONOMY:5100, BUSINESS:13260, FIRST:22440 }, seats:{ ECONOMY:15, BUSINESS:12, FIRST:6 }, aircraft:'Boeing 737' },
  { id:4, flightNumber:'SG204', airline:'SpiceJet',     origin:'DEL', destination:'BOM', departure:'17:20', arrival:'19:35', duration:'2h 15m', price:{ ECONOMY:2800, BUSINESS:7280, FIRST:0    }, seats:{ ECONOMY:55, BUSINESS:4, FIRST:0  }, aircraft:'Boeing 737' },
  { id:5, flightNumber:'AI202', airline:'Air India',    origin:'BOM', destination:'BLR', departure:'08:00', arrival:'09:45', duration:'1h 45m', price:{ ECONOMY:3200, BUSINESS:8320, FIRST:13440 }, seats:{ ECONOMY:38, BUSINESS:10, FIRST:4 }, aircraft:'Airbus A319' },
  { id:6, flightNumber:'6E501', airline:'IndiGo',       origin:'BLR', destination:'HYD', departure:'11:30', arrival:'12:40', duration:'1h 10m', price:{ ECONOMY:2600, BUSINESS:6760, FIRST:0    }, seats:{ ECONOMY:61, BUSINESS:0, FIRST:0  }, aircraft:'Airbus A320neo' },
];

const AIRLINE_COLORS = { 'Air India':'#E31837', 'IndiGo':'#1A1A6E', 'Vistara':'#6B21A8', 'SpiceJet':'#FF6B35' };

function FlightCard({ flight, onBook }) {
  const [cls, setCls] = useState('ECONOMY');
  const [booking, setBooking] = useState(false);
  const [booked, setBooked]   = useState(false);
  const color = AIRLINE_COLORS[flight.airline] || 'var(--red)';

  const handleBook = async () => {
    if (!flight.price[cls]) return;
    setBooking(true);
    await onBook(flight, cls);
    setBooking(false);
    setBooked(true);
  };

  return (
    <div className="glass" style={{ borderRadius:'var(--radius-md)', padding:24, marginBottom:14, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, width:3, height:'100%', background:color }} />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:18 }}>
        {/* Airline + flight */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:`${color}20`, border:`1px solid ${color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>✈</div>
          <div>
            <div style={{ fontWeight:700, fontSize:'0.95rem' }}>{flight.airline}</div>
            <div style={{ fontFamily:'var(--font-mono)', color:'var(--text-muted)', fontSize:'0.78rem' }}>{flight.flightNumber} · {flight.aircraft}</div>
          </div>
        </div>

        {/* Route + time */}
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'1.4rem', fontWeight:700, lineHeight:1 }}>{flight.origin}</div>
            <div style={{ color:'var(--text-secondary)', fontSize:'0.82rem', marginTop:3 }}>{flight.departure}</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
            <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{flight.duration}</div>
            <div style={{ display:'flex', alignItems:'center', gap:4, width:80 }}>
              <div style={{ flex:1, height:1, background:'var(--border)' }} />
              <span style={{ color, fontSize:'0.75rem' }}>✈</span>
              <div style={{ flex:1, height:1, background:'var(--border)' }} />
            </div>
            <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Direct</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'1.4rem', fontWeight:700, lineHeight:1 }}>{flight.destination}</div>
            <div style={{ color:'var(--text-secondary)', fontSize:'0.82rem', marginTop:3 }}>{flight.arrival}</div>
          </div>
        </div>

        {/* Price + book */}
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'1.5rem', fontWeight:700, color, lineHeight:1 }}>
            ₹{flight.price[cls]?.toLocaleString('en-IN') || 'N/A'}
          </div>
          <div style={{ color:'var(--text-muted)', fontSize:'0.72rem', marginTop:2 }}>per person</div>
        </div>
      </div>

      {/* Class selector + seats + book button */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10, paddingTop:14, borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'flex', gap:6 }}>
          {['ECONOMY','BUSINESS','FIRST'].map(c => {
            if (!flight.price[c]) return null;
            return (
              <button key={c} onClick={() => setCls(c)} style={{
                padding:'6px 14px', borderRadius:7, fontSize:'0.75rem', fontWeight:600, cursor:'pointer',
                background: cls===c ? `${color}20` : 'rgba(255,255,255,0.04)',
                border:`1px solid ${cls===c ? color : 'var(--border)'}`,
                color: cls===c ? color : 'var(--text-secondary)',
                transition:'all 0.2s',
              }}>
                {c.charAt(0)+c.slice(1).toLowerCase()}
                <span style={{ marginLeft:5, opacity:0.7 }}>({flight.seats[c]})</span>
              </button>
            );
          })}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:'0.75rem', color: flight.seats[cls] < 10 ? 'var(--red)' : 'var(--text-muted)' }}>
            {flight.seats[cls] < 10 ? `⚠ Only ${flight.seats[cls]} left` : `${flight.seats[cls]} seats available`}
          </span>
          {booked ? (
            <div style={{ padding:'8px 20px', borderRadius:8, background:'rgba(0,200,83,0.15)', border:'1px solid rgba(0,200,83,0.3)', color:'#00C853', fontSize:'0.82rem', fontWeight:700 }}>
              ✓ Booked!
            </div>
          ) : (
            <button className="btn-primary" onClick={handleBook} disabled={booking} style={{ padding:'9px 24px', fontSize:'0.85rem' }}>
              {booking ? 'Booking…' : 'Book now →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookFlight() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ from:'DEL', to:'BOM', date: new Date().toISOString().split('T')[0], passengers:1, tripType:'ONE_WAY' });
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [sortBy, setSortBy]   = useState('price');
  const [myBookings, setMyBookings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mmt_bookings') || '[]'); } catch { return []; }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const filtered = MOCK_FLIGHTS.filter(f => f.origin === form.from && f.destination === form.to);
    setResults(filtered);
    setSearched(true);
  };

  const handleSwap = () => setForm(f => ({ ...f, from: f.to, to: f.from }));

  const handleBook = async (flight, cls) => {
    await new Promise(r => setTimeout(r, 800));
    const booking = {
      id: Date.now(),
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      route: `${flight.origin} → ${flight.destination}`,
      departureDate: form.date,
      departureTime: flight.departure,
      arrivalTime: flight.arrival,
      seatClass: cls,
      totalAmount: flight.price[cls],
      status: 'CONFIRMED',
      bookedOn: new Date().toISOString().split('T')[0],
      passengers: form.passengers,
    };
    const updated = [booking, ...myBookings];
    setMyBookings(updated);
    localStorage.setItem('mmt_bookings', JSON.stringify(updated));
  };

  const sorted = [...results].sort((a,b) => {
    if (sortBy === 'price')    return a.price.ECONOMY - b.price.ECONOMY;
    if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
    if (sortBy === 'departure')return a.departure.localeCompare(b.departure);
    return 0;
  });

  const cityCode = (s) => s.match(/\(([A-Z]+)\)/)?.[1] || s;

  return (
    <div className="page-container">
      <div className="fade-in" style={{ marginBottom:32 }}>
        <h1 className="page-title">Book a Flight</h1>
        <p className="page-subtitle">Search real-time fares · Compare airlines · Instant confirmation</p>
      </div>

      {/* Search form */}
      <div className="fade-in-1 glass" style={{ borderRadius:'var(--radius-lg)', padding:28, marginBottom:28 }}>
        {/* Trip type */}
        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          {['ONE_WAY','ROUND_TRIP'].map(t => (
            <button key={t} onClick={() => setForm(f=>({...f,tripType:t}))} style={{
              padding:'7px 18px', borderRadius:8, fontSize:'0.82rem', fontWeight:600, cursor:'pointer',
              background: form.tripType===t ? 'rgba(227,24,55,0.15)' : 'rgba(255,255,255,0.04)',
              border:`1px solid ${form.tripType===t ? 'rgba(227,24,55,0.4)' : 'var(--border)'}`,
              color: form.tripType===t ? 'var(--red)' : 'var(--text-secondary)',
            }}>
              {t === 'ONE_WAY' ? 'One Way' : 'Round Trip'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr 160px 120px', gap:12, alignItems:'end' }} className="search-grid">
            <div className="input-group">
              <label>From</label>
              <select className="input-field" value={form.from} onChange={e => setForm(f=>({...f, from: cityCode(e.target.value)}))}>
                {CITIES.map(c => <option key={c} value={cityCode(c)}>{c}</option>)}
              </select>
            </div>

            <button type="button" onClick={handleSwap} style={{
              width:40, height:40, borderRadius:'50%', background:'rgba(227,24,55,0.12)',
              border:'1px solid rgba(227,24,55,0.3)', color:'var(--red)', fontSize:'1rem',
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:1,
            }}>⇄</button>

            <div className="input-group">
              <label>To</label>
              <select className="input-field" value={form.to} onChange={e => setForm(f=>({...f, to: cityCode(e.target.value)}))}>
                {CITIES.map(c => <option key={c} value={cityCode(c)}>{c}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label>Date</label>
              <input className="input-field" type="date" value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e => setForm(f=>({...f, date:e.target.value}))} required />
            </div>

            <div className="input-group">
              <label>Passengers</label>
              <select className="input-field" value={form.passengers} onChange={e => setForm(f=>({...f, passengers:Number(e.target.value)}))}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n===1?'Adult':'Adults'}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop:16, padding:'13px 40px', fontSize:'0.95rem' }}>
            Search flights →
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div className="fade-in">
          {results.length === 0 ? (
            <div style={{ textAlign:'center', padding:'50px 20px', color:'var(--text-muted)' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:14 }}>✈</div>
              <div style={{ fontSize:'1rem', marginBottom:8 }}>No flights found for {form.from} → {form.to}</div>
              <div style={{ fontSize:'0.82rem' }}>Try DEL → BOM, BOM → BLR, or BLR → HYD</div>
            </div>
          ) : (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
                <div style={{ color:'var(--text-secondary)', fontSize:'0.88rem' }}>
                  <strong style={{ color:'var(--text-primary)' }}>{results.length} flights</strong> found · {form.from} → {form.to} · {new Date(form.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Sort:</span>
                  {['price','departure','duration'].map(s => (
                    <button key={s} onClick={() => setSortBy(s)} style={{
                      padding:'5px 12px', borderRadius:7, fontSize:'0.75rem', fontWeight:600, cursor:'pointer',
                      background: sortBy===s ? 'rgba(227,24,55,0.12)' : 'transparent',
                      border:`1px solid ${sortBy===s ? 'rgba(227,24,55,0.3)' : 'var(--border)'}`,
                      color: sortBy===s ? 'var(--red)' : 'var(--text-secondary)',
                    }}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>
                  ))}
                </div>
              </div>
              {sorted.map(f => <FlightCard key={f.id} flight={f} onBook={handleBook} />)}
            </>
          )}
        </div>
      )}

      {/* Quick links */}
      {!searched && (
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {[['DEL','BOM'],['BOM','BLR'],['BLR','HYD'],['DEL','CCU']].map(([from,to]) => (
            <button key={from+to} onClick={() => { setForm(f=>({...f,from,to})); }}
              style={{ padding:'8px 16px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', color:'var(--text-secondary)', fontSize:'0.82rem', cursor:'pointer' }}>
              ✈ {from} → {to}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width:860px) { .search-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width:500px) { .search-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
