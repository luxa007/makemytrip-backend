import React, { useState, useEffect } from 'react';
import { reviews as reviewsApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const MOCK_REVIEWS = [
  { id: 1, authorName: 'Priya Sharma', rating: 5, comment: 'Absolutely wonderful experience! The crew was attentive and the seats were comfortable. Departed and arrived exactly on time. Highly recommend this flight to anyone traveling between Delhi and Mumbai.', createdAt: '2026-05-20T09:30:00Z', helpful: 24, status: 'APPROVED', replies: [{ id: 11, authorName: 'Support Team', comment: 'Thank you for your kind review, Priya! We look forward to serving you again.', createdAt: '2026-05-21T10:00:00Z' }] },
  { id: 2, authorName: 'Rahul Verma', rating: 2, comment: 'Flight was delayed by 2 hours with no proper communication. The food options were limited and the staff seemed overwhelmed. Expected better from a flagship route.', createdAt: '2026-05-18T14:15:00Z', helpful: 31, status: 'APPROVED', replies: [] },
  { id: 3, authorName: 'Anjali Patel', rating: 4, comment: 'Good overall experience. Boarding was smooth, in-flight entertainment had a decent selection. The only downside was the legroom in economy — a bit tight for a long flight.', createdAt: '2026-05-15T11:00:00Z', helpful: 18, status: 'APPROVED', replies: [] },
  { id: 4, authorName: 'Suresh Kumar', rating: 5, comment: 'Best domestic flight experience I have had in years. Modern aircraft, clean cabin, friendly staff. The new seat-back screens are a great addition. Will definitely fly this route again.', createdAt: '2026-05-10T08:45:00Z', helpful: 42, status: 'APPROVED', replies: [] },
  { id: 5, authorName: 'Meera Iyer', rating: 3, comment: 'Average experience. Nothing went seriously wrong but nothing was exceptional either. Standard food, standard service. The check-in queue was longer than expected.', createdAt: '2026-05-08T16:30:00Z', helpful: 9, status: 'APPROVED', replies: [] },
];

function StarRating({ value, onChange, size = 20 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          style={{
            fontSize: size, cursor: onChange ? 'pointer' : 'default',
            color: i <= (hover || value) ? '#F5A623' : 'rgba(255,255,255,0.15)',
            transition: 'color 0.15s', lineHeight: 1,
          }}
        >★</span>
      ))}
    </div>
  );
}

function ReviewCard({ review, onHelpful, onFlag, onReply }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [localHelpful, setLocalHelpful] = useState(review.helpful);
  const [flagged, setFlagged] = useState(false);
  const [voted, setVoted] = useState(false);

  const handleHelpful = () => { if (voted) return; setLocalHelpful(h => h+1); setVoted(true); onHelpful(review.id); };
  const handleFlag    = () => { setFlagged(true); onFlag(review.id); };

  const timeAgo = (iso) => {
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  return (
    <div className="glass" style={{ borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: `hsl(${review.id * 47 % 360},60%,35%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.9rem',
          }}>
            {review.authorName[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: 3 }}>{review.authorName}</div>
            <StarRating value={review.rating} size={14} />
          </div>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{timeAgo(review.createdAt)}</div>
      </div>

      {/* Comment */}
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 16 }}>
        {review.comment}
      </p>

      {/* Photo */}
      {review.photoUrl && (
        <img src={review.photoUrl} alt="review photo"
          style={{ maxWidth: 220, maxHeight: 160, borderRadius: 8, marginBottom: 14,
            objectFit: 'cover', border: '1px solid var(--border)' }} />
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={handleHelpful}
          style={{
            padding: '6px 14px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 500,
            background: voted ? 'rgba(0,200,83,0.12)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${voted ? 'rgba(0,200,83,0.3)' : 'var(--border)'}`,
            color: voted ? '#00C853' : 'var(--text-secondary)',
            cursor: voted ? 'default' : 'pointer', transition: 'all 0.2s',
          }}
        >
          👍 Helpful ({localHelpful})
        </button>
        <button
          onClick={() => setShowReply(r => !r)}
          style={{ padding: '6px 14px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 500, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          ↩ Reply
        </button>
        {!flagged && (
          <button
            onClick={handleFlag}
            style={{ padding: '6px 14px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 500, background: 'transparent', border: '1px solid transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            ⚑ Flag
          </button>
        )}
        {flagged && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Flagged for review</span>}
      </div>

      {/* Reply box */}
      {showReply && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <textarea
            className="input-field"
            rows={3}
            placeholder="Write a reply…"
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            style={{ width: '100%', resize: 'vertical', minHeight: 80 }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.82rem' }}
              onClick={() => { onReply(review.id, replyText); setReplyText(''); setShowReply(false); }}>
              Post reply
            </button>
            <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: '0.82rem' }} onClick={() => setShowReply(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Replies */}
      {review.replies?.length > 0 && (
        <div style={{ marginTop: 16, paddingLeft: 16, borderLeft: '2px solid var(--border)' }}>
          {review.replies.map(r => (
            <div key={r.id} style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                  {r.authorName[0]}
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{r.authorName}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{timeAgo(r.createdAt)}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginLeft: 34 }}>{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Reviews() {
  const { user }     = useAuth();
  const { addToast } = useToast();
  const [flightId, setFlightId]   = useState(1);
  const [reviewList, setReviewList] = useState(MOCK_REVIEWS);
  const [sort, setSort]           = useState('helpful');
  const [filterRating, setFilterRating] = useState(0);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ rating: 0, comment: '', photoUrl: '' });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    setForm(f => ({ ...f, photoUrl: url }));
  };

  const FLIGHTS = [
    { id: 1, label: 'AI101 · Delhi → Mumbai' },
    { id: 2, label: 'AI202 · Mumbai → Bangalore' },
    { id: 3, label: '6E501 · Bangalore → Hyderabad' },
  ];

  useEffect(() => {
    reviewsApi.getForFlight(flightId).then(({ data }) => {
      if (data?.length) setReviewList(data);
    }).catch(() => setReviewList(MOCK_REVIEWS));
  }, [flightId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) { setSubmitMsg('Please select a star rating'); return; }
    if (form.comment.length < 20) { setSubmitMsg('Review must be at least 20 characters'); return; }
    setSubmitting(true); setSubmitMsg('');
    try {
      await reviewsApi.create({ ...form, flightId });
    } catch {}
    const newReview = {
      id: Date.now(), authorName: user.name, rating: form.rating, comment: form.comment,
      createdAt: new Date().toISOString(), helpful: 0, status: 'APPROVED', replies: [],
    };
    setReviewList(prev => [newReview, ...prev]);
    setForm({ rating: 0, comment: '' });
    setShowForm(false);
    setSubmitMsg('');
    setSubmitting(false);
    addToast('Review submitted successfully!', 'success');
  };

  const sorted = [...reviewList]
    .filter(r => filterRating === 0 || r.rating === filterRating)
    .sort((a, b) => sort === 'helpful' ? b.helpful - a.helpful : sort === 'newest' ? new Date(b.createdAt) - new Date(a.createdAt) : b.rating - a.rating);

  const avgRating = reviewList.reduce((s, r) => s + r.rating, 0) / (reviewList.length || 1);
  const ratingDist = [5,4,3,2,1].map(r => ({ r, count: reviewList.filter(rv => rv.rating === r).length }));

  return (
    <div className="page-container">
      <div className="fade-in" style={{ marginBottom: 32 }}>
        <h1 className="page-title">Reviews & Ratings</h1>
        <p className="page-subtitle">Community-powered travel intelligence · Rate, reply, and flag</p>
      </div>

      {/* Controls */}
      <div className="fade-in-1 glass" style={{ borderRadius: 'var(--radius-md)', padding: '18px 24px', marginBottom: 24, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 14, flex: 1, minWidth: 200, flexWrap: 'wrap' }}>
          <div className="input-group" style={{ flex: 1, minWidth: 180 }}>
            <label>Flight</label>
            <select className="input-field" value={flightId} onChange={e => setFlightId(Number(e.target.value))}>
              {FLIGHTS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </div>
          <div className="input-group" style={{ minWidth: 140 }}>
            <label>Sort by</label>
            <select className="input-field" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="helpful">Most helpful</option>
              <option value="newest">Newest</option>
              <option value="highest">Highest rated</option>
            </select>
          </div>
          <div className="input-group" style={{ minWidth: 130 }}>
            <label>Filter rating</label>
            <select className="input-field" value={filterRating} onChange={e => setFilterRating(Number(e.target.value))}>
              <option value={0}>All ratings</option>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} stars</option>)}
            </select>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)} style={{ padding: '11px 20px', fontSize: '0.85rem' }}>
          {showForm ? '✕ Cancel' : '+ Write review'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }} className="reviews-grid">
        <div>
          {/* Write review form */}
          {showForm && (
            <div className="glass" style={{ borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 20, border: '1px solid rgba(227,24,55,0.2)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 18 }}>Write your review</h3>
              {submitMsg && <div className="error-msg" style={{ marginBottom: 14 }}>{submitMsg}</div>}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Your rating</div>
                  <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} size={28} />
                </div>
                <div className="input-group">
                  <label>Your review</label>
                  <textarea
                    className="input-field"
                    rows={4}
                    placeholder="Share your experience in at least 20 characters…"
                    value={form.comment}
                    onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                    required style={{ resize: 'vertical', minHeight: 100 }}
                  />
                </div>
                <div className="input-group">
                  <label>Photo (optional)</label>
                  <input
                    type="file" accept="image/*"
                    onChange={handlePhoto}
                    style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', width: '100%',
                      background: 'var(--bg-card)', border: '1px dashed var(--border)',
                      borderRadius: 'var(--radius-sm)', padding: '10px 14px', cursor: 'pointer' }}
                  />
                  {photoPreview && (
                    <div style={{ marginTop: 10, position: 'relative', display: 'inline-block' }}>
                      <img src={photoPreview} alt="preview"
                        style={{ maxWidth: 180, maxHeight: 130, borderRadius: 8,
                          border: '2px solid var(--border-accent)', objectFit: 'cover' }} />
                      <button type="button"
                        onClick={() => { setPhotoPreview(null); setForm(f => ({ ...f, photoUrl: '' })); }}
                        style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22,
                          borderRadius: '50%', background: 'var(--red)', color: 'white',
                          fontSize: '0.7rem', fontWeight: 700, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
                    </div>
                  )}
                </div>
                <button className="btn-primary" type="submit" disabled={submitting} style={{ padding: '12px', alignSelf: 'flex-start', minWidth: 140 }}>
                  {submitting ? 'Submitting…' : 'Submit review'}
                </button>
              </form>
            </div>
          )}

          {sorted.map(r => (
            <ReviewCard
              key={r.id} review={r}
              onHelpful={id => reviewsApi.helpful(id).catch(() => {})}
              onFlag={id => reviewsApi.flag(id).catch(() => {})}
              onReply={(id, text) => {
                reviewsApi.reply(id, { comment: text }).catch(() => {});
                setReviewList(prev => prev.map(rv => rv.id === id
                  ? { ...rv, replies: [...(rv.replies||[]), { id: Date.now(), authorName: user.name, comment: text, createdAt: new Date().toISOString() }] }
                  : rv
                ));
              }}
            />
          ))}
        </div>

        {/* Summary sidebar */}
        <div>
          <div className="fade-in-3 glass" style={{ borderRadius: 'var(--radius-md)', padding: 22, position: 'sticky', top: 88 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.2rem', fontWeight: 900, color: '#F5A623', lineHeight: 1 }}>{avgRating.toFixed(1)}</div>
              <StarRating value={Math.round(avgRating)} size={16} />
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 6 }}>{reviewList.length} reviews</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ratingDist.map(({ r, count }) => (
                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', width: 10, textAlign: 'right' }}>{r}</span>
                  <span style={{ color: '#F5A623', fontSize: '0.7rem' }}>★</span>
                  <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      background: r >= 4 ? '#00C853' : r === 3 ? '#F5A623' : 'var(--red)',
                      width: `${(count / reviewList.length) * 100}%`,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: 16, textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) { .reviews-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
