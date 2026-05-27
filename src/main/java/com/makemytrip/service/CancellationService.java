package com.makemytrip.service;
import com.makemytrip.model.dto.*;

public interface CancellationService {
    RefundResponse cancelBooking(Long bookingId, CancellationRequest request, Long userId);
    RefundResponse getRefundStatus(Long bookingId);
}
