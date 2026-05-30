// Drop-in replacement for utils/api.js
// Tries real backend first, falls back to rich mock data

import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const API = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 3000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('mmt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mmt_token');
      localStorage.removeItem('mmt_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Mock data ────────────────────────────────────────────
const MOCK = {
  flights: [
    { id:1, flightNumber:'AI101', origin:'DEL', destination:'BOM', departureTime:'06:30', arrivalTime:'08:45', status:'ON_TIME',   delay:null,      gate:'A12', aircraft:'A320' },
    { id:2, flightNumber:'AI202', origin:'BOM', destination:'BLR', departureTime:'09:15', arrivalTime:'11:00', status:'DELAYED',   delay:'45 min',  gate:'B07', aircraft:'B737' },
    { id:3, flightNumber:'6E501', origin:'BLR', destination:'HYD', departureTime:'11:30', arrivalTime:'12:40', status:'BOARDING',  delay:null,      gate:'C03', aircraft:'A320neo' },
    { id:4, flightNumber:'SG304', origin:'DEL', destination:'CCU', departureTime:'14:00', arrivalTime:'16:15', status:'SCHEDULED', delay:null,      gate:'D11', aircraft:'B737' },
  ],
  bookings: [
    { id:1, flightNumber:'AI101', route:'DEL → BOM', departureDate:'2026-08-15', seatClass:'ECONOMY',  totalAmount:4800,  status:'CONFIRMED', bookedOn:'2026-05-20' },
    { id:2, flightNumber:'AI202', route:'BOM → BLR', departureDate:'2026-09-22', seatClass:'BUSINESS', totalAmount:12480, status:'CONFIRMED', bookedOn:'2026-05-22' },
    { id:3, flightNumber:'6E501', route:'BLR → HYD', departureDate:'2026-05-10', seatClass:'ECONOMY',  totalAmount:2600,  status:'CANCELLED', bookedOn:'2026-05-01', refundStatus:'COMPLETED', refundAmount:1950 },
  ],
  reviews: [
    { id:1, authorName:'Priya Sharma', rating:5, comment:'Absolutely wonderful experience! Crew was attentive, seats comfortable. Departed and arrived exactly on time.', createdAt:'2026-05-20T09:30:00Z', helpful:24, status:'APPROVED', replies:[{ id:11, authorName:'Support Team', comment:'Thank you Priya! We look forward to serving you again.', createdAt:'2026-05-21T10:00:00Z' }] },
    { id:2, authorName:'Rahul Verma',  rating:2, comment:'Flight delayed by 2 hours with no communication. Food options were limited. Expected better from a flagship route.', createdAt:'2026-05-18T14:15:00Z', helpful:31, status:'APPROVED', replies:[] },
    { id:3, authorName:'Anjali Patel', rating:4, comment:'Good overall experience. Boarding was smooth, in-flight entertainment decent. Legroom a bit tight in economy.', createdAt:'2026-05-15T11:00:00Z', helpful:18, status:'APPROVED', replies:[] },
    { id:4, authorName:'Suresh Kumar', rating:5, comment:'Best domestic flight in years. Modern aircraft, clean cabin, friendly staff. New seat-back screens are great.', createdAt:'2026-05-10T08:45:00Z', helpful:42, status:'APPROVED', replies:[] },
  ],
  recommendations: [
    { id:1, type:'FLIGHT', title:'Delhi → Goa',          subtitle:'Air India · 2h 35m',       price:4200,  reason:'You booked a beach destination last month',               tag:'Beach lover',     score:0.94, image:'🏖' },
    { id:2, type:'FLIGHT', title:'Mumbai → Manali',      subtitle:'IndiGo · 1h 45m',          price:3800,  reason:'Trending among users with your travel profile',           tag:'Trending',       score:0.88, image:'🏔' },
    { id:3, type:'HOTEL',  title:'Taj Exotica, Goa',     subtitle:'5★ · Beachfront resort',   price:12000, reason:'Matches your preferred hotel tier and location',          tag:'Luxury',         score:0.91, image:'🏨' },
    { id:4, type:'DEST',   title:'Bali, Indonesia',      subtitle:'International · 5h 30m',   price:18500, reason:'You liked beaches! 73% of users like you visited Bali',  tag:'You may love',   score:0.85, image:'🌴' },
    { id:5, type:'FLIGHT', title:'Delhi → Kochi',        subtitle:'Vistara · 3h 10m',         price:5100,  reason:'Frequently booked after visiting Goa in your segment',   tag:'Commonly paired',score:0.79, image:'⛵' },
    { id:6, type:'HOTEL',  title:'The Leela Palace, Delhi', subtitle:'5★ · City center',      price:15000, reason:'Based on your business-class preference pattern',        tag:'Business traveler',score:0.76, image:'🏛' },
  ],
};

// ── Helper ───────────────────────────────────────────────
const mockOk = (data, delay = 300) =>
  new Promise(res => setTimeout(() => res({ data }), delay));

// ── Auth ─────────────────────────────────────────────────
export const auth = {
  login:    (data) => API.post('/api/auth/login', data),
  register: (data) => API.post('/api/auth/register', data),
  me:       ()     => API.get('/api/auth/me'),
};

// ── Flights ──────────────────────────────────────────────
export const flights = {
  getAll:    ()       => API.get('/api/v1/flights').catch(() => mockOk(MOCK.flights)),
  getById:   (id)     => API.get(`/api/v1/flights/${id}`).catch(() => mockOk(MOCK.flights.find(f=>f.id===id)||MOCK.flights[0])),
  getStatus: (id)     => API.get(`/api/v1/flights/${id}/status`).catch(() => mockOk(MOCK.flights.find(f=>f.id===id)||MOCK.flights[0])),
  getSeatMap:(id)     => API.get(`/api/v1/flights/${id}/seats`).catch(() => mockOk({ seats: [] })),
  selectSeat:(id,data)=> API.post(`/api/v1/flights/${id}/seats/select`,data).catch(() => mockOk({ success:true, seatNumber: data.seatNumber })),
  getPricing:(id)     => API.get(`/api/v1/flights/${id}/pricing`).catch(() => {
    const base = [4800,3200,2600,5100][id-1] || 4000;
    const surge = +(1 + (Math.random()*0.4 - 0.1)).toFixed(2);
    return mockOk({ flightId:id, basePrice:base, currentPrice:Math.round(base*surge), surgeMultiplier:surge, demandLevel:['LOW','MEDIUM','HIGH','PEAK'][Math.floor(Math.random()*4)], availableSeats:Math.floor(Math.random()*40)+5, recommendBuy: surge < 1.15 });
  }),
  freezePrice:(id,data)=> API.post(`/api/v1/flights/${id}/pricing/freeze`,data).catch(() => {
    const base = [4800,3200,2600,5100][id-1] || 4000;
    return mockOk({ frozenPrice: Math.round(base*(1+Math.random()*0.2)), expiresAt: new Date(Date.now()+30*60000).toISOString() });
  }),
};

// ── Bookings ─────────────────────────────────────────────
export const bookings = {
  create:    (data)    => API.post('/api/v1/bookings',data).catch(() => mockOk({ bookingId:Date.now(), status:'CONFIRMED', totalAmount: data.amount||4800, message:'Booking confirmed!' })),
  getAll:    ()        => API.get('/api/v1/bookings').catch(() => mockOk(MOCK.bookings)),
  getById:   (id)      => API.get(`/api/v1/bookings/${id}`).catch(() => mockOk(MOCK.bookings.find(b=>b.id===id)||MOCK.bookings[0])),
  cancel:    (id,data) => API.post(`/api/v1/bookings/${id}/cancel`,data).catch(() => mockOk({ success:true, bookingId:id, reason:data.reason })),
  getRefund: (id)      => API.get(`/api/v1/bookings/${id}/refund`).catch(() => mockOk({ bookingId:id, refundStatus:'PENDING', refundAmount:2400 })),
};

// ── Reviews ──────────────────────────────────────────────
export const reviews = {
  getForFlight:(flightId) => API.get(`/api/v1/reviews/flight/${flightId}`).catch(() => mockOk(MOCK.reviews)),
  create:      (data)     => API.post('/api/v1/reviews',data).catch(() => mockOk({ id:Date.now(), ...data, status:'APPROVED', helpful:0, replies:[] })),
  reply:       (id,data)  => API.post(`/api/v1/reviews/${id}/reply`,data).catch(() => mockOk({ id:Date.now(), ...data })),
  flag:        (id)       => API.post(`/api/v1/reviews/${id}/flag`).catch(() => mockOk({ success:true })),
  helpful:     (id)       => API.post(`/api/v1/reviews/${id}/helpful`).catch(() => mockOk({ success:true })),
};

// ── Recommendations ──────────────────────────────────────
export const recommendations = {
  get:      ()        => API.get('/api/v1/recommendations').catch(() => mockOk(MOCK.recommendations)),
  feedback: (id,data) => API.post(`/api/v1/recommendations/${id}/feedback`,data).catch(() => mockOk({ success:true })),
};

export const WS_URL = BASE_URL.replace(/^http/,'ws');
export default API;
