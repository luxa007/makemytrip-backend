package com.makemytrip.model.dto;
import com.makemytrip.enums.CancellationReason;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CancellationRequest {
    @NotNull private Long bookingId;
    @NotNull private CancellationReason cancellationReason;
    private String note;
}
