package com.makemytrip.model.entity;
import com.makemytrip.enums.SeatClass;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name = "user_preferences")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserPreference {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true) private Long userId;
    @Enumerated(EnumType.STRING) private SeatClass preferredSeatClass;
    private String preferredRoomType;
    private String preferredAirline;
    @Column(name = "created_at", updatable = false) private Instant createdAt;
    @PrePersist void onCreate() { createdAt = Instant.now(); }
}
