package com.makemytrip.service;
import com.makemytrip.model.dto.PricingResponse;

public interface DynamicPricingService {
    PricingResponse getFlightPricing(Long flightId);
    PricingResponse getHotelPricing(Long hotelId);
    PricingResponse freezeFlightPrice(Long flightId, Long userId);
    PricingResponse freezeHotelPrice(Long hotelId, Long userId);
}
