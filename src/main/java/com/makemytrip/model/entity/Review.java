package com.makemytrip.model.entity;
import com.makemytrip.enums.ReviewStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.*;

@Entity @Table(name = "reviews")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Review {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "flight_id") private Flight flight;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "hotel_id")  private Hotel hotel;
    @Column(nullable = false) private int rating;
    private String title;
    @Column(columnDefinition = "TEXT") private String body;
    @ElementCollection
    @CollectionTable(name = "review_photos", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "photo_url") @Builder.Default private List<String> photoUrls = new ArrayList<>();
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "parent_review_id") private Review parentReview;
    @Enumerated(EnumType.STRING) @Column(nullable = false) @Builder.Default private ReviewStatus status = ReviewStatus.ACTIVE;
    @Column(nullable = false) @Builder.Default private int helpfulCount = 0;
    @Column(name = "created_at", updatable = false) private Instant createdAt;
    @Column(name = "updated_at")                    private Instant updatedAt;
    @PrePersist void onCreate() { createdAt = updatedAt = Instant.now(); }
    @PreUpdate  void onUpdate() { updatedAt = Instant.now(); }
}
