package com.makemytrip.model.dto;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoomDTO {
    private Long id;
    private String roomNumber;
    private String roomType;
    private boolean available;
    private int maxOccupancy;
    private String bedType;
    private String view;
    private BigDecimal surcharge;
    private String previewImageUrl;
}
