package com.makemytrip.model.dto;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReviewRequest {
    private Long flightId;
    private Long hotelId;
    @NotNull @Min(1) @Max(5) private Integer rating;
    private String title;
    private String body;
    private List<String> photoUrls;
    private Long parentReviewId;
}
