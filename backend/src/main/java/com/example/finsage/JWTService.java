package com.example.finsage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.github.cdimascio.dotenv.Dotenv;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JWTService {

    private static final Logger logger = LoggerFactory.getLogger(JWTService.class);

    private static final Dotenv dotenv = Dotenv.configure()
            .ignoreIfMissing() // prevent crash if .env is not found
            .load();

    private static final String secretKey = dotenv.get("JWT_SECRET");

    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 30; // 30 hours

    public JWTService() {
        if (secretKey == null || secretKey.trim().isEmpty()) {
            logger.error("JWT_SECRET not found in .env file. Please set it.");
            throw new IllegalArgumentException("JWT secret key is required.");
        }

        // Optional: Print first 10 chars to confirm loading
        logger.info("JWTService initialized. Secret key length: {}", secretKey.length());
    }

    public String generateToken(String email) {
        Map<String, Object> claims = new HashMap<>();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String email = extractEmail(token);
        return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        final Date expiration = extractClaim(token, Claims::getExpiration);
        return expiration.before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private SecretKey getKey() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(secretKey);

            if (keyBytes.length < 32) {
                logger.error("Decoded JWT_SECRET is too short. Needs at least 32 bytes.");
                throw new IllegalArgumentException("Secret key must be at least 32 bytes when Base64 decoded.");
            }

            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            logger.error("Invalid JWT secret key. Must be valid Base64 and at least 32 bytes. Error: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid JWT secret key.", e);
        }
    }
}
