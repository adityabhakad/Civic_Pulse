
package com.civicpulse.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.civicpulse.dto.AuthDtos.StatusRequest;
import com.civicpulse.dto.ComplaintRequest;
import com.civicpulse.dto.ComplaintResponse;
import com.civicpulse.service.ComplaintService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<ComplaintResponse> createComplaint(@Valid @RequestBody ComplaintRequest complaint,
            @AuthenticationPrincipal Jwt jwt) {

        ComplaintResponse savedComplaint = complaintService.createComplaint(complaint, jwt.getSubject());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedComplaint);
    }

    // READ ALL
    @GetMapping
    public ResponseEntity<java.util.List<ComplaintResponse>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaintsForAdmin());
    }

    @GetMapping("/mine")
    public ResponseEntity<java.util.List<ComplaintResponse>> getMyComplaints(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(complaintService.getComplaintsForCitizen(jwt.getSubject()));
    }

    // READ BY ID
    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        boolean admin = jwt.getClaimAsStringList("roles").contains("ADMIN");
        return ResponseEntity.ok(complaintService.getComplaintForUser(id, jwt.getSubject(), admin));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<ComplaintResponse> updateComplaint(@PathVariable Long id,
            @Valid @RequestBody ComplaintRequest complaint, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(complaintService.updateCitizenComplaint(id, complaint, jwt.getSubject()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(@PathVariable Long id,
            @Valid @RequestBody StatusRequest request) {
        return ResponseEntity.ok(complaintService.updateStatus(id, request.status()));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComplaint(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        boolean admin = jwt.getClaimAsStringList("roles").contains("ADMIN");
        complaintService.deleteComplaint(id, jwt.getSubject(), admin);

        return ResponseEntity.noContent().build();
    }
}
