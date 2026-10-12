package com.example.finsage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis configuration.
 *
 * Two ways this is used elsewhere in the app:
 *  - StringRedisTemplate (auto-configured by Spring Boot once spring-boot-starter-data-redis
 *    is on the classpath) — used for simple string/counter values: login rate limiting
 *    (LoginAttemptService) and the JWT revocation blocklist (TokenBlocklistService).
 *  - RedisTemplate<String, Object> (defined below) — used for caching whole Java objects
 *    (e.g. parsed OCR results, AI-generated savings plans) as JSON, so repeated identical
 *    requests don't re-hit the paid OpenRouter API.
 *
 * Connection settings (host/port/password) come from spring.data.redis.* properties,
 * which are populated from REDIS_HOST / REDIS_PORT / REDIS_PASSWORD in your .env
 * (see DotenvEnvironmentPostProcessor). Defaults to localhost:6379 with no password,
 * which is what a local `docker run -p 6379:6379 redis` or a local Redis install gives you.
 */
@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        StringRedisSerializer keySerializer = new StringRedisSerializer();
        GenericJackson2JsonRedisSerializer valueSerializer = new GenericJackson2JsonRedisSerializer();

        template.setKeySerializer(keySerializer);
        template.setHashKeySerializer(keySerializer);
        template.setValueSerializer(valueSerializer);
        template.setHashValueSerializer(valueSerializer);
        template.afterPropertiesSet();

        return template;
    }
}
