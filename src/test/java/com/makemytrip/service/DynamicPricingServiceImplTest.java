package com.makemytrip.service;
import com.makemytrip.model.dto.PricingResponse;
import com.makemytrip.model.entity.*;
import com.makemytrip.repository.*;
import com.makemytrip.service.impl.DynamicPricingServiceImpl;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DynamicPricingServiceImplTest {

    @Mock FlightRepository flightRepository;
    @Mock HotelRepository hotelRepository;
    @Mock PriceHistoryRepository priceHistoryRepository;
    @Mock PriceFreezeRepository priceFreezeRepository;
    @Mock SeatRepository seatRepository;
    @InjectMocks DynamicPricingServiceImpl pricingService;

    @Test
    void getFlightPricing_returnsValidResponse() {
        Flight flight = Flight.builder().id(1L).basePrice(new BigDecimal("3000"))
                .currentPrice(new BigDecimal("3000"))
                .scheduledDeparture(Instant.now().plus(Duration.ofDays(10))).build();
        when(flightRepository.findById(1L)).thenReturn(Optional.of(flight));
        when(seatRepository.findByFlightIdOrderBySeatNumber(1L)).thenReturn(List.of());
        when(priceHistoryRepository.findByFlightIdAndRecordedAtAfterOrderByRecordedAt(any(), any())).thenReturn(List.of());

        PricingResponse response = pricingService.getFlightPricing(1L);

        assertThat(response.getEntityId()).isEqualTo(1L);
        assertThat(response.getType()).isEqualTo("FLIGHT");
        assertThat(response.getCurrentPrice()).isPositive();
        assertThat(response.getMultiplier()).isGreaterThanOrEqualTo(1.0);
    }

    @Test
    void freezeFlightPrice_createsActiveFreeze() {
        Flight flight = Flight.builder().id(2L).basePrice(new BigDecimal("5000"))
                .currentPrice(new BigDecimal("5000"))
                .scheduledDeparture(Instant.now().plus(Duration.ofDays(5))).build();
        when(flightRepository.findById(2L)).thenReturn(Optional.of(flight));
        when(seatRepository.findByFlightIdOrderBySeatNumber(2L)).thenReturn(List.of());
        when(priceHistoryRepository.findByFlightIdAndRecordedAtAfterOrderByRecordedAt(any(), any())).thenReturn(List.of());
        when(priceFreezeRepository.findByUserIdAndFlightIdAndActiveTrue(1L, 2L)).thenReturn(Optional.empty());
        when(priceFreezeRepository.save(any())).thenReturn(PriceFreeze.builder().build());

        PricingResponse response = pricingService.freezeFlightPrice(2L, 1L);

        assertThat(response.getReason()).contains("frozen");
        verify(priceFreezeRepository, times(1)).save(any());
    }
}
