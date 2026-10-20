package com.civicpulse.service;

import java.util.List;
import java.time.LocalDateTime;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.stereotype.Service;

import com.civicpulse.entity.Complaint;
import com.civicpulse.repository.ComplaintRepository;
import com.civicpulse.exception.ComplaintNotFoundException;
import com.civicpulse.exception.ForbiddenOperationException;
import com.civicpulse.dto.ComplaintResponse;
import com.civicpulse.dto.PublicStatsResponse;
import com.civicpulse.dto.ComplaintRequest;
import com.civicpulse.user.UserAccount;
import com.civicpulse.user.UserRepository;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public ComplaintService(ComplaintRepository complaintRepository, UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ComplaintResponse createComplaint(ComplaintRequest request, String citizenEmail) {
        UserAccount citizen = userRepository.findByEmail(citizenEmail)
                .orElseThrow(() -> new ComplaintNotFoundException(-1L));
        Complaint complaint = new Complaint();
        complaint.setTitle(request.title());
        complaint.setDescription(request.description());
        complaint.setCategory(request.category());
        complaint.setLocation(request.location());
        complaint.setCitizen(citizen);
        complaint.setStatus("PENDING");
        complaint.setSubmittedAt(LocalDateTime.now());
        return response(complaintRepository.save(complaint));
    }

    @Transactional
    public ComplaintResponse updateCitizenComplaint(Long id, ComplaintRequest request, String citizenEmail) {
        Complaint existing = getComplaintById(id);
        requireOwner(existing, citizenEmail);
        if (!"PENDING".equalsIgnoreCase(existing.getStatus())) {
            throw new ForbiddenOperationException("Only pending complaints can be edited by a citizen.");
        }
        existing.setTitle(request.title());
        existing.setDescription(request.description());
        existing.setCategory(request.category());
        existing.setLocation(request.location());
        return response(complaintRepository.save(existing));
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getAllComplaintsForAdmin() {
        return complaintRepository.findAllByOrderBySubmittedAtDesc().stream().map(this::response).toList();
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getComplaintsForCitizen(String email) {
        return complaintRepository.findAllByCitizen_EmailOrderBySubmittedAtDesc(email).stream().map(this::response).toList();
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintForUser(Long id, String email, boolean admin) {
        Complaint complaint = getComplaintById(id);
        if (!admin) requireOwner(complaint, email);
        return response(complaint);
    }

    @Transactional
    public ComplaintResponse updateStatus(Long id, String status) {
        Complaint complaint = getComplaintById(id);
        complaint.setStatus(status);
        return response(complaintRepository.save(complaint));
    }

    @Transactional
    public void deleteComplaint(Long id, String citizenEmail, boolean admin) {
        Complaint complaint = getComplaintById(id);
        if (!admin) {
            requireOwner(complaint, citizenEmail);
            if (!"PENDING".equalsIgnoreCase(complaint.getStatus())) {
                throw new ForbiddenOperationException("Only pending complaints can be deleted by a citizen.");
            }
        }
        complaintRepository.delete(complaint);
    }

    @Transactional(readOnly = true)
    public PublicStatsResponse getPublicStats() {
        return new PublicStatsResponse(complaintRepository.count(), complaintRepository.countByStatus("PENDING"),
                complaintRepository.countByStatus("IN_PROGRESS"), complaintRepository.countByStatus("RESOLVED"));
    }

    private Complaint getComplaintById(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ComplaintNotFoundException(id));
    }

    private void requireOwner(Complaint complaint, String email) {
        if (complaint.getCitizen() == null || !complaint.getCitizen().getEmail().equalsIgnoreCase(email)) {
            throw new ForbiddenOperationException("You can only access complaints you submitted.");
        }
    }

    private ComplaintResponse response(Complaint complaint) {
        String citizenName = complaint.getCitizen() == null ? null : complaint.getCitizen().getDisplayName();
        return new ComplaintResponse(complaint.getId(), complaint.getTitle(), complaint.getDescription(),
                complaint.getCategory(), complaint.getLocation(), complaint.getStatus(), complaint.getSubmittedAt(), citizenName);
    }
}
