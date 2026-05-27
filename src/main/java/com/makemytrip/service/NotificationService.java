package com.makemytrip.service;
import com.makemytrip.model.entity.*;
import java.math.BigDecimal;

public interface NotificationService {
    void sendBookingConfirmation(Booking booking);
    void sendCancellationConfirmation(Booking booking, BigDecimal refundAmount);
    void sendFlightStatusAlert(Flight flight, String message);
}
