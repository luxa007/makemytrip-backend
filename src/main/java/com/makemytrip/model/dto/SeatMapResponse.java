package com.makemytrip.model.dto;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SeatMapResponse {
    private Long flightId;
    private List<SeatDTO> seats;
}
