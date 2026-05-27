package com.makemytrip.model.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity @Table(name = "price_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PriceHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private Long flightId;
    private Long hotelId;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal price;
    @Column(nullable = false) private Instant recordedAt;
    @PrePersist void onCreate() { if (recordedAt == null) recordedAt = Instant.now(); }
}
