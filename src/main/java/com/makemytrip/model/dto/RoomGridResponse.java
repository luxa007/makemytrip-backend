package com.makemytrip.model.dto;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoomGridResponse {
    private Long hotelId;
    private List<RoomDTO> rooms;
}
