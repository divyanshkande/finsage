package com.example.finsage.service;

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

    @Value("${openrouter.key:}")
    private String openrouterKey;

    @Value("${openrouter.model}")
    private String model;

    @Value("${openrouter.url}")
    private String openrouterUrl;
    private final ObjectMapper mapper = new ObjectMapper();
    private final OkHttpClient http = new OkHttpClient();

    @Override
    public Map<String, Object> parseTextToExpense(String rawText) {

        if (openrouterKey == null || openrouterKey.isBlank()) {
            return fallback(rawText, "Missing OpenRouter API Key");
        }

        try {
            String prompt = """
            Convert the following OCR text into a JSON object.
            MUST RETURN ONLY THIS JSON:

            {
              "description": "",
              "amount": 0,
              "date": "YYYY-MM-DD",
              "category": ""
            }

            Rules:
            - description = short summary (shop + item)
            - category = Food, Travel, Shopping, Rent, Grocery, Other
            - amount = final payable amount only

            OCR TEXT:
            %s
            """.formatted(rawText);

            ObjectNode payload = mapper.createObjectNode();
            payload.put("model", model);

            ArrayNode messages = mapper.createArrayNode();
            ObjectNode userMsg = mapper.createObjectNode();
            userMsg.put("role", "user");
            userMsg.put("content", prompt);
            messages.add(userMsg);

            payload.set("messages", messages);
            payload.put("max_tokens", 300);

            Request request = new Request.Builder()
                    .url(openrouterUrl)
                    .addHeader("Authorization", "Bearer " + openrouterKey)
                    .addHeader("HTTP-Referer", "https://finsage.com")
                    .addHeader("X-Title", "Finsage OCR Parser")
                    .post(RequestBody.create(
                            mapper.writeValueAsString(payload),
                            MediaType.parse("application/json")
                    ))
                    .build();

            try (Response resp = http.newCall(request).execute()) {

                JsonNode root = mapper.readTree(resp.body().string());
                String content = root.at("/choices/0/message/content").asText();
                JsonNode json = mapper.readTree(content);

                Map<String, Object> out = new HashMap<>();
                out.put("description", json.path("description").asText("Expense"));
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
        fallback.put("description", "Expense");
        fallback.put("amount", 0.0);
        fallback.put("date", LocalDate.now().toString());
        fallback.put("category", "Other");
        fallback.put("rawText", rawText);
        fallback.put("error", error);
        return fallback;
    }
}
