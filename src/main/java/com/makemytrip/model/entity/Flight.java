package com.makemytrip.model.entity;
import com.makemytrip.enums.FlightStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Entity @Table(name = "flights")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Flight {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String flightNumber;
    @Column(nullable = false) private String airline;
    @Column(nullable = false) private String origin;
    @Column(nullable = false) private String destination;
    @Column(nullable = false) private Instant scheduledDeparture;
    @Column(nullable = false) private Instant scheduledArrival;
    private Instant actualDeparture;
    private Instant estimatedArrival;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private FlightStatus status = FlightStatus.SCHEDULED;
    private String delayReason;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal basePrice;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal currentPrice;
    @OneToMany(mappedBy = "flight", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default private List<Seat> seats = new ArrayList<>();
    @Column(name = "created_at", updatable = false) private Instant createdAt;
    @Column(name = "updated_at")                    private Instant updatedAt;
    @PrePersist void onCreate() { createdAt = updatedAt = Instant.now(); if (currentPrice == null) currentPrice = basePrice; }
    @PreUpdate  void onUpdate() { updatedAt = Instant.now(); }
}
