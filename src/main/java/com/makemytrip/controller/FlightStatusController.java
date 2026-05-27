package com.makemytrip.controller;
import com.makemytrip.enums.FlightStatus;
import com.makemytrip.model.dto.FlightStatusResponse;
import com.makemytrip.service.FlightStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/flights")
@RequiredArgsConstructor
public class FlightStatusController {

    private final FlightStatusService flightStatusService;

    @GetMapping("/{flightNumber}/status")
    public ResponseEntity<FlightStatusResponse> getStatus(@PathVariable String flightNumber) {
        return ResponseEntity.ok(flightStatusService.getStatus(flightNumber));
    }

    @PutMapping("/{flightId}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long flightId,
            @RequestParam FlightStatus status,
            @RequestParam(required = false) String reason) {
        flightStatusService.updateFlightStatus(flightId, status, reason);
        return ResponseEntity.noContent().build();
    }
}
