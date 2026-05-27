package com.makemytrip.service.impl;
import com.makemytrip.constants.AppConstants;
import com.makemytrip.enums.FlightStatus;
import com.makemytrip.model.dto.FlightStatusResponse;
import com.makemytrip.model.entity.Flight;
import com.makemytrip.repository.FlightRepository;
import com.makemytrip.service.FlightStatusService;
import com.makemytrip.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.time.Instant;

@Service @RequiredArgsConstructor
public class FlightStatusServiceImpl implements FlightStatusService {

    private final FlightRepository flightRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Cacheable(value = AppConstants.CACHE_FLIGHT_STATUS, key = "#flightNumber")
    public FlightStatusResponse getStatus(String flightNumber) {
        Flight flight = flightRepository.findByFlightNumber(flightNumber)
                .orElseThrow(() -> new IllegalStateException("Flight not found: " + flightNumber));
        return buildResponse(flight);
    }

    @Override
    @Transactional
    @CacheEvict(value = AppConstants.CACHE_FLIGHT_STATUS, key = "#result?.flightNumber ?: 'unknown'")
    public void updateFlightStatus(Long flightId, FlightStatus status, String reason) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new IllegalStateException("Flight not found: " + flightId));
        flight.setStatus(status);
        flight.setDelayReason(reason);
        if (status == FlightStatus.DELAYED && reason != null) {
            flight.setEstimatedArrival(flight.getScheduledArrival().plusSeconds(3600));
        }
        flightRepository.save(flight);
        FlightStatusResponse response = buildResponse(flight);
        messagingTemplate.convertAndSend("/topic/flight/" + flight.getFlightNumber(), response);
        notificationService.sendFlightStatusAlert(flight, "Status updated to " + status.name() + (reason != null ? ": " + reason : ""));
    }

    private FlightStatusResponse buildResponse(Flight f) {
        long delayMinutes = 0;
        if (f.getStatus() == FlightStatus.DELAYED && f.getEstimatedArrival() != null)
            delayMinutes = Duration.between(f.getScheduledArrival(), f.getEstimatedArrival()).toMinutes();
        return FlightStatusResponse.builder()
                .flightNumber(f.getFlightNumber()).airline(f.getAirline())
                .origin(f.getOrigin()).destination(f.getDestination())
                .scheduledDeparture(f.getScheduledDeparture())
                .estimatedArrival(f.getEstimatedArrival() != null ? f.getEstimatedArrival() : f.getScheduledArrival())
                .status(f.getStatus()).delayMinutes(delayMinutes)
                .delayReason(f.getDelayReason()).build();
    }
}
