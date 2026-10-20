package com.civicpulse.user;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;

@Configuration
public class AdminBootstrap {
    @Bean
    ApplicationRunner initializeLocalAdmin(Environment environment, UserRepository users, PasswordEncoder encoder) {
        return args -> {
            String email = environment.getProperty("CIVICPULSE_ADMIN_EMAIL", "").trim();
            String password = environment.getProperty("CIVICPULSE_ADMIN_PASSWORD", "");
            String name = environment.getProperty("CIVICPULSE_ADMIN_NAME", "CivicPulse Administrator").trim();
            if (!StringUtils.hasText(email) && !StringUtils.hasText(password)) return;
            if (!StringUtils.hasText(email) || password.length() < 12) {
                throw new IllegalStateException("Set both CIVICPULSE_ADMIN_EMAIL and a CIVICPULSE_ADMIN_PASSWORD of at least 12 characters to initialize the local admin.");
            }
            String normalizedEmail = UserService.normalize(email);
            var existing = users.findByEmail(normalizedEmail);
            if (existing.isPresent()) {
                if (existing.get().getRole() != UserRole.ADMIN) {
                    throw new IllegalStateException("The configured admin email already belongs to a citizen account.");
                }
                return;
            }
            users.save(new UserAccount(name, normalizedEmail, encoder.encode(password), UserRole.ADMIN));
        };
    }
}
