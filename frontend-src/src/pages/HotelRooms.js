import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const MOCK_HOTELS = [
  { id:1, name:'The Grand Mumbai',     location:'Mumbai, India',  rating:4.8, reviews:324, icon:'🏨', tag:'Most Booked' },
  { id:2, name:'Delhi Luxury Suites',  location:'Delhi, India',   rating:4.6, reviews:218, icon:'🏩', tag:'Best Value'  },
  { id:3, name:'Goa Beach Resort',     location:'Goa, India',     rating:4.9, reviews:512, icon:'🌴', tag:'Top Rated'   },
];

const MOCK_ROOMS = [
  { id:1, type:'STANDARD', name:'Standard Room',       price:3500,  surcharge:0,     available:true,  size:'25 sqm', beds:'1 Queen Bed',    amenities:['WiFi','AC','TV','Safe'],                         preview:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600' },
  { id:2, type:'DELUXE',   name:'Deluxe City View',    price:5500,  surcharge:2000,  available:true,  size:'35 sqm', beds:'1 King Bed',     amenities:['WiFi','AC','TV','Minibar','City View','Desk'],   preview:'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600' },
  { id:3, type:'SUITE',    name:'Executive Suite',     price:9500,  surcharge:6000,  available:true,  size:'60 sqm', beds:'King + Sofa',    amenities:['WiFi','AC','TV','Minibar','Jacuzzi','Butler','Panoramic View'], preview:'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600' },
  { id:4, type:'STANDARD', name:'Standard Twin',       price:3500,  surcharge:0,     available:false, size:'25 sqm', beds:'2 Single Beds',  amenities:['WiFi','AC','TV'],                                preview:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600' },
  { id:5, type:'DELUXE',   name:'Deluxe Pool View',    price:6500,  surcharge:3000,  available:true,  size:'40 sqm', beds:'1 King Bed',     amenities:['WiFi','AC','TV','Minibar','Pool View','Balcony'], preview:'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600' },
  { id:6, type:'SUITE',    name:'Presidential Suite',  price:18000, surcharge:14500, available:true,  size:'120 sqm',beds:'2 King Beds',    amenities:['WiFi','AC','TV','Minibar','Jacuzzi','Butler','Private Pool'], preview:'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=600' },
];

const TYPE_COLOR = { STANDARD:'#8892A4', DELUXE:'#1A73E8', SUITE:'#F5A623' };
const TYPE_BG    = { STANDARD:'rgba(136,146,164,0.12)', DELUXE:'rgba(26,115,232,0.12)', SUITE:'rgba(245,166,35,0.12)' };

const UPSELL = {
  STANDARD: { msg:'⬆ Upgrade to Deluxe — city views & minibar for ₹2,000 more', color:'rgba(26,115,232,0.1)', border:'rgba(26,115,232,0.25)', text:'#1A73E8' },
  DELUXE:   { msg:'👑 Go Suite — jacuzzi, butler & panoramic views', color:'rgba(245,166,35,0.08)', border:'rgba(245,166,35,0.25)', text:'#F5A623' },
};

export default function HotelRooms() {
  const { user } = useAuth();
  const [hotel, setHotel]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [preview, setPreview]   = useState(null);
  const [filter, setFilter]     = useState('ALL');
  const [booked, setBooked]     = useState(false);
  const [saved, setSaved]       = useState(null);

  const filtered = MOCK_ROOMS.filter(r => filter === 'ALL' || r.type === filter);

  if (!hotel) return (
    <div className="page-container">
      <div className="fade-in" style={{ marginBottom:32 }}>
        <h1 className="page-title">Hotel Room Selection</h1>
        <p className="page-subtitle">Browse hotels · Compare room types · View 3D previews</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
        {MOCK_HOTELS.map(h => (
          <div key={h.id} className="glass glass-hover fade-in-1"
            onClick={() => setHotel(h)}
            style={{ borderRadius:'var(--radius-md)', padding:28, cursor:'pointer', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:16, right:16, background:'var(--red)', color:'white', fontSize:'0.68rem', fontWeight:700, padding:'3px 10px', borderRadius:20, letterSpacing:'0.06em' }}>{h.tag}</div>
            <div style={{ fontSize:'2.8rem', marginBottom:16 }}>{h.icon}</div>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', fontWeight:700, marginBottom:6 }}>{h.name}</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem', marginBottom:16 }}>📍 {h.location}</p>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <span style={{ color:'#F5A623', fontSize:'0.9rem' }}>{'★'.repeat(Math.floor(h.rating))}</span>
                <span style={{ color:'var(--text-secondary)', fontSize:'0.8rem', marginLeft:6 }}>{h.rating} · {h.reviews} reviews</span>
              </div>
              <span style={{ color:'var(--red)', fontWeight:700, fontSize:'0.85rem' }}>View rooms →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="fade-in" style={{ display:'flex', alignItems:'center', gap:16, marginBottom:28, flexWrap:'wrap' }}>
        <button className="btn-ghost" onClick={() => { setHotel(null); setSelected(null); setBooked(false); }} style={{ padding:'8px 16px', fontSize:'0.85rem' }}>← Hotels</button>
        <div>
          <h1 className="page-title" style={{ marginBottom:2 }}>{hotel.name}</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>📍 {hotel.location} · ★ {hotel.rating} · {hotel.reviews} reviews</p>
        </div>
      </div>

      {/* Filter */}
      <div className="fade-in-1" style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {['ALL','STANDARD','DELUXE','SUITE'].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{ padding:'8px 18px', borderRadius:8, fontSize:'0.82rem', fontWeight:600, cursor:'pointer', transition:'all 0.2s',
              background: filter===t ? 'var(--red)' : 'var(--bg-card)',
              border: `1px solid ${filter===t ? 'var(--red)' : 'var(--border)'}`,
              color: filter===t ? 'white' : 'var(--text-secondary)' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Room Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:20, marginBottom:100 }}>
        {filtered.map(room => (
          <div key={room.id} className="glass"
            style={{ borderRadius:'var(--radius-md)', overflow:'hidden', opacity:room.available?1:0.5,
              border:`1px solid ${selected?.id===room.id ? 'rgba(227,24,55,0.5)' : 'var(--border)'}`,
              transition:'border-color 0.2s' }}>

            {/* Image */}
            <div style={{ height:180, overflow:'hidden', position:'relative', cursor:'pointer', background:'#111' }}
              onClick={() => room.available && setPreview(room)}>
              <img src={room.preview} alt={room.name}
                style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.3s' }}
                onMouseEnter={e => e.target.style.transform='scale(1.05)'}
                onMouseLeave={e => e.target.style.transform='scale(1)'}
                onError={e => e.target.style.display='none'} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 50%)', display:'flex', alignItems:'flex-end', padding:12 }}>
                <span style={{ color:'white', fontSize:'0.75rem', fontWeight:600 }}>🔍 Click to preview</span>
              </div>
              <div style={{ position:'absolute', top:10, right:10, background:TYPE_COLOR[room.type], color:'white', fontSize:'0.68rem', fontWeight:700, padding:'3px 9px', borderRadius:20 }}>{room.type}</div>
              {!room.available && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--red)', fontWeight:700, fontSize:'1rem', letterSpacing:'0.1em' }}>SOLD OUT</div>}
            </div>

            <div style={{ padding:18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div>
                  <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:3 }}>{room.name}</h3>
                  <p style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>{room.size} · {room.beds}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ color:'var(--red)', fontWeight:900, fontSize:'1.05rem' }}>₹{room.price.toLocaleString()}</div>
                  <div style={{ color:'var(--text-muted)', fontSize:'0.68rem' }}>per night</div>
                </div>
              </div>

              {/* Amenities */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:12 }}>
                {room.amenities.map(a => (
                  <span key={a} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:5, padding:'2px 8px', fontSize:'0.68rem', color:'var(--text-secondary)' }}>{a}</span>
                ))}
              </div>

              {/* Upsell */}
              {UPSELL[room.type] && room.available && (
                <div style={{ background:UPSELL[room.type].color, border:`1px solid ${UPSELL[room.type].border}`, borderRadius:7, padding:'7px 10px', marginBottom:10, fontSize:'0.75rem', color:UPSELL[room.type].text, fontWeight:500 }}>
                  {UPSELL[room.type].msg}
                </div>
              )}

              {room.available && (
                <button onClick={() => setSelected(room)}
                  style={{ width:'100%', padding:'9px', borderRadius:8, fontWeight:600, fontSize:'0.85rem', cursor:'pointer', transition:'all 0.2s',
                    background: selected?.id===room.id ? 'var(--red)' : 'transparent',
                    border: `1px solid ${selected?.id===room.id ? 'var(--red)' : 'var(--border)'}`,
                    color: selected?.id===room.id ? 'white' : 'var(--text-secondary)' }}>
                  {selected?.id===room.id ? '✓ Selected' : 'Select Room'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3D Preview Modal */}
      {preview && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}
          onClick={() => setPreview(null)}>
          <div style={{ maxWidth:680, width:'100%', background:'var(--bg-secondary)', borderRadius:'var(--radius-lg)', overflow:'hidden', border:'1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}>
            <img src={preview.preview} alt={preview.name} style={{ width:'100%', height:380, objectFit:'cover' }} />
            <div style={{ padding:24 }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', marginBottom:6 }}>{preview.name}</h3>
              <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem', marginBottom:4 }}>{preview.size} · {preview.beds}</p>
              <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginBottom:18 }}>{preview.amenities.join(' · ')}</p>
              <div style={{ display:'flex', gap:12 }}>
                <button className="btn-primary" style={{ flex:1, padding:'12px' }}
                  onClick={() => { setSelected(preview); setPreview(null); }}>
                  Select This Room — ₹{preview.price.toLocaleString()}/night
                </button>
                <button className="btn-ghost" style={{ padding:'12px 20px' }} onClick={() => setPreview(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky booking bar */}
      {selected && !booked && (
        <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', background:'var(--bg-secondary)', border:'1px solid rgba(227,24,55,0.35)', borderRadius:'var(--radius-lg)', padding:'16px 28px', display:'flex', alignItems:'center', gap:24, zIndex:100, boxShadow:'0 20px 60px rgba(0,0,0,0.6)', flexWrap:'wrap', justifyContent:'center' }}>
          <div>
            <div style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>Selected room</div>
            <div style={{ fontWeight:700, fontSize:'0.95rem' }}>{selected.name} · <span style={{ color:'var(--red)' }}>₹{selected.price.toLocaleString()}/night</span></div>
          </div>
          <button className="btn-primary" style={{ padding:'12px 28px', fontSize:'0.95rem' }}
            onClick={() => { setSaved(selected); setBooked(true); }}>
            Book Now →
          </button>
        </div>
      )}

      {/* Success */}
      {booked && (
        <div className="glass fade-in" style={{ borderRadius:'var(--radius-md)', padding:32, textAlign:'center', border:'1px solid rgba(0,200,83,0.3)', marginTop:20 }}>
          <div style={{ fontSize:'3rem', marginBottom:12 }}>✅</div>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', color:'#00C853', marginBottom:8 }}>Room Booked!</h3>
          <p style={{ color:'var(--text-secondary)' }}>{selected.name} at {hotel.name} · ₹{selected.price.toLocaleString()}/night</p>
          <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginTop:6 }}>✓ Preferences saved for future bookings</p>
        </div>
      )}
    </div>
  );
}
