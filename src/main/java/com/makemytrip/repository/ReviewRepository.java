package com.makemytrip.repository;
import com.makemytrip.enums.ReviewStatus;
import com.makemytrip.model.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByFlightIdAndStatusAndParentReviewIsNull(Long flightId, ReviewStatus status, Pageable pageable);
    Page<Review> findByHotelIdAndStatusAndParentReviewIsNull(Long hotelId, ReviewStatus status, Pageable pageable);
    List<Review> findByParentReviewId(Long parentReviewId);
    List<Review> findByStatus(ReviewStatus status);
}
