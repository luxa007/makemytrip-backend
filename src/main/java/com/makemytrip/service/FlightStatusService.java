package com.makemytrip.service;
import com.makemytrip.enums.FlightStatus;
import com.makemytrip.model.dto.FlightStatusResponse;

public interface FlightStatusService {
    FlightStatusResponse getStatus(String flightNumber);
    void updateFlightStatus(Long flightId, FlightStatus status, String reason);
}
