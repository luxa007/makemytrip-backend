package com.makemytrip.service;
import com.makemytrip.enums.*;
import com.makemytrip.exception.BookingNotFoundException;
import com.makemytrip.model.dto.*;
import com.makemytrip.model.entity.*;
import com.makemytrip.repository.BookingRepository;
import com.makemytrip.service.impl.CancellationServiceImpl;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CancellationServiceImplTest {

    @Mock BookingRepository bookingRepository;
    @Mock NotificationService notificationService;
    @InjectMocks CancellationServiceImpl cancellationService;

    private Booking booking;
    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("test@mmt.com").fullName("Test User").build();
        booking = Booking.builder().id(10L).user(user)
                .status(BookingStatus.CONFIRMED).totalAmount(new BigDecimal("5000")).build();
    }

    @Test
    void cancelBooking_fullRefund_when48hBeforeDeparture() {
        Flight flight = Flight.builder().scheduledDeparture(Instant.now().plusSeconds(72 * 3600)).build();
        booking.setFlight(flight);
        when(bookingRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any())).thenReturn(booking);

        CancellationRequest req = new CancellationRequest(10L, CancellationReason.CHANGE_OF_PLANS, "");
        RefundResponse response = cancellationService.cancelBooking(10L, req, 1L);

        assertThat(response.getRefundAmount()).isEqualByComparingTo(new BigDecimal("5000"));
        assertThat(response.getRefundStatus()).isEqualTo(PaymentStatus.REFUND_PENDING);
    }

    @Test
    void cancelBooking_partialRefund_when24hBeforeDeparture() {
        Flight flight = Flight.builder().scheduledDeparture(Instant.now().plusSeconds(30 * 3600)).build();
        booking.setFlight(flight);
        when(bookingRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any())).thenReturn(booking);

        CancellationRequest req = new CancellationRequest(10L, CancellationReason.MEDICAL_EMERGENCY, "");
        RefundResponse response = cancellationService.cancelBooking(10L, req, 1L);

        assertThat(response.getRefundAmount()).isEqualByComparingTo(new BigDecimal("2500.00"));
    }

    @Test
    void cancelBooking_noRefund_whenLessThan2h() {
        Flight flight = Flight.builder().scheduledDeparture(Instant.now().plusSeconds(3600)).build();
        booking.setFlight(flight);
        when(bookingRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any())).thenReturn(booking);

        CancellationRequest req = new CancellationRequest(10L, CancellationReason.OTHER, "");
        RefundResponse response = cancellationService.cancelBooking(10L, req, 1L);

        assertThat(response.getRefundAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void cancelBooking_throwsException_whenBookingNotFound() {
        when(bookingRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());
        CancellationRequest req = new CancellationRequest(99L, CancellationReason.OTHER, "");
        assertThatThrownBy(() -> cancellationService.cancelBooking(99L, req, 1L))
                .isInstanceOf(BookingNotFoundException.class);
    }

    @Test
    void cancelBooking_throwsException_whenAlreadyCancelled() {
        booking.setStatus(BookingStatus.CANCELLED);
        when(bookingRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(booking));
        CancellationRequest req = new CancellationRequest(10L, CancellationReason.OTHER, "");
        assertThatThrownBy(() -> cancellationService.cancelBooking(10L, req, 1L))
                .isInstanceOf(IllegalStateException.class);
    }
}
