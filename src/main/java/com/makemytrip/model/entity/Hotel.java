package com.makemytrip.model.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Entity @Table(name = "hotels")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Hotel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String city;
    private String address;
    private String description;
    @Column(nullable = false) private int starRating;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal basePrice;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal currentPrice;
    private String thumbnailUrl;
    @ElementCollection
    @CollectionTable(name = "hotel_amenities", joinColumns = @JoinColumn(name = "hotel_id"))
    @Column(name = "amenity") @Builder.Default private List<String> amenities = new ArrayList<>();
    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default private List<Room> rooms = new ArrayList<>();
    @Column(name = "created_at", updatable = false) private Instant createdAt;
    @Column(name = "updated_at")                    private Instant updatedAt;
    @PrePersist void onCreate() { createdAt = updatedAt = Instant.now(); if (currentPrice == null) currentPrice = basePrice; }
    @PreUpdate  void onUpdate() { updatedAt = Instant.now(); }
}
