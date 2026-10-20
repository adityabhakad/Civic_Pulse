package com.civicpulse.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() { }

    public record RegisterRequest(
            @NotBlank @Size(max = 100) String displayName,
            @NotBlank @Email @Size(max = 190) String email,
            @NotBlank @Size(min = 8, max = 72) String password) { }

    public record LoginRequest(
            @NotBlank @Email @Size(max = 190) String email,
            @NotBlank @Size(max = 72) String password) { }

    public record AuthResponse(String token, String tokenType, String email,
            String displayName, String role) { }

    public record StatusRequest(@NotBlank @jakarta.validation.constraints.Pattern(
            regexp = "PENDING|IN_PROGRESS|RESOLVED", message = "Status must be PENDING, IN_PROGRESS, or RESOLVED") String status) { }
}
