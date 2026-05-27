package com.makemytrip.service;
import com.makemytrip.enums.ReviewStatus;
import com.makemytrip.exception.ReviewNotFoundException;
import com.makemytrip.model.dto.*;
import com.makemytrip.model.entity.*;
import com.makemytrip.repository.*;
import com.makemytrip.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceImplTest {

    @Mock ReviewRepository reviewRepository;
    @Mock UserRepository userRepository;
    @Mock FlightRepository flightRepository;
    @Mock HotelRepository hotelRepository;
    @InjectMocks ReviewServiceImpl reviewService;

    @Test
    void createReview_success() {
        User user = User.builder().id(1L).fullName("Alice").build();
        Flight flight = Flight.builder().id(5L).build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(flightRepository.findById(5L)).thenReturn(Optional.of(flight));
        Review saved = Review.builder().id(1L).user(user).flight(flight).rating(5)
                .title("Great").body("Loved it").status(ReviewStatus.ACTIVE).helpfulCount(0).build();
        when(reviewRepository.save(any())).thenReturn(saved);
        when(reviewRepository.findByParentReviewId(any())).thenReturn(List.of());

        ReviewRequest req = new ReviewRequest(5L, null, 5, "Great", "Loved it", List.of(), null);
        ReviewResponse response = reviewService.createReview(req, 1L);

        assertThat(response.getRating()).isEqualTo(5);
        assertThat(response.getUserName()).isEqualTo("Alice");
    }

    @Test
    void flagReview_setsStatusFlagged() {
        Review review = Review.builder().id(1L).status(ReviewStatus.ACTIVE).build();
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(any())).thenReturn(review);
        reviewService.flagReview(1L, 1L);
        assertThat(review.getStatus()).isEqualTo(ReviewStatus.FLAGGED);
    }

    @Test
    void moderateReview_remove_setsStatusRemoved() {
        Review review = Review.builder().id(1L).status(ReviewStatus.FLAGGED).build();
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(any())).thenReturn(review);
        reviewService.moderateReview(1L, true);
        assertThat(review.getStatus()).isEqualTo(ReviewStatus.REMOVED);
    }

    @Test
    void flagReview_throwsException_whenNotFound() {
        when(reviewRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> reviewService.flagReview(99L, 1L))
                .isInstanceOf(ReviewNotFoundException.class);
    }
}
