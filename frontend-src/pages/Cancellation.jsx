import React, { useState, useEffect } from 'react';
import { bookings as bookingsApi } from '../utils/api';

const CANCEL_REASONS = [
  { key: 'CHANGE_OF_PLANS',    label: 'Change of plans' },
  { key: 'MEDICAL_EMERGENCY',  label: 'Medical emergency' },
  { key: 'SCHEDULE_CONFLICT',  label: 'Schedule conflict' },
  { key: 'PRICE_ISSUE',        label: 'Found a better price' },
  { key: 'DUPLICATE_BOOKING',  label: 'Duplicate booking' },
  { key: 'OTHER',              label: 'Other reason' },
];

const REFUND_POLICY = [
  { condition: '> 7 days before departure',  refund: '100%', color: '#00C853' },
  { condition: '24h – 7 days before',         refund: '75%',  color: '#00C853' },
  { condition: 'Within 24h of booking',       refund: '50%',  color: '#F5A623' },
  { condition: '< 2h before departure',       refund: '0%',   color: 'var(--red)' },
];

const STATUS_META = {
  PENDING:   { label: 'Pending',   color: '#F5A623', bg: 'rgba(245,166,35,0.12)',  icon: '◌' },
  PROCESSED: { label: 'Processed', color: '#1A73E8', bg: 'rgba(26,115,232,0.12)',  icon: '◈' },
  COMPLETED: { label: 'Completed', color: '#00C853', bg: 'rgba(0,200,83,0.12)',    icon: '✓' },
  FAILED:    { label: 'Failed',    color: 'var(--red)', bg: 'rgba(227,24,55,0.12)',icon: '✕' },
};

const MOCK_BOOKINGS = [
  { id: 1, flightNumber: 'AI101', route: 'DEL → BOM', departureDate: '2026-06-15', seatClass: 'ECONOMY', totalAmount: 4800, status: 'CONFIRMED', bookedOn: '2026-05-20' },
  { id: 2, flightNumber: 'AI202', route: 'BOM → BLR', departureDate: '2026-06-22', seatClass: 'BUSINESS', totalAmount: 12480, status: 'CONFIRMED', bookedOn: '2026-05-22' },
  { id: 3, flightNumber: '6E501', route: 'BLR → HYD', departureDate: '2026-05-10', seatClass: 'ECONOMY', totalAmount: 2600, status: 'CANCELLED', bookedOn: '2026-05-01', refundStatus: 'COMPLETED', refundAmount: 1950 },
];

function RefundTimeline({ status }) {
  const steps = ['PENDING', 'PROCESSED', 'COMPLETED'];
  const idx   = steps.indexOf(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 16 }}>
      {steps.map((step, i) => {
        const done    = i <= idx;
        const current = i === idx;
        const meta    = STATUS_META[step];
        return (
          <React.Fragment key={step}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: done ? meta.bg : 'rgba(255,255,255,0.04)',
                border: `2px solid ${done ? meta.color : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', color: done ? meta.color : 'var(--text-muted)',
                animation: current ? 'pulse-dot 1.5s infinite' : 'none',
                boxShadow: current ? `0 0 12px ${meta.color}40` : 'none',
              }}>
                {done ? meta.icon : '○'}
              </div>
              <div style={{ fontSize: '0.65rem', color: done ? meta.color : 'var(--text-muted)', fontWeight: done ? 600 : 400, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                {meta.label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < idx ? '#00C853' : 'var(--border)', margin: '0 4px', marginBottom: 20, transition: 'background 0.5s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function BookingCard({ booking, onCancelClick }) {
  const cancelled = booking.status === 'CANCELLED';
  const refMeta   = booking.refundStatus ? STATUS_META[booking.refundStatus] : null;

  const daysUntil = Math.ceil((new Date(booking.departureDate) - Date.now()) / 86400000);

  const calcRefundPct = () => {
    const daysSinceBooked = Math.ceil((Date.now() - new Date(booking.bookedOn)) / 86400000);
    if (daysUntil > 7)   return 100;
    if (daysUntil > 1)   return 75;
    if (daysSinceBooked <= 1) return 50;
    return 0;
  };
  const refundPct = calcRefundPct();

  return (
    <div className="glass" style={{ borderRadius: 'var(--radius-md)', padding: 24, opacity: cancelled ? 0.75 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.05rem' }}>{booking.flightNumber}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{booking.route}</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            {new Date(booking.departureDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · {booking.seatClass}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.2rem' }}>₹{booking.totalAmount.toLocaleString('en-IN')}</div>
          <span style={{
            display: 'inline-block', marginTop: 4, padding: '3px 9px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
            background: cancelled ? 'rgba(136,146,164,0.12)' : 'rgba(0,200,83,0.12)',
            border: `1px solid ${cancelled ? 'rgba(136,146,164,0.3)' : 'rgba(0,200,83,0.3)'}`,
            color: cancelled ? 'var(--text-secondary)' : '#00C853',
          }}>
            {booking.status}
          </span>
        </div>
      </div>

      {!cancelled && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {daysUntil > 0
              ? <>Departure in <strong style={{ color: daysUntil <= 2 ? 'var(--red)' : '#F5A623' }}>{daysUntil} days</strong> · Estimated refund if cancelled: <strong style={{ color: refundPct > 50 ? '#00C853' : refundPct > 0 ? '#F5A623' : 'var(--red)' }}>₹{Math.round(booking.totalAmount * refundPct / 100).toLocaleString('en-IN')} ({refundPct}%)</strong></>
              : <span style={{ color: 'var(--text-muted)' }}>Departure date passed</span>
            }
          </div>
          {daysUntil > 0 && (
            <button
              onClick={() => onCancelClick(booking)}
              style={{
                padding: '8px 18px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                background: 'rgba(227,24,55,0.1)', border: '1px solid rgba(227,24,55,0.3)',
                color: 'var(--red)', transition: 'all 0.2s',
              }}
            >
              Cancel booking
            </button>
          )}
        </div>
      )}

      {/* Refund tracker */}
      {cancelled && booking.refundStatus && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Refund Status</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#00C853', fontSize: '0.95rem' }}>
              ₹{booking.refundAmount?.toLocaleString('en-IN')}
            </span>
          </div>
          <RefundTimeline status={booking.refundStatus} />
          <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {booking.refundStatus === 'COMPLETED'
              ? 'Refund has been credited to your original payment method.'
              : 'Refunds are processed within 5–7 business days.'}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Cancellation() {
  const [bookingList, setBookingList]   = useState(MOCK_BOOKINGS);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reason, setReason]             = useState('');
  const [step, setStep]                 = useState('list');   // list | confirm | success
  const [processing, setProcessing]     = useState(false);
  const [cancelledData, setCancelledData] = useState(null);

  useEffect(() => {
    bookingsApi.getAll().then(({ data }) => {
      if (data?.length) setBookingList(data);
    }).catch(() => {});
  }, []);

  const openCancel = (booking) => { setSelectedBooking(booking); setReason(''); setStep('confirm'); };

  const handleConfirmCancel = async () => {
    if (!reason) return;
    setProcessing(true);
    try {
      await bookingsApi.cancel(selectedBooking.id, { reason });
    } catch {}

    const daysUntil = Math.ceil((new Date(selectedBooking.departureDate) - Date.now()) / 86400000);
    const refundPct = daysUntil > 7 ? 100 : daysUntil > 1 ? 75 : 50;
    const refundAmount = Math.round(selectedBooking.totalAmount * refundPct / 100);
    const newData = { ...selectedBooking, status: 'CANCELLED', refundStatus: 'PENDING', refundAmount };

    setBookingList(prev => prev.map(b => b.id === selectedBooking.id ? newData : b));
    setCancelledData({ ...newData, refundPct });
    setStep('success');
    setProcessing(false);
  };

  const daysUntilSelected = selectedBooking ? Math.ceil((new Date(selectedBooking.departureDate) - Date.now()) / 86400000) : 0;
  const refundPctSelected  = daysUntilSelected > 7 ? 100 : daysUntilSelected > 1 ? 75 : 50;
  const refundAmountSelected = selectedBooking ? Math.round(selectedBooking.totalAmount * refundPctSelected / 100) : 0;

  const activeBookings    = bookingList.filter(b => b.status === 'CONFIRMED');
  const cancelledBookings = bookingList.filter(b => b.status === 'CANCELLED');

  return (
    <div className="page-container">
      <div className="fade-in" style={{ marginBottom: 32 }}>
        <h1 className="page-title">My Bookings</h1>
        <p className="page-subtitle">Manage cancellations · Transparent refund policies · Real-time refund tracker</p>
      </div>

      {/* Refund policy banner */}
      <div className="fade-in-1 glass" style={{ borderRadius: 'var(--radius-md)', padding: '20px 24px', marginBottom: 28 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 14 }}>
          Refund policy
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {REFUND_POLICY.map(({ condition, refund, color }) => (
            <div key={condition} style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.3rem', color, lineHeight: 1, marginBottom: 6 }}>{refund}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{condition}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content or modal */}
      {step === 'list' && (
        <div className="fade-in-2" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeBookings.length > 0 && (
            <>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                Active bookings ({activeBookings.length})
              </div>
              {activeBookings.map(b => <BookingCard key={b.id} booking={b} onCancelClick={openCancel} />)}
            </>
          )}

          {cancelledBookings.length > 0 && (
            <>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 12, marginBottom: 4 }}>
                Cancelled ({cancelledBookings.length})
              </div>
              {cancelledBookings.map(b => <BookingCard key={b.id} booking={b} onCancelClick={openCancel} />)}
            </>
          )}

          {bookingList.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 14 }}>⊗</div>
              <div style={{ fontSize: '0.95rem' }}>No bookings found</div>
              <div style={{ fontSize: '0.82rem', marginTop: 6 }}>Your confirmed bookings will appear here</div>
            </div>
          )}
        </div>
      )}

      {/* Confirm cancellation modal */}
      {step === 'confirm' && selectedBooking && (
        <div className="fade-in" style={{ maxWidth: 520, margin: '0 auto' }}>
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: 32, border: '1px solid rgba(227,24,55,0.2)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>
              Cancel this booking?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 24 }}>
              This action cannot be undone. Your refund will be calculated based on our cancellation policy.
            </p>

            {/* Booking summary */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{selectedBooking.flightNumber}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{selectedBooking.route}</span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 16 }}>
                {new Date(selectedBooking.departureDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: 4 }}>Paid</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>₹{selectedBooking.totalAmount.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ width: 1, background: 'var(--border)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: 4 }}>Refund ({refundPctSelected}%)</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: refundPctSelected > 50 ? '#00C853' : '#F5A623' }}>
                    ₹{refundAmountSelected.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ width: 1, background: 'var(--border)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: 4 }}>Days left</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: daysUntilSelected <= 2 ? 'var(--red)' : 'var(--text-primary)' }}>
                    {daysUntilSelected}
                  </div>
                </div>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 22 }}>
              <label>Reason for cancellation *</label>
              <select className="input-field" value={reason} onChange={e => setReason(e.target.value)} required>
                <option value="">Select a reason…</option>
                {CANCEL_REASONS.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-primary"
                onClick={handleConfirmCancel}
                disabled={!reason || processing}
                style={{ flex: 1, padding: '13px', background: reason ? 'var(--red)' : 'rgba(227,24,55,0.4)', fontSize: '0.88rem' }}
              >
                {processing ? 'Processing…' : 'Confirm cancellation'}
              </button>
              <button className="btn-ghost" onClick={() => setStep('list')} style={{ padding: '13px 20px', fontSize: '0.88rem' }}>
                Keep booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success state */}
      {step === 'success' && cancelledData && (
        <div className="fade-in" style={{ maxWidth: 520, margin: '0 auto' }}>
          <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: 36, textAlign: 'center', border: '1px solid rgba(0,200,83,0.2)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,200,83,0.12)', border: '1px solid rgba(0,200,83,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.8rem', color: '#00C853' }}>
              ✓
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
              Booking cancelled
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 28 }}>
              Your refund of <strong style={{ color: '#00C853' }}>₹{cancelledData.refundAmount?.toLocaleString('en-IN')}</strong> ({cancelledData.refundPct}%) has been initiated.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 20, marginBottom: 24, textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                Refund tracker
              </div>
              <RefundTimeline status="PENDING" />
              <div style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Expected credit: 5–7 business days to your original payment method
              </div>
            </div>

            <button className="btn-primary" onClick={() => setStep('list')} style={{ padding: '12px 32px', fontSize: '0.88rem' }}>
              Back to bookings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
