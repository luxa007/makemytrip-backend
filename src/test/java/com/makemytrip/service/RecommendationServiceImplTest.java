package com.makemytrip.service;
import com.makemytrip.model.dto.RecommendationResponse;
import com.makemytrip.model.entity.*;
import com.makemytrip.repository.*;
import com.makemytrip.service.impl.RecommendationServiceImpl;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceImplTest {

    @Mock UserInteractionRepository interactionRepository;
    @Mock FlightRepository flightRepository;
    @Mock HotelRepository hotelRepository;
    @InjectMocks RecommendationServiceImpl recommendationService;

    @Test
    void getRecommendations_withTopDestinations_returnsRecommendations() {
        when(interactionRepository.findTopDestinationsByUserId(1L)).thenReturn(List.of("Bali"));
        Flight flight = Flight.builder().id(1L).airline("AirMMT").destination("Bali")
                .currentPrice(new BigDecimal("12000")).build();
        when(flightRepository.searchFlights(null, "Bali", null, null)).thenReturn(List.of(flight));
        Hotel hotel = Hotel.builder().id(1L).name("Bali Sunset Resort").city("Bali")
                .currentPrice(new BigDecimal("8000")).starRating(4).build();
        when(hotelRepository.findByCityIgnoreCase("Bali")).thenReturn(List.of(hotel));

        List<RecommendationResponse> result = recommendationService.getRecommendations(1L);

        assertThat(result).isNotEmpty();
        assertThat(result.get(0).getDestination()).isEqualTo("Bali");
        assertThat(result.get(0).getReason()).contains("Bali");
    }

    @Test
    void getRecommendations_noHistory_returnsFallbackFlights() {
        when(interactionRepository.findTopDestinationsByUserId(1L)).thenReturn(List.of());
        Flight f = Flight.builder().id(2L).airline("MmtAir").destination("Goa")
                .currentPrice(new BigDecimal("4000")).build();
        when(flightRepository.findAll()).thenReturn(List.of(f));

        List<RecommendationResponse> result = recommendationService.getRecommendations(1L);

        assertThat(result).isNotEmpty();
        assertThat(result.get(0).getReason()).contains("Popular");
    }

    @Test
    void markFeedback_helpful_increasesWeight() {
        UserInteraction interaction = UserInteraction.builder().id(1L).userId(1L).entityId(5L).weight(1).build();
        when(interactionRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(interaction));
        when(interactionRepository.save(any())).thenReturn(interaction);

        recommendationService.markFeedback(1L, 5L, true);

        assertThat(interaction.getWeight()).isEqualTo(3);
    }
}
