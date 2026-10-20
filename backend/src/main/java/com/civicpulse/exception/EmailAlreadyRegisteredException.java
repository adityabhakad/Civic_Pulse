package com.civicpulse.exception;

public class EmailAlreadyRegisteredException extends RuntimeException {
    public EmailAlreadyRegisteredException() { super("An account already uses this email address."); }
}
