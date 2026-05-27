package com.makemytrip.service;
import com.makemytrip.model.dto.RecommendationResponse;
import java.util.List;

public interface RecommendationService {
    List<RecommendationResponse> getRecommendations(Long userId);
    void markFeedback(Long userId, Long entityId, boolean helpful);
}
