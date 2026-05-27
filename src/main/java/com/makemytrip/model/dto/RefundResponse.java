package com.makemytrip.model.dto;
import com.makemytrip.enums.PaymentStatus;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RefundResponse {
    private Long bookingId;
    private BigDecimal refundAmount;
    private PaymentStatus refundStatus;
    private int estimatedDays;
    private String message;
}
