package com.example.finsage;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class LLamaParser implements AIParserService {

    // Use SAME OpenRouter API key you already use in other feature
    @Value("${openrouter.key:}")
    private String openrouterKey;

    private static final String OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
    private static final String MODEL = "meta-llama/llama-3.3-70b-instruct:free";

    private final ObjectMapper mapper = new ObjectMapper();
    private final OkHttpClient http = new OkHttpClient();

    @Override
    public Map<String, Object> parseTextToExpense(String rawText) {

        if (openrouterKey == null || openrouterKey.isBlank()) {
            return fallback(rawText, "Missing OpenRouter API Key");
        }

        try {
            // -------- PROMPT ----------
            String prompt = """
                    Convert the following OCR text into a JSON object.
                    MUST RETURN ONLY THIS JSON STRUCTURE:

                    {
                      "merchant": "",
                      "amount": 0,
                      "date": "YYYY-MM-DD",
                      "category": ""
                    }

                    Do NOT add explanations.  
                    Do NOT add extra text.

                    OCR TEXT:
                    %s
                    """.formatted(rawText);

            // -------- BUILD REQUEST ----------
            ObjectNode payload = mapper.createObjectNode();
            payload.put("model", MODEL);

            ArrayNode messages = mapper.createArrayNode();
            ObjectNode userMsg = mapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", prompt);
            messages.add(userMsg);

            payload.set("messages", messages);
            payload.put("max_tokens", 300);

            String bodyStr = mapper.writeValueAsString(payload);

            Request request = new Request.Builder()
                    .url(OPENROUTER_URL)
                    .addHeader("Authorization", "Bearer " + openrouterKey)
                    .addHeader("HTTP-Referer", "https://finsage.com")
                    .addHeader("X-Title", "Finsage OCR Parser")
                    .post(RequestBody.create(bodyStr, MediaType.parse("application/json")))
                    .build();

            // -------- EXECUTE ----------
            try (Response resp = http.newCall(request).execute()) {
                String respBody = resp.body().string();

                JsonNode root = mapper.readTree(respBody);

                String content = root.at("/choices/0/message/content").asText();

                JsonNode json = mapper.readTree(content);

                Map<String, Object> out = new HashMap<>();
                out.put("merchant", json.path("merchant").asText("Unknown"));
                out.put("amount", json.path("amount").asDouble(0.0));
                out.put("date", json.path("date").asText(LocalDate.now().toString()));
                out.put("category", json.path("category").asText("Other"));
                out.put("rawText", rawText);

                return out;
            }

        } catch (Exception e) {
            return fallback(rawText, e.getMessage());
        }
    }

    private Map<String, Object> fallback(String rawText, String error) {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("merchant", "Unknown");
        fallback.put("amount", 0.0);
        fallback.put("date", LocalDate.now().toString());
        fallback.put("category", "Other");
        fallback.put("rawText", rawText);
        fallback.put("error", error);
        return fallback;
    }
}
