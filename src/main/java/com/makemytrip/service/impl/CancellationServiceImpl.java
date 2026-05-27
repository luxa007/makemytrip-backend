package com.makemytrip.service.impl;
import com.makemytrip.constants.AppConstants;
import com.makemytrip.enums.BookingStatus;
import com.makemytrip.enums.PaymentStatus;
import com.makemytrip.exception.BookingNotFoundException;
import com.makemytrip.model.dto.*;
import com.makemytrip.model.entity.Booking;
import com.makemytrip.repository.BookingRepository;
import com.makemytrip.service.CancellationService;
import com.makemytrip.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;

@Service @RequiredArgsConstructor
public class CancellationServiceImpl implements CancellationService {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    @Override @Transactional
    public RefundResponse cancelBooking(Long bookingId, CancellationRequest request, Long userId) {
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, userId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.REFUNDED)
            throw new IllegalStateException("Booking is already cancelled or refunded");

        Instant departure = booking.getFlight() != null
                ? booking.getFlight().getScheduledDeparture()
                : Instant.now().plusSeconds(72 * 3600);

        long hoursUntilDeparture = Duration.between(Instant.now(), departure).toHours();
        BigDecimal refundAmount = calculateRefund(booking.getTotalAmount(), hoursUntilDeparture);

        booking.setStatus(hoursUntilDeparture < 2 ? BookingStatus.CANCELLED : BookingStatus.REFUNDED);
        booking.setRefundAmount(refundAmount);
        booking.setCancellationReason(request.getCancellationReason());
        booking.setCancellationNote(request.getNote());
        booking.setCancelledAt(Instant.now());
        bookingRepository.save(booking);

        notificationService.sendCancellationConfirmation(booking, refundAmount);

        PaymentStatus refundStatus = refundAmount.compareTo(BigDecimal.ZERO) > 0
                ? PaymentStatus.REFUND_PENDING : PaymentStatus.SUCCESS;

        return RefundResponse.builder()
                .bookingId(bookingId)
                .refundAmount(refundAmount)
                .refundStatus(refundStatus)
                .estimatedDays(refundAmount.compareTo(BigDecimal.ZERO) > 0 ? 5 : 0)
                .message(buildMessage(hoursUntilDeparture, refundAmount))
                .build();
    }

    @Override
    public RefundResponse getRefundStatus(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));

        PaymentStatus refundStatus = switch (booking.getStatus()) {
            case REFUNDED -> PaymentStatus.REFUND_PROCESSED;
            case CANCELLED -> PaymentStatus.SUCCESS;
            default -> PaymentStatus.REFUND_PENDING;
        };

        return RefundResponse.builder()
                .bookingId(bookingId)
                .refundAmount(booking.getRefundAmount() != null ? booking.getRefundAmount() : BigDecimal.ZERO)
                .refundStatus(refundStatus)
                .estimatedDays(3)
                .message("Refund status: " + refundStatus.name())
                .build();
    }

    private BigDecimal calculateRefund(BigDecimal total, long hoursUntilDeparture) {
        if (hoursUntilDeparture >= AppConstants.FULL_REFUND_HOURS)
            return total;
        if (hoursUntilDeparture >= AppConstants.PARTIAL_REFUND_HOURS)
            return total.multiply(BigDecimal.valueOf(AppConstants.PARTIAL_REFUND_RATE));
        return BigDecimal.ZERO;
    }

    private String buildMessage(long hours, BigDecimal refund) {
        if (hours >= AppConstants.FULL_REFUND_HOURS)
            return "Full refund of ₹" + refund + " will be processed within 5 business days.";
        if (hours >= AppConstants.PARTIAL_REFUND_HOURS)
            return "50% refund of ₹" + refund + " will be processed within 5 business days.";
        return "No refund applicable — cancellation within 2 hours of departure.";
    }
}
