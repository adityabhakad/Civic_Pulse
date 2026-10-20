package com.civicpulse.dto;

public record PublicStatsResponse(long total, long pending, long inProgress, long resolved) {
}
