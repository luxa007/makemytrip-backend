import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home            from './pages/Home';
import Login           from './pages/Login';
import Register        from './pages/Register';
import FlightStatus    from './pages/FlightStatus';
import DynamicPricing  from './pages/DynamicPricing';
import SeatSelection   from './pages/SeatSelection';
import Reviews         from './pages/Reviews';
import Recommendations from './pages/Recommendations';
import Cancellation    from './pages/Cancellation';
import BookFlight      from './pages/BookFlight';
import Profile         from './pages/Profile';
import HotelRooms      from './pages/HotelRooms';
import { ToastProvider } from './components/Toast';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <Navbar />
        <div style={{ paddingTop: 68 }}>
          <Routes>
            <Route path="/"                element={<Home />} />
            <Route path="/login"           element={<Login />} />
            <Route path="/register"        element={<Register />} />
            <Route path="/flight-status"   element={<ProtectedRoute><FlightStatus /></ProtectedRoute>} />
            <Route path="/pricing"         element={<ProtectedRoute><DynamicPricing /></ProtectedRoute>} />
            <Route path="/seats"           element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
            <Route path="/hotels"          element={<ProtectedRoute><HotelRooms /></ProtectedRoute>} />
            <Route path="/reviews"         element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
            <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
            <Route path="/cancellation"    element={<ProtectedRoute><Cancellation /></ProtectedRoute>} />
            <Route path="/book"            element={<ProtectedRoute><BookFlight /></ProtectedRoute>} />
            <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*"               element={<NotFound />} />
          </Routes>
        </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
