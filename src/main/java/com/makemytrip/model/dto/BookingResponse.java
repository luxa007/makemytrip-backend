package com.makemytrip.model.dto;
import com.makemytrip.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
@Data @Builder
public class BookingResponse {
    private Long bookingId;
    private BookingStatus status;
    private BigDecimal totalAmount;
    private String message;
}
