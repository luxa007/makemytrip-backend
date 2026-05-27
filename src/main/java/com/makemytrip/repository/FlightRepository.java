package com.makemytrip.repository;
import com.makemytrip.enums.FlightStatus;
import com.makemytrip.model.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface FlightRepository extends JpaRepository<Flight, Long> {
    Optional<Flight> findByFlightNumber(String flightNumber);
    @Query("SELECT f FROM Flight f WHERE f.origin = :origin AND f.destination = :destination AND f.scheduledDeparture >= :from AND f.scheduledDeparture < :to")
    List<Flight> searchFlights(String origin, String destination, Instant from, Instant to);
    List<Flight> findByStatusIn(List<FlightStatus> statuses);
}
