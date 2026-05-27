package com.makemytrip.service.impl;
import com.makemytrip.constants.AppConstants;
import com.makemytrip.model.dto.RecommendationResponse;
import com.makemytrip.model.entity.*;
import com.makemytrip.repository.*;
import com.makemytrip.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {

    private final UserInteractionRepository interactionRepository;
    private final FlightRepository flightRepository;
    private final HotelRepository hotelRepository;

    @Override
    @Cacheable(value = AppConstants.CACHE_RECOMMENDATIONS, key = "#userId")
    public List<RecommendationResponse> getRecommendations(Long userId) {
        List<String> topDestinations = interactionRepository.findTopDestinationsByUserId(userId);
        List<RecommendationResponse> recommendations = new ArrayList<>();

        for (String destination : topDestinations) {
            List<Flight> flights = flightRepository.searchFlights(null, destination, null, null)
                    .stream().limit(2).collect(Collectors.toList());
            for (Flight f : flights)
                recommendations.add(RecommendationResponse.builder()
                        .entityId(f.getId()).type("FLIGHT").name(f.getAirline() + " to " + f.getDestination())
                        .destination(f.getDestination()).price(f.getCurrentPrice())
                        .reason("You liked " + destination + "! Try this flight")
                        .tags(List.of("flight", destination.toLowerCase())).score(0.85).build());

            hotelRepository.findByCityIgnoreCase(destination).stream().limit(2).forEach(h ->
                recommendations.add(RecommendationResponse.builder()
                        .entityId(h.getId()).type("HOTEL").name(h.getName())
                        .destination(h.getCity()).price(h.getCurrentPrice())
                        .reason("You liked " + destination + "! Try " + h.getName())
                        .tags(List.of("hotel", destination.toLowerCase(), h.getStarRating() + "-star")).score(0.80).build()));
        }

        if (recommendations.isEmpty()) {
            flightRepository.findAll().stream().limit(5).forEach(f ->
                recommendations.add(RecommendationResponse.builder()
                        .entityId(f.getId()).type("FLIGHT").name(f.getAirline() + " to " + f.getDestination())
                        .destination(f.getDestination()).price(f.getCurrentPrice())
                        .reason("Popular destination you might enjoy").tags(List.of("flight", "popular")).score(0.60).build()));
        }

        recommendations.sort(Comparator.comparingDouble(RecommendationResponse::getScore).reversed());
        return recommendations.stream().limit(10).collect(Collectors.toList());
    }

    @Override @Transactional
    @CacheEvict(value = AppConstants.CACHE_RECOMMENDATIONS, key = "#userId")
    public void markFeedback(Long userId, Long entityId, boolean helpful) {
        List<UserInteraction> interactions = interactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().filter(i -> i.getEntityId().equals(entityId)).collect(Collectors.toList());
        for (UserInteraction interaction : interactions) {
            interaction.setWeight(helpful ? interaction.getWeight() + 2 : Math.max(1, interaction.getWeight() - 1));
            interactionRepository.save(interaction);
        }
    }
}
