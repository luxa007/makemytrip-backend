package com.makemytrip.repository;
import com.makemytrip.enums.BookingStatus;
import com.makemytrip.model.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdAndStatus(Long userId, BookingStatus status);
    List<Booking> findByUserId(Long userId);
    Optional<Booking> findByIdAndUserId(Long id, Long userId);
}
