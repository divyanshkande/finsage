package com.example.finsage.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

/**
 * Spring AI wiring.
 *
 * ChatClient.Builder is auto-configured by spring-ai-starter-model-openai once an
 * OpenAiChatModel bean exists (see spring.ai.openai.* in application.properties,
 * which points at OpenRouter's OpenAI-compatible endpoint using your existing
 * OPENROUTER_KEY / OPENROUTER_MODEL). We just build a single shared ChatClient
 * from it here, with conversation memory attached as a default advisor.
 *
 * Memory: MessageWindowChatMemory is Spring AI's simplest built-in option — it
 * keeps the last N messages per conversation in memory (no new DB table, resets
 * on app restart). The AI Financial Assistant uses the signed-in user's email
 * as the conversation id, so each user's chat history stays isolated from every
 * other user's, and one user can never see another's conversation.
 */
@Configuration
public class SpringAiConfig {

    private static final Logger logger = LoggerFactory.getLogger(SpringAiConfig.class);

    // DIAGNOSTIC ONLY — logs exactly what model/base-url got resolved at startup,
    // so a wrong/stale .env value is obvious immediately instead of guessing from
    // an OpenRouter 404. Safe to remove once model config issues are sorted.
    @Value("${spring.ai.openai.chat.options.model:UNSET}")
    private String resolvedModel;

    @Value("${spring.ai.openai.base-url:UNSET}")
    private String resolvedBaseUrl;

    @Value("${openrouter.key:UNSET}")
    private String resolvedKeyPresence;

    @PostConstruct
    public void logResolvedAiConfig() {
        logger.info("=== Spring AI config resolved at startup ===");
        logger.info("  spring.ai.openai.base-url         = {}", resolvedBaseUrl);
        logger.info("  spring.ai.openai.chat.options.model = {}", resolvedModel);
        logger.info("  openrouter.key present?           = {}", !"UNSET".equals(resolvedKeyPresence) && !resolvedKeyPresence.isBlank());
        logger.info("==============================================");
    }

    @Bean
    public ChatMemory chatMemory() {
        return MessageWindowChatMemory.builder()
                .maxMessages(20)
                .build();
    }

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder, ChatMemory chatMemory) {
        return builder
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();
    }
}
