package com.civicpulse.dto;

import java.time.LocalDateTime;

public record ComplaintResponse(Long id, String title, String description, String category,
        String location, String status, LocalDateTime submittedAt, String citizenName) {
}
