package com.makemytrip.service.impl;
import com.makemytrip.model.entity.*;
import com.makemytrip.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service @Slf4j
public class NotificationServiceImpl implements NotificationService {

    @Async
    @Override
    public void sendBookingConfirmation(Booking booking) {
        log.info("[EMAIL] Booking confirmed — ID: {}, User: {}, Amount: ₹{}",
                booking.getId(), booking.getUser().getEmail(), booking.getTotalAmount());
    }

    @Async
    @Override
    public void sendCancellationConfirmation(Booking booking, BigDecimal refundAmount) {
        log.info("[EMAIL] Booking cancelled — ID: {}, User: {}, Refund: ₹{}",
                booking.getId(), booking.getUser().getEmail(), refundAmount);
    }

    @Async
    @Override
    public void sendFlightStatusAlert(Flight flight, String message) {
        log.info("[PUSH] Flight status alert — Flight: {}, Message: {}", flight.getFlightNumber(), message);
    }
}
