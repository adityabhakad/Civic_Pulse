package com.civicpulse.exception;

public class ComplaintNotFoundException extends RuntimeException {
    public ComplaintNotFoundException(Long id) {
        super("Complaint not found with ID: " + id);
    }
}
