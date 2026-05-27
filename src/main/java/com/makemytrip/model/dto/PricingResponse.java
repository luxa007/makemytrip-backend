package com.makemytrip.model.dto;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PricingResponse {
    private Long entityId;
    private String type;
    private BigDecimal currentPrice;
    private BigDecimal basePrice;
    private double multiplier;
    private String reason;
    private List<PricePoint> priceHistory;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PricePoint {
        private BigDecimal price;
        private Instant recordedAt;
    }
}
