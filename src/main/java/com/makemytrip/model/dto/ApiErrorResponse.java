package com.makemytrip.model.dto;
import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApiErrorResponse {
    private Instant timestamp;
    private int status;
    private String code;
    private String message;
    private String path;
}
