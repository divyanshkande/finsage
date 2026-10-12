package com.example.finsage.service;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/**
 * Redis-backed login rate limiting.
 *
 * Blocks further login attempts once a threshold of failures is hit within a
 * time window, tracked per-email (protects a specific account from credential
 * stuffing) and per-IP (protects against spraying many emails from one source).
 *
 * If Redis is unreachable, fails OPEN (allows the login attempt through) rather
 * than locking every user out of the app because of an infra outage — logged
 * as a warning so it's visible in your ops/monitoring.
 */
@Service
public class LoginAttemptService {

    private static final Logger logger = LoggerFactory.getLogger(LoginAttemptService.class);

    private static final int MAX_ATTEMPTS_PER_EMAIL = 5;
    private static final int MAX_ATTEMPTS_PER_IP = 15; // looser — one IP may serve many legit users (NAT/office wifi)
    private static final Duration WINDOW = Duration.ofMinutes(10);

    @Autowired
    private StringRedisTemplate redisTemplate;

    private String emailKey(String email) {
        return "login:attempts:email:" + email.toLowerCase().trim();
    }

    private String ipKey(String ip) {
        return "login:attempts:ip:" + ip;
    }

    /** Throws if the given email or IP is currently locked out. Call BEFORE attempting auth. */
    public void assertNotLocked(String email, String ip) {
        try {
            int emailAttempts = currentCount(emailKey(email));
            int ipAttempts = currentCount(ipKey(ip));

            if (emailAttempts >= MAX_ATTEMPTS_PER_EMAIL || ipAttempts >= MAX_ATTEMPTS_PER_IP) {
                throw new TooManyAttemptsException(
                        "Too many failed login attempts. Please try again in a few minutes.");
            }
        } catch (TooManyAttemptsException e) {
            throw e;
        } catch (Exception e) {
            logger.warn("Redis unavailable for login rate limiting, allowing attempt through: {}", e.getMessage());
        }
    }

    /** Call after a failed login (wrong password, unknown email, etc). */
    public void recordFailure(String email, String ip) {
        try {
            increment(emailKey(email));
            increment(ipKey(ip));
        } catch (Exception e) {
            logger.warn("Redis unavailable for login rate limiting: {}", e.getMessage());
        }
    }

    /** Call after a successful login to clear the counters for that email/IP. */
    public void recordSuccess(String email, String ip) {
        try {
            redisTemplate.delete(emailKey(email));
            redisTemplate.delete(ipKey(ip));
        } catch (Exception e) {
            logger.warn("Redis unavailable for login rate limiting: {}", e.getMessage());
        }
    }

    private int currentCount(String key) {
        String val = redisTemplate.opsForValue().get(key);
        return val == null ? 0 : Integer.parseInt(val);
    }

    private void increment(String key) {
        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1L) {
            redisTemplate.expire(key, WINDOW);
        }
    }

    /** Thrown when a login is blocked due to too many recent failures. */
    public static class TooManyAttemptsException extends RuntimeException {
        public TooManyAttemptsException(String message) {
            super(message);
        }
    }
}
