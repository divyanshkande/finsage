package com.example.finsage.service;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/**
 * Redis-backed JWT revocation blocklist.
 *
 * JWTs are stateless by design — the server doesn't normally track which ones are
 * "still valid" beyond their built-in expiry. That means logout (which just clears
 * the cookie client-side) can't actually invalidate a token: if someone has a copy
 * of it (stolen from a compromised browser, intercepted, etc.), it still works
 * until it naturally expires, even after the legitimate user has logged out.
 *
 * This service closes that gap: on logout, the token's unique ID (jti) is added
 * to a Redis blocklist with a TTL equal to the token's own remaining lifetime —
 * so the blocklist entry expires at exactly the same moment the token would have
 * expired anyway, and Redis never accumulates stale entries.
 */
@Service
public class TokenBlocklistService {

    private static final Logger logger = LoggerFactory.getLogger(TokenBlocklistService.class);
    private static final String PREFIX = "jwt:blocklist:";

    @Autowired
    private StringRedisTemplate redisTemplate;

    /** Revokes a token (by its jti) for the remainder of its natural lifetime. */
    public void revoke(String jti, Duration remainingValidity) {
        if (jti == null || remainingValidity == null || remainingValidity.isNegative() || remainingValidity.isZero()) {
            return; // already expired or nothing to revoke
        }
        try {
            redisTemplate.opsForValue().set(PREFIX + jti, "1", remainingValidity);
        } catch (Exception e) {
            logger.warn("Redis unavailable, could not add token to revocation blocklist: {}", e.getMessage());
        }
    }

    /**
     * Whether a token has been revoked. Fails OPEN (treats as "not revoked") if Redis
     * is unreachable — an outage shouldn't lock every logged-in user out of the app,
     * and the normal JWT expiry still bounds the exposure.
     */
    public boolean isRevoked(String jti) {
        if (jti == null) return false;
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(PREFIX + jti));
        } catch (Exception e) {
            logger.warn("Redis unavailable, skipping token revocation check: {}", e.getMessage());
            return false;
        }
    }
}
