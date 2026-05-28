package com.makemytrip.model.entity;
import com.makemytrip.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity @Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "booking_id", nullable = false) private Booking booking;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal amount;
    @Enumerated(EnumType.STRING) @Column(nullable = false) @Builder.Default private PaymentStatus paymentStatus = PaymentStatus.INITIATED;
    private String gatewayReference;
    @Column(name = "created_at", updatable = false) private Instant createdAt;
    @Column(name = "updated_at")                    private Instant updatedAt;
    @PrePersist void onCreate() { createdAt = updatedAt = Instant.now(); }
    @PreUpdate  void onUpdate() { updatedAt = Instant.now(); }
}
