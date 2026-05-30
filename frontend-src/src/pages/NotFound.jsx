import React from 'react';
import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'2rem' }}>
      <div style={{ fontFamily:'var(--font-display)', fontSize:'8rem', fontWeight:900, color:'var(--red)', lineHeight:1 }}>404</div>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', margin:'1rem 0 0.5rem' }}>Page Not Found</h2>
      <p style={{ color:'var(--text-secondary)', marginBottom:'2rem' }}>This route doesn't exist. Let's get you back on track.</p>
      <Link to="/" style={{ background:'var(--red)', color:'white', padding:'12px 28px', borderRadius:8, fontWeight:700, textDecoration:'none' }}>← Back to Home</Link>
    </div>
  );
}
