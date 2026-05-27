package com.makemytrip.controller;
import com.makemytrip.model.dto.*;
import com.makemytrip.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody ReviewRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.createReview(request, userId));
    }

    @GetMapping("/flight/{flightId}")
    public ResponseEntity<Page<ReviewResponse>> getFlightReviews(
            @PathVariable Long flightId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction) {
        Sort.Direction dir = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));
        return ResponseEntity.ok(reviewService.getReviewsForFlight(flightId, pageable));
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<Page<ReviewResponse>> getHotelReviews(
            @PathVariable Long hotelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction) {
        Sort.Direction dir = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));
        return ResponseEntity.ok(reviewService.getReviewsForHotel(hotelId, pageable));
    }

    @PostMapping("/{id}/flag")
    public ResponseEntity<Void> flagReview(@PathVariable Long id, @RequestHeader("X-User-Id") Long userId) {
        reviewService.flagReview(id, userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> moderateReview(@PathVariable Long id, @RequestParam boolean remove) {
        reviewService.moderateReview(id, remove);
        return ResponseEntity.noContent().build();
    }
}
