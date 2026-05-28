package com.makemytrip.controller;
import com.makemytrip.model.dto.BookingRequest;
import com.makemytrip.model.dto.BookingResponse;
import com.makemytrip.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking", description = "Create and manage bookings")
@SecurityRequirement(name = "bearerAuth")
public class BookingController {
    private final BookingService bookingService;
    @PostMapping
    @Operation(summary = "Create a new booking")
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest req) {
        return ResponseEntity.ok(bookingService.createBooking(req));
    }
}
