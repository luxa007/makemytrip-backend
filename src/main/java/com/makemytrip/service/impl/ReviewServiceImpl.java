package com.makemytrip.service.impl;
import com.makemytrip.enums.ReviewStatus;
import com.makemytrip.exception.ReviewNotFoundException;
import com.makemytrip.model.dto.*;
import com.makemytrip.model.entity.*;
import com.makemytrip.repository.*;
import com.makemytrip.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final FlightRepository flightRepository;
    private final HotelRepository hotelRepository;

    @Override @Transactional
    public ReviewResponse createReview(ReviewRequest request, Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Review review = Review.builder()
                .user(user)
                .rating(request.getRating())
                .title(request.getTitle())
                .body(request.getBody())
                .photoUrls(request.getPhotoUrls() != null ? request.getPhotoUrls() : new ArrayList<>())
                .status(ReviewStatus.ACTIVE)
                .helpfulCount(0)
                .build();

        if (request.getFlightId() != null)
            review.setFlight(flightRepository.findById(request.getFlightId()).orElseThrow());
        if (request.getHotelId() != null)
            review.setHotel(hotelRepository.findById(request.getHotelId()).orElseThrow());
        if (request.getParentReviewId() != null)
            review.setParentReview(reviewRepository.findById(request.getParentReviewId())
                    .orElseThrow(() -> new ReviewNotFoundException(request.getParentReviewId())));

        return toResponse(reviewRepository.save(review));
    }

    @Override @Transactional
    public void flagReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));
        review.setStatus(ReviewStatus.FLAGGED);
        reviewRepository.save(review);
    }

    @Override @Transactional
    public void moderateReview(Long reviewId, boolean remove) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId));
        review.setStatus(remove ? ReviewStatus.REMOVED : ReviewStatus.ACTIVE);
        reviewRepository.save(review);
    }

    @Override
    public Page<ReviewResponse> getReviewsForFlight(Long flightId, Pageable pageable) {
        return reviewRepository.findByFlightIdAndStatusAndParentReviewIsNull(flightId, ReviewStatus.ACTIVE, pageable)
                .map(this::toResponse);
    }

    @Override
    public Page<ReviewResponse> getReviewsForHotel(Long hotelId, Pageable pageable) {
        return reviewRepository.findByHotelIdAndStatusAndParentReviewIsNull(hotelId, ReviewStatus.ACTIVE, pageable)
                .map(this::toResponse);
    }

    private ReviewResponse toResponse(Review r) {
        List<ReviewResponse> replies = reviewRepository.findByParentReviewId(r.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
        return ReviewResponse.builder()
                .id(r.getId()).userId(r.getUser().getId()).userName(r.getUser().getFullName())
                .flightId(r.getFlight() != null ? r.getFlight().getId() : null)
                .hotelId(r.getHotel() != null ? r.getHotel().getId() : null)
                .rating(r.getRating()).title(r.getTitle()).body(r.getBody())
                .photoUrls(r.getPhotoUrls()).status(r.getStatus()).helpfulCount(r.getHelpfulCount())
                .parentReviewId(r.getParentReview() != null ? r.getParentReview().getId() : null)
                .replies(replies).createdAt(r.getCreatedAt()).build();
    }
}
