package com.civicpulse.auth;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import com.civicpulse.dto.AuthDtos.AuthResponse;
import com.civicpulse.dto.AuthDtos.LoginRequest;
import com.civicpulse.dto.AuthDtos.RegisterRequest;
import com.civicpulse.user.UserAccount;
import com.civicpulse.user.UserService;

@Service
public class AuthService {
    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtEncoder jwtEncoder;

    public AuthService(UserService userService, AuthenticationManager authenticationManager, JwtEncoder jwtEncoder) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtEncoder = jwtEncoder;
    }

    public AuthResponse register(RegisterRequest request) {
        return response(userService.registerCitizen(request.displayName(), request.email(), request.password()));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(
                UserService.normalize(request.email()), request.password()));
        return response(userService.requireByEmail(request.email()));
    }

    private AuthResponse response(UserAccount account) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("civicpulse")
                .issuedAt(now)
                .expiresAt(now.plus(8, ChronoUnit.HOURS))
                .subject(account.getEmail())
                .claim("roles", List.of(account.getRole().name()))
                .claim("name", account.getDisplayName())
                .build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
        return new AuthResponse(token, "Bearer", account.getEmail(), account.getDisplayName(), account.getRole().name());
    }
}
