package com.makemytrip.controller;
import com.makemytrip.model.dto.RecommendationResponse;
import com.makemytrip.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<List<RecommendationResponse>> getRecommendations(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(recommendationService.getRecommendations(userId));
    }

    @PostMapping("/{entityId}/feedback")
    public ResponseEntity<Void> markFeedback(
            @PathVariable Long entityId,
            @RequestParam boolean helpful,
            @RequestHeader("X-User-Id") Long userId) {
        recommendationService.markFeedback(userId, entityId, helpful);
        return ResponseEntity.noContent().build();
    }
}
