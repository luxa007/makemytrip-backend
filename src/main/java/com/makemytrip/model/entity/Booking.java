package com.makemytrip.model.entity;
import com.makemytrip.enums.*;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity @Table(name = "bookings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "flight_id") private Flight flight;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "hotel_id")  private Hotel hotel;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "seat_id")   private Seat seat;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "room_id")   private Room room;
    @Enumerated(EnumType.STRING) @Column(nullable = false) @Builder.Default private BookingStatus status = BookingStatus.PENDING;
    @Enumerated(EnumType.STRING) private SeatClass seatClass;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal totalAmount;
    @Column(precision = 10, scale = 2)                   private BigDecimal refundAmount;
    @Enumerated(EnumType.STRING) private CancellationReason cancellationReason;
    private String cancellationNote;
    private Instant cancelledAt;
    @Column(name = "created_at", updatable = false) private Instant createdAt;
    @Column(name = "updated_at")                    private Instant updatedAt;
    @PrePersist void onCreate() { createdAt = updatedAt = Instant.now(); }
    @PreUpdate  void onUpdate() { updatedAt = Instant.now(); }
}
