package com.makemytrip.repository;
import com.makemytrip.model.entity.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;

public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {
    List<PriceHistory> findByFlightIdAndRecordedAtAfterOrderByRecordedAt(Long flightId, Instant after);
    List<PriceHistory> findByHotelIdAndRecordedAtAfterOrderByRecordedAt(Long hotelId, Instant after);
}
