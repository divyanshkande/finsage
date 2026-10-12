package com.example.finsage.service.ai;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FinancialAssistantService {

    private static final Logger logger = LoggerFactory.getLogger(FinancialAssistantService.class);

    private static final String SYSTEM_PROMPT = """
            You are the Finsage AI Financial Assistant, built into a personal finance app.
            You help the signed-in user understand their OWN spending, savings, and goals.

            Rules you must always follow:
            - Before answering any question about amounts, spending, savings, or goals,
              call the relevant tool to get the real numbers. Never guess or invent a number.
            - If a tool returns no data (e.g. no expenses, no goal by that name), say so
              plainly instead of making something up.
            - Keep answers short and conversational — a few sentences, not a report.
            - Use the ₹ symbol for money amounts.
            - You can only ever see and discuss the CURRENTLY SIGNED-IN user's data. You have
              no way to access any other user's information, and you must never claim to.
            - You are not a licensed financial advisor; keep suggestions practical and general
              (e.g. "consider reducing X"), not formal investment/legal/tax advice.
            """;

    private static final Duration CALL_TIMEOUT = Duration.ofSeconds(30);

    @Autowired
    private ChatClient chatClient;

    @Autowired
    private FinanceTools financeTools;

    public String chat(String conversationId, String userMessage) {
        if (userMessage == null || userMessage.isBlank()) {
            throw new IllegalArgumentException("Message cannot be empty.");
        }

        try {
            String content = chatClient.prompt()
                    .system(SYSTEM_PROMPT)
                    .user(userMessage)
                    .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
                    .tools(financeTools)
                    .call()
                    .content();

            return (content == null || content.isBlank())
                    ? "Sorry, I couldn't come up with an answer to that. Could you try rephrasing?"
                    : content;

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.error("AI assistant request failed: {}", e.getMessage());
            throw new RuntimeException("The AI assistant is temporarily unavailable. Please try again shortly.");
        }
    }
}
