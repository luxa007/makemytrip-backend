package com.makemytrip.model.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.*;

@Entity @Table(name = "user_interactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserInteraction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long userId;
    @Column(nullable = false) private Long entityId;
    @Column(nullable = false) private String entityType;   // FLIGHT or HOTEL
    @Column(nullable = false) private String interactionType; // VIEW, BOOK, SEARCH
    private String destination;
    @ElementCollection
    @CollectionTable(name = "interaction_tags", joinColumns = @JoinColumn(name = "interaction_id"))
    @Column(name = "tag") @Builder.Default private List<String> tags = new ArrayList<>();
    @Builder.Default private int weight = 1;
    @Column(name = "created_at", updatable = false) private Instant createdAt;
    @PrePersist void onCreate() { createdAt = Instant.now(); }
}
