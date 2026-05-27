package com.makemytrip.task;
import com.makemytrip.enums.FlightStatus;
import com.makemytrip.model.entity.Flight;
import com.makemytrip.repository.FlightRepository;
import com.makemytrip.service.FlightStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.*;

@Component @RequiredArgsConstructor @Slf4j
public class FlightStatusScheduler {

    private final FlightRepository flightRepository;
    private final FlightStatusService flightStatusService;

    private static final List<FlightStatus> LIVE_STATUSES = List.of(
            FlightStatus.SCHEDULED, FlightStatus.ON_TIME, FlightStatus.DELAYED, FlightStatus.BOARDING);
    private static final String[] DELAY_REASONS = {
            "Air traffic congestion", "Late arriving aircraft", "Crew scheduling", "Weather conditions", "Technical check"};

    @Scheduled(fixedRate = 30_000)
    public void simulateRealTimeUpdates() {
        List<Flight> liveFlights = flightRepository.findByStatusIn(LIVE_STATUSES);
        Random rng = new Random();
        for (Flight flight : liveFlights) {
            int roll = rng.nextInt(10);
            FlightStatus newStatus;
            String reason = null;
            if (roll < 2) { newStatus = FlightStatus.DELAYED; reason = DELAY_REASONS[rng.nextInt(DELAY_REASONS.length)]; }
            else if (roll < 5) { newStatus = FlightStatus.ON_TIME; }
            else if (roll < 7) { newStatus = FlightStatus.BOARDING; }
            else { continue; }
            if (newStatus != flight.getStatus()) {
                log.info("[SCHEDULER] {} → {} ({})", flight.getFlightNumber(), newStatus, reason);
                flightStatusService.updateFlightStatus(flight.getId(), newStatus, reason);
            }
        }
    }
}
