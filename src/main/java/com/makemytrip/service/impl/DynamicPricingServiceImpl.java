package com.makemytrip.service.impl;
import com.makemytrip.constants.AppConstants;
import com.makemytrip.model.dto.PricingResponse;
import com.makemytrip.model.entity.*;
import com.makemytrip.repository.*;
import com.makemytrip.service.DynamicPricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class DynamicPricingServiceImpl implements DynamicPricingService {

    private final FlightRepository flightRepository;
    private final HotelRepository hotelRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final PriceFreezeRepository priceFreezeRepository;
    private final SeatRepository seatRepository;

    @Override
    @Cacheable(value = AppConstants.CACHE_PRICING, key = "'flight:' + #flightId")
    public PricingResponse getFlightPricing(Long flightId) {
        Flight flight = flightRepository.findById(flightId).orElseThrow();
        double multiplier = calculateMultiplier(flight.getScheduledDeparture());
        long totalSeats = seatRepository.findByFlightIdOrderBySeatNumber(flightId).size();
        long availableSeats = seatRepository.findByFlightIdOrderBySeatNumber(flightId).stream().filter(Seat::isAvailable).count();
        if (totalSeats > 0) {
            double occupancy = 1.0 - ((double) availableSeats / totalSeats);
            if (occupancy > 0.8) multiplier += 0.15;
            else if (occupancy > 0.6) multiplier += 0.08;
        }
        BigDecimal currentPrice = flight.getBasePrice().multiply(BigDecimal.valueOf(multiplier)).setScale(2, RoundingMode.HALF_UP);
        List<PricingResponse.PricePoint> history = priceHistoryRepository
                .findByFlightIdAndRecordedAtAfterOrderByRecordedAt(flightId, Instant.now().minus(Duration.ofDays(30)))
                .stream().map(ph -> new PricingResponse.PricePoint(ph.getPrice(), ph.getRecordedAt())).collect(Collectors.toList());
        return PricingResponse.builder().entityId(flightId).type("FLIGHT")
                .currentPrice(currentPrice).basePrice(flight.getBasePrice()).multiplier(multiplier)
                .reason(buildReason(multiplier)).priceHistory(history).build();
    }

    @Override
    @Cacheable(value = AppConstants.CACHE_PRICING, key = "'hotel:' + #hotelId")
    public PricingResponse getHotelPricing(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId).orElseThrow();
        double multiplier = calculateMultiplier(Instant.now().plus(Duration.ofDays(7)));
        BigDecimal currentPrice = hotel.getBasePrice().multiply(BigDecimal.valueOf(multiplier)).setScale(2, RoundingMode.HALF_UP);
        List<PricingResponse.PricePoint> history = priceHistoryRepository
                .findByHotelIdAndRecordedAtAfterOrderByRecordedAt(hotelId, Instant.now().minus(Duration.ofDays(30)))
                .stream().map(ph -> new PricingResponse.PricePoint(ph.getPrice(), ph.getRecordedAt())).collect(Collectors.toList());
        return PricingResponse.builder().entityId(hotelId).type("HOTEL")
                .currentPrice(currentPrice).basePrice(hotel.getBasePrice()).multiplier(multiplier)
                .reason(buildReason(multiplier)).priceHistory(history).build();
    }

    @Override @Transactional
    public PricingResponse freezeFlightPrice(Long flightId, Long userId) {
        PricingResponse pricing = getFlightPricing(flightId);
        priceFreezeRepository.findByUserIdAndFlightIdAndActiveTrue(userId, flightId).ifPresent(f -> { f.setActive(false); priceFreezeRepository.save(f); });
        PriceFreeze freeze = PriceFreeze.builder().userId(userId).flightId(flightId)
                .frozenPrice(pricing.getCurrentPrice())
                .expiresAt(Instant.now().plus(Duration.ofMinutes(AppConstants.PRICE_FREEZE_MINUTES)))
                .active(true).build();
        priceFreezeRepository.save(freeze);
        pricing.setReason("Price frozen for " + AppConstants.PRICE_FREEZE_MINUTES + " minutes at ₹" + pricing.getCurrentPrice());
        return pricing;
    }

    @Override @Transactional
    public PricingResponse freezeHotelPrice(Long hotelId, Long userId) {
        PricingResponse pricing = getHotelPricing(hotelId);
        priceFreezeRepository.findByUserIdAndHotelIdAndActiveTrue(userId, hotelId).ifPresent(f -> { f.setActive(false); priceFreezeRepository.save(f); });
        PriceFreeze freeze = PriceFreeze.builder().userId(userId).hotelId(hotelId)
                .frozenPrice(pricing.getCurrentPrice())
                .expiresAt(Instant.now().plus(Duration.ofMinutes(AppConstants.PRICE_FREEZE_MINUTES)))
                .active(true).build();
        priceFreezeRepository.save(freeze);
        pricing.setReason("Price frozen for " + AppConstants.PRICE_FREEZE_MINUTES + " minutes at ₹" + pricing.getCurrentPrice());
        return pricing;
    }

    private double calculateMultiplier(Instant date) {
        DayOfWeek day = date.atZone(ZoneOffset.UTC).getDayOfWeek();
        Month month = date.atZone(ZoneOffset.UTC).getMonth();
        double multiplier = 1.0;
        if (day == DayOfWeek.FRIDAY || day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) multiplier += 0.10;
        if (month == Month.DECEMBER || month == Month.JUNE || month == Month.JULY) multiplier += 0.10;
        return Math.min(multiplier, AppConstants.PEAK_PRICING_MULTIPLIER);
    }

    private String buildReason(double multiplier) {
        if (multiplier >= AppConstants.PEAK_PRICING_MULTIPLIER) return "Peak season pricing — high demand";
        if (multiplier > 1.10) return "Weekend surge pricing";
        if (multiplier > 1.05) return "Seasonal price adjustment";
        return "Standard pricing";
    }
}
