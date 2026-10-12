package com.example.finsage.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.finsage.model.ai.ChatRequest;
import com.example.finsage.service.ai.FinancialAssistantService;

/**
 * Finsage AI Financial Assistant chat endpoint.
 *
 * Follows the same pattern as the rest of the app's controllers: the signed-in
 * user comes from the JWT-authenticated Authentication object, never from the
 * request body — so a user can never ask "as" someone else.
 */
@RestController
@RequestMapping("/api/ai")
public class AIAssistantController {

    private static final Logger logger = LoggerFactory.getLogger(AIAssistantController.class);

    @Autowired
    private FinancialAssistantService assistantService;

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody ChatRequest request, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated"));
        }

        try {
            String reply = assistantService.chat(authentication.getName(), request.message());
            return ResponseEntity.ok(Map.of("response", reply));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("AI chat request failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "The AI assistant is temporarily unavailable. Please try again shortly."));
        }
    }
}
