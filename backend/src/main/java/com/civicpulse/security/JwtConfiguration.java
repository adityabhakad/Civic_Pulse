package com.civicpulse.security;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

@Configuration
public class JwtConfiguration {
    private static final Logger log = LoggerFactory.getLogger(JwtConfiguration.class);

    @Bean
    SecretKey jwtSecretKey(Environment environment) {
        String configured = environment.getProperty("CIVICPULSE_JWT_SECRET", "");
        byte[] secret;
        if (configured.isBlank()) {
            secret = new byte[32];
            new SecureRandom().nextBytes(secret);
            log.warn("No CIVICPULSE_JWT_SECRET configured. Using a temporary local key; tokens will expire when this app restarts.");
        } else {
            secret = configured.getBytes(StandardCharsets.UTF_8);
            if (secret.length < 32) {
                throw new IllegalStateException("CIVICPULSE_JWT_SECRET must contain at least 32 characters.");
            }
        }
        return new SecretKeySpec(secret, "HmacSHA256");
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKey jwtSecretKey) {
        return NimbusJwtEncoder.withSecretKey(jwtSecretKey).algorithm(MacAlgorithm.HS256).build();
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey jwtSecretKey) {
        return NimbusJwtDecoder.withSecretKey(jwtSecretKey).macAlgorithm(MacAlgorithm.HS256).build();
    }
}
