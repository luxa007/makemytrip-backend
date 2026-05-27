package com.makemytrip.service;
import com.makemytrip.model.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewResponse createReview(ReviewRequest request, Long userId);
    void flagReview(Long reviewId, Long userId);
    void moderateReview(Long reviewId, boolean remove);
    Page<ReviewResponse> getReviewsForFlight(Long flightId, Pageable pageable);
    Page<ReviewResponse> getReviewsForHotel(Long hotelId, Pageable pageable);
}
