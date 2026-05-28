package com.makemytrip.auth.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
@Data
public class RegisterRequest {
    @NotBlank @Size(min=2,max=50) private String name;
    @NotBlank @Email private String email;
    @NotBlank @Size(min=6) private String password;
}
