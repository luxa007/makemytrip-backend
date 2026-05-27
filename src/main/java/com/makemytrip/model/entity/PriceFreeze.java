package com.makemytrip.model.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity @Table(name = "price_freezes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PriceFreeze {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private Long userId;
    private Long flightId;
    private Long hotelId;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal frozenPrice;
    @Column(nullable = false) private Instant expiresAt;
    @Column(nullable = false) private boolean active = true;
    @Column(name = "created_at", updatable = false) private Instant createdAt;
    @PrePersist void onCreate() { createdAt = Instant.now(); }
}
