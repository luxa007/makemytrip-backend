package com.makemytrip.controller;
import com.makemytrip.model.dto.*;
import com.makemytrip.service.CancellationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class CancellationController {

    private final CancellationService cancellationService;

    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<RefundResponse> cancelBooking(
            @PathVariable Long bookingId,
            @Valid @RequestBody CancellationRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(cancellationService.cancelBooking(bookingId, request, userId));
    }

    @GetMapping("/{bookingId}/refund-status")
    public ResponseEntity<RefundResponse> getRefundStatus(@PathVariable Long bookingId) {
        return ResponseEntity.ok(cancellationService.getRefundStatus(bookingId));
    }
}
