package com.makemytrip.model.dto;

import com.makemytrip.enums.SeatClass;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SeatDTO {
    private Long      id;
    private String    seatNumber;
    private SeatClass seatClass;
    private boolean   available;
    private boolean   windowSeat;      // renamed from 'window'
    private boolean   extraLegroom;
    private boolean   nearExit;
    private BigDecimal surcharge;
    private boolean   selected;
}
