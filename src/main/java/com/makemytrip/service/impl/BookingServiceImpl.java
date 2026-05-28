package com.makemytrip.service.impl;
import com.makemytrip.enums.BookingStatus;
import com.makemytrip.enums.PaymentStatus;
import com.makemytrip.model.dto.BookingRequest;
import com.makemytrip.model.dto.BookingResponse;
import com.makemytrip.model.entity.*;
import com.makemytrip.repository.*;
import com.makemytrip.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {
    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest req) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String email = (auth.getPrincipal() instanceof com.makemytrip.security.UserPrincipal up)
            ? userRepository.findById(up.getId()).map(u -> u.getEmail()).orElse(auth.getName())
            : auth.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Flight flight = flightRepository.findById(req.getFlightId())
            .orElseThrow(() -> new RuntimeException("Flight not found"));
        BigDecimal total = BigDecimal.valueOf(5000);
        if (req.getSeatId() != null) {
            Seat seat = seatRepository.findById(req.getSeatId()).orElse(null);
            if (seat != null && !seat.isAvailable())
                throw new RuntimeException("Seat not available");
            if (seat != null) {
                seat.setAvailable(false);
                seatRepository.save(seat);
                if (seat.getSurcharge() != null) total = total.add(seat.getSurcharge());
            }
        }
        Booking booking = Booking.builder()
            .user(user).flight(flight)
            .status(BookingStatus.CONFIRMED)
            .seatClass(req.getSeatClass())
            .totalAmount(total)
            .createdAt(Instant.now()).updatedAt(Instant.now())
            .build();
        bookingRepository.save(booking);
        Payment payment = Payment.builder()
            .booking(booking).amount(total)
            .paymentStatus(PaymentStatus.SUCCESS)
            .createdAt(Instant.now()).updatedAt(Instant.now())
            .build();
        paymentRepository.save(payment);
        return BookingResponse.builder()
            .bookingId(booking.getId())
            .status(BookingStatus.CONFIRMED)
            .totalAmount(total)
            .message("Booking confirmed! ID: " + booking.getId())
            .build();
    }
}
