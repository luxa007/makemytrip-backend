package com.makemytrip.auth.service;

import com.makemytrip.auth.dto.*;
import com.makemytrip.model.entity.User;
import com.makemytrip.repository.UserRepository;
import com.makemytrip.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent())
            throw new RuntimeException("Email already registered");
        User user = new User();
        user.setFullName(req.getName());
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        userRepository.save(user);
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), List.of("ROLE_USER"));
        return new AuthResponse(token, user.getEmail(), user.getFullName(), "ROLE_USER");
    }

    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        User user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), List.of("ROLE_USER"));
        return new AuthResponse(token, user.getEmail(), user.getFullName(), "ROLE_USER");
    }
}
