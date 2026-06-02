package com.example.AuthSystem.Services.Security;

import com.example.AuthSystem.Entity.User;
import com.example.AuthSystem.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    private static final String KEY_PREFIX = "login:attempts:";
    private static final int    MAX_ATTEMPTS = 5;
    private static final long   LOCK_HOURS   = 24L;

    private final RedisTemplate<String, Integer> redisTemplate;
    private final UserRepository userRepository;

    // ── Called on FAILED login ────────────────────────────────────
    public void recordFailure(String email) {
        String key     = KEY_PREFIX + email.toLowerCase();
        Long   current = redisTemplate.opsForValue().increment(key);

        // Set TTL on first failure so the key auto-expires
        if (current != null && current == 1) {
            redisTemplate.expire(key, LOCK_HOURS, TimeUnit.HOURS);
        }

        if (current != null && current >= MAX_ATTEMPTS) {
            lockUser(email);
        }
    }

    // ── Called on SUCCESSFUL login ────────────────────────────────
    public void recordSuccess(String email) {
        redisTemplate.delete(KEY_PREFIX + email.toLowerCase());
        resetDbAttempts(email);
    }

    // ── Check if currently locked ─────────────────────────────────
    public boolean isLocked(String email) {
        return userRepository.findByEmail(email)
                .map(this::checkAndMaybeUnlock)
                .orElse(false);
    }

    // ── Auto-unlock after 24 h ────────────────────────────────────
    private boolean checkAndMaybeUnlock(User user) {
        if (!user.isAccountLocked()) return false;

        if (user.getLockTime() != null
                && user.getLockTime().plusHours(LOCK_HOURS).isBefore(LocalDateTime.now())) {
            unlockUser(user);
            return false;           // unlocked → allow login
        }
        return true;                // still locked
    }

    // ── Helpers ───────────────────────────────────────────────────
    private void lockUser(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setAccountLocked(true);
            user.setFailedLoginAttempts(MAX_ATTEMPTS);
            user.setLockTime((LocalDateTime.now()));
            userRepository.save(user);
        });
    }

    private void unlockUser(User user) {
        user.setAccountLocked(false);
        user.setFailedLoginAttempts(0);
        user.setLockTime(null);
        redisTemplate.delete(KEY_PREFIX + user.getEmail().toLowerCase());
        userRepository.save(user);
    }

    private void resetDbAttempts(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setFailedLoginAttempts(0);
            user.setAccountLocked(false);
            user.setLockTime(null);
            userRepository.save(user);
        });
    }
}
