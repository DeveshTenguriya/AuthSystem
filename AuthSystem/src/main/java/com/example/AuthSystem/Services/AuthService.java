package com.example.AuthSystem.Services;

import com.example.AuthSystem.Config.JwtServices;
import com.example.AuthSystem.DTO.AuthResponse;
import com.example.AuthSystem.DTO.LoginRequest;
import com.example.AuthSystem.Entity.User;
import com.example.AuthSystem.Repository.UserRepository;
import com.example.AuthSystem.Services.Security.LoginAttemptService;
import jakarta.security.auth.message.AuthException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.security.auth.login.AccountLockedException;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtServices jwtService;
    private final LoginAttemptService loginAttemptService;

    public AuthResponse login(LoginRequest request) throws AccountLockedException, AuthException {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("Invalid credentials"));

        // ── 1. Check lock status (auto-unlocks if 24 h elapsed) ──
        if (loginAttemptService.isLocked(user.getEmail())) {
            throw new AccountLockedException(
                    "Account locked after too many failed attempts. " +
                            "Try again after 24 hours."
            );
        }

        // ── 2. Validate password ──────────────────────────────────
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            loginAttemptService.recordFailure(user.getEmail());

            int remaining = 5 - getAttemptCount(user.getEmail());
            throw new AuthException(
                    remaining > 0
                            ? "Invalid credentials. " + remaining + " attempt(s) remaining."
                            : "Account is now locked for 24 hours."
            );
        }

        // ── 3. Success ────────────────────────────────────────────
        loginAttemptService.recordSuccess(user.getEmail());
        String token = jwtService.generateToken(user);
        String accessToken = jwtService.generateToken(user);
        String role = user.getRoles()
                .stream()
                .findFirst()
                .map(r -> r.getName())
                .orElse("ROLE_USER");
        return new AuthResponse( accessToken,
                null,
                role,
                user.getEmail());
    }

    private int getAttemptCount(String email) {
        return userRepository.findByEmail(email)
                .map(User::getFailedLoginAttempts)
                .orElse(0);
    }
}
