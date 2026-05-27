package com.makemytrip.model.dto;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecommendationResponse {
    private Long entityId;
    private String type;
    private String name;
    private String destination;
    private BigDecimal price;
    private String reason;
    private List<String> tags;
    private double score;
}
