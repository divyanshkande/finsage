package com.example.finsage.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import jakarta.annotation.PostConstruct;

@Configuration
@Profile("prod")
public class ProductionValidationConfig {

    private static final Logger logger = LoggerFactory.getLogger(ProductionValidationConfig.class);

    @Value("${spring.datasource.url:}")
    private String dbUrl;

    @Value("${spring.datasource.username:}")
    private String dbUsername;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    @Value("${jwt.secret:}")
    private String jwtSecret;

    @Value("${spring.data.redis.host:}")
    private String redisHost;

    @Value("${spring.data.redis.port:}")
    private String redisPort;

    @Value("${spring.data.redis.password:}")
    private String redisPassword;

    @Value("${openrouter.key:}")
    private String openrouterKey;

    @Value("${app.frontend-url:}")
    private String frontendUrl;

    @PostConstruct
    public void validate() {
        StringBuilder missing = new StringBuilder();

        checkRequired("DB_URL (spring.datasource.url)", dbUrl, missing);
        checkRequired("DB_USERNAME", dbUsername, missing);
        checkRequired("DB_PASSWORD", dbPassword, missing);
        checkRequired("JWT_SECRET", jwtSecret, missing);
        checkRequired("REDIS_HOST", redisHost, missing);
        checkRequired("REDIS_PORT", redisPort, missing);
        checkRequired("REDIS_PASSWORD", redisPassword, missing);
        checkRequired("OPENROUTER_KEY", openrouterKey, missing);
        checkRequired("FRONTEND_URL (app.frontend-url)", frontendUrl, missing);

        if (missing.length() > 0) {
            String msg = "Missing required environment variables for production:\n" + missing;
            logger.error(msg);
            throw new IllegalStateException(msg);
        }

        if (jwtSecret != null) {
            try {
                byte[] decoded = java.util.Base64.getDecoder().decode(jwtSecret);
                if (decoded.length < 32) {
                    throw new IllegalStateException("JWT_SECRET must be at least 32 bytes when Base64 decoded (currently " + decoded.length + " bytes)");
                }
            } catch (IllegalArgumentException e) {
                throw new IllegalStateException("JWT_SECRET must be valid Base64", e);
            }
        }

        if (frontendUrl != null && !frontendUrl.startsWith("https://")) {
            logger.warn("FRONTEND_URL should use HTTPS in production: {}", frontendUrl);
        }

        logger.info("All production environment variables validated successfully");
    }

    private void checkRequired(String name, String value, StringBuilder missing) {
        if (value == null || value.trim().isEmpty()) {
            missing.append("  - ").append(name).append("\n");
        }
    }
}