package com.makemytrip.auth.dto;
import lombok.*;
@Data @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String name;
    private String role;
}
