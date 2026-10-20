package com.civicpulse.user;

import java.util.Locale;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.civicpulse.exception.EmailAlreadyRegisteredException;

@Service
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserAccount registerCitizen(String displayName, String email, String password) {
        String normalizedEmail = normalize(email);
        if (userRepository.existsByEmail(normalizedEmail)) throw new EmailAlreadyRegisteredException();
        return userRepository.save(new UserAccount(displayName.trim(), normalizedEmail,
                passwordEncoder.encode(password), UserRole.CITIZEN));
    }

    public UserAccount requireByEmail(String email) {
        return userRepository.findByEmail(normalize(email))
                .orElseThrow(() -> new UsernameNotFoundException("Account not found."));
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserAccount account = requireByEmail(email);
        return User.withUsername(account.getEmail())
                .password(account.getPasswordHash())
                .roles(account.getRole().name())
                .build();
    }

    public static String normalize(String email) { return email.trim().toLowerCase(Locale.ROOT); }
}
