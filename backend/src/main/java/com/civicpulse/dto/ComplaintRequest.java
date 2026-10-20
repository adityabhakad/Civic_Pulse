package com.civicpulse.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ComplaintRequest(
        @NotBlank(message = "Title is required") @Size(max = 100, message = "Title cannot exceed 100 characters") String title,
        @NotBlank(message = "Description is required") @Size(max = 500, message = "Description cannot exceed 500 characters") String description,
        @NotBlank(message = "Category is required") @Pattern(regexp = "Roads|Garbage|Water Supply|Electricity|Drainage|Other", message = "Choose a supported category") String category,
        @NotBlank(message = "Location is required") @Size(max = 150, message = "Location cannot exceed 150 characters") String location) {
}
