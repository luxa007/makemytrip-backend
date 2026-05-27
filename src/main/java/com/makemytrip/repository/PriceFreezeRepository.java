package com.makemytrip.repository;
import com.makemytrip.model.entity.PriceFreeze;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PriceFreezeRepository extends JpaRepository<PriceFreeze, Long> {
    Optional<PriceFreeze> findByUserIdAndFlightIdAndActiveTrue(Long userId, Long flightId);
    Optional<PriceFreeze> findByUserIdAndHotelIdAndActiveTrue(Long userId, Long hotelId);
}
