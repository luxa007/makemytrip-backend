package com.makemytrip.model.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity @Table(name = "rooms")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Room {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "hotel_id", nullable = false) private Hotel hotel;
    @Column(nullable = false) private String roomNumber;
    @Column(nullable = false) private String roomType;
    private int maxOccupancy;
    private String bedType;
    private String view;
    private String description;
    private String previewImageUrl;
    @Column(nullable = false) private boolean available = true;
    @Column(precision = 10, scale = 2) private BigDecimal surcharge = BigDecimal.ZERO;
}
