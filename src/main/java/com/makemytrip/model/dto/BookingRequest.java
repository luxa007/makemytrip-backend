package com.makemytrip.model.dto;
import com.makemytrip.enums.SeatClass;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
@Data
public class BookingRequest {
    @NotNull private Long flightId;
    private Long hotelId;
    private Long seatId;
    private Long roomId;
    @NotNull private SeatClass seatClass;
}
