package com.makemytrip.model.dto;
import com.makemytrip.enums.FlightStatus;
import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FlightStatusResponse {
    private String flightNumber;
    private String airline;
    private String origin;
    private String destination;
    private Instant scheduledDeparture;
    private Instant estimatedArrival;
    private FlightStatus status;
    private long delayMinutes;
    private String delayReason;
    private String gate;
    private String terminal;
}
