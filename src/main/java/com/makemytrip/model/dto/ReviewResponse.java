package com.makemytrip.model.dto;
import com.makemytrip.enums.ReviewStatus;
import lombok.*;
import java.time.Instant;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReviewResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long flightId;
    private Long hotelId;
    private int rating;
    private String title;
    private String body;
    private List<String> photoUrls;
    private ReviewStatus status;
    private int helpfulCount;
    private Long parentReviewId;
    private List<ReviewResponse> replies;
    private Instant createdAt;
}
