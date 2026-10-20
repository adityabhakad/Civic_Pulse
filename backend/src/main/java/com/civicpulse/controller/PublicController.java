package com.civicpulse.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.civicpulse.dto.PublicStatsResponse;
import com.civicpulse.service.ComplaintService;

@RestController
@RequestMapping("/api/public")
public class PublicController {
    private final ComplaintService complaintService;
    public PublicController(ComplaintService complaintService) { this.complaintService = complaintService; }

    @GetMapping("/stats")
    public PublicStatsResponse stats() { return complaintService.getPublicStats(); }
}
