package com.makemytrip.model.entity;
import com.makemytrip.enums.SeatClass;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity @Table(name = "seats")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Seat {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "flight_id", nullable = false) private Flight flight;
    @Column(nullable = false) private String seatNumber;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private SeatClass seatClass;
    @Column(nullable = false) private boolean available = true;
    private boolean window;
    private boolean extraLegroom;
    private boolean nearExit;
    @Column(precision = 10, scale = 2) private BigDecimal surcharge = BigDecimal.ZERO;
}
