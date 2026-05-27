package com.makemytrip.controller;
import com.makemytrip.model.dto.PricingResponse;
import com.makemytrip.service.DynamicPricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DynamicPricingController {

    private final DynamicPricingService dynamicPricingService;

    @GetMapping("/flights/{id}/pricing")
    public ResponseEntity<PricingResponse> getFlightPricing(@PathVariable Long id) {
        return ResponseEntity.ok(dynamicPricingService.getFlightPricing(id));
    }

    @GetMapping("/hotels/{id}/pricing")
    public ResponseEntity<PricingResponse> getHotelPricing(@PathVariable Long id) {
        return ResponseEntity.ok(dynamicPricingService.getHotelPricing(id));
    }

    @PostMapping("/flights/{id}/freeze-price")
    public ResponseEntity<PricingResponse> freezeFlightPrice(@PathVariable Long id, @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(dynamicPricingService.freezeFlightPrice(id, userId));
    }

    @PostMapping("/hotels/{id}/freeze-price")
    public ResponseEntity<PricingResponse> freezeHotelPrice(@PathVariable Long id, @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(dynamicPricingService.freezeHotelPrice(id, userId));
    }
}
