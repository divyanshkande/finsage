package com.example.finsage.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.finsage.model.SavingsRequest;
import com.example.finsage.model.SavingsResponse;

/**
 * Robust SavingsAIService for OpenRouter chat completions.
 * - Defensive JSON parsing
 * - Rate-limited single-threaded executor (1 request per 1.2s)
 * - Configurable model & api key through application properties
 */
@Service
public class SavingsAIService implements DisposableBean {

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    @Value("${openrouter.key:#{null}}")
    private String apiKey;

    @Value("${openrouter.model:meta-llama/llama-3.3-70b-instruct:free}")
    private String modelName;

    // rate limit parameters
    private static final long MIN_MILLIS_BETWEEN_CALLS = 1200L;

    // Single-threaded executor to serialize calls + rate-limit
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "SavingsAIService-Worker");
        t.setDaemon(true);
        return t;
    });

    // Bookkeeping for rate limiting
    private volatile Instant lastCall = Instant.EPOCH;

    // Constructor left default (spring-managed)
    public SavingsAIService() {
    }

    /**
     * Public API — synchronous from caller perspective, but serialized + rate-limited under the hood.
     */
    public SavingsResponse generatePlan(SavingsRequest req) {
        // quick validation of apiKey
        if (apiKey == null || apiKey.isBlank() || apiKey.contains("YOUR_")) {
            throw new RuntimeException("OpenRouter API key missing! Set openrouter.key in application properties / env.");
        }

        CompletableFuture<SavingsResponse> future = new CompletableFuture<>();

        // task to call model
        Runnable task = () -> {
            try {
                SavingsResponse result = callModel(req);
                future.complete(result);
            } catch (Exception e) {
                future.completeExceptionally(e);
            }
        };

        long delay = Math.max(0L, MIN_MILLIS_BETWEEN_CALLS - Duration.between(lastCall, Instant.now()).toMillis());
        // schedule with computed delay to enforce rate limit
        scheduler.schedule(task, delay, TimeUnit.MILLISECONDS);
        // update lastCall preemptively to avoid bursts (approximate)
        lastCall = Instant.now().plusMillis(delay);

        try {
            // wait for the model result (adjust timeout as needed)
            return future.get(60, TimeUnit.SECONDS);
        } catch (ExecutionException ee) {
            throw new RuntimeException("AI failed: " + safeMessageFromException(ee.getCause()), ee.getCause());
        } catch (Exception e) {
            throw new RuntimeException("AI timed out or interrupted", e);
        }
    }

    /**
     * Build request, send to OpenRouter, parse and validate JSON response into SavingsResponse.
     */
    private SavingsResponse callModel(SavingsRequest req) throws Exception {
        // Build prompt safely
        String prompt = buildPrompt(req);

        JSONObject payload = new JSONObject();
        payload.put("model", modelName);

        // messages content as array-of-objects (type/text) — more compatible
        JSONArray messages = new JSONArray();
        JSONArray contentArray = new JSONArray();
        contentArray.put(new JSONObject().put("type", "text").put("text", prompt));
        messages.put(new JSONObject().put("role", "user").put("content", contentArray));
        payload.put("messages", messages);

        // sensible defaults
        payload.put("max_tokens", 1200);
        payload.put("temperature", 0.2);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://openrouter.ai/api/v1/chat/completions"))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .timeout(Duration.ofSeconds(60))
                .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        String body = response.body();

        // Basic HTTP error handling
        if (response.statusCode() >= 400) {
            throw new RuntimeException("OpenRouter HTTP " + response.statusCode() + ": " + body);
        }

        JSONObject respJson = new JSONObject(body);

        // OpenRouter error field
        if (respJson.has("error")) {
            String errMsg = respJson.getJSONObject("error").optString("message", body);
            throw new RuntimeException("OpenRouter Error: " + errMsg);
        }

        // Ensure choices exist
        if (!respJson.has("choices") || respJson.getJSONArray("choices").length() == 0) {
            throw new RuntimeException("No choices returned. Raw response: " + body);
        }

        // Try to extract the assistant content robustly
        String rawContent = extractContentStringFromChoice(respJson.getJSONArray("choices").getJSONObject(0));

        if (rawContent == null || rawContent.isBlank()) {
            throw new RuntimeException("AI returned empty content. Raw response: " + body);
        }

        // rawContent may contain leading text and then a JSON blob — extract JSON safely
        String jsonText = extractJsonText(rawContent);

        if (jsonText == null) {
            throw new RuntimeException("Failed to extract JSON object from model content. Model output:\n" + rawContent);
        }

        // Parse the jsonText to JSONObject
        JSONObject ai;
        try {
            ai = new JSONObject(jsonText);
        } catch (JSONException je) {
            throw new RuntimeException("Failed parsing AI JSON: " + je.getMessage() + "\nExtracted text:\n" + jsonText);
        }

        // Validate and map to SavingsResponse using safe defaults
        SavingsResponse out = new SavingsResponse();

        // *** USE setters instead of direct field access ***
        out.setIdealSavings(ai.optDouble("idealSavings", 0.0));
        out.setSipAmount(ai.optDouble("sipAmount", 0.0));
        out.setSafeToSpend(ai.optDouble("safeToSpend", 0.0));
        out.setEmergencyFundMonths(ai.optInt("emergencyFundMonths", 0)); // <-- now exists in SavingsResponse
        out.setRecommendedTimelineMonths(ai.optInt("recommendedTimelineMonths", 0));

        // goalTimelineMonths
        Map<String, Integer> goalMap = new HashMap<>();
        if (ai.has("goalTimelineMonths") && ai.get("goalTimelineMonths") instanceof JSONObject) {
            JSONObject g = ai.getJSONObject("goalTimelineMonths");
            for (String key : g.keySet()) {
                // try int, fallback to parsing number
                try {
                    goalMap.put(key, g.getInt(key));
                } catch (Exception e) {
                    // fallback parsing as double then cast
                    try {
                        goalMap.put(key, (int) Math.round(g.getDouble(key)));
                    } catch (Exception ex) {
                        // skip if unparsable
                    }
                }
            }
        }
        out.setGoalTimelineMonths(goalMap);

        // monthlyPlan
        List<String> monthly = new ArrayList<>();
        if (ai.has("monthlyPlan") && ai.get("monthlyPlan") instanceof JSONArray) {
            JSONArray arr = ai.getJSONArray("monthlyPlan");
            for (int i = 0; i < arr.length(); i++) {
                monthly.add(arr.optString(i, "").trim());
            }
        }
        out.setMonthlyPlan(monthly);

        // rawText - the friendly summary (we store the original rawContent to preserve model's summary)
        out.setRawText(rawContent.trim());

        return out;
    }

 private String buildPrompt(SavingsRequest req) {
    double salary = req.getSalary();
    double expenses = req.getExpenses();
    Map<String, Double> goalsMap = Optional.ofNullable(req.getGoals())
            .orElse(Map.of("General savings and emergency fund", 0.0));
    
    // Convert goals map to string for prompt
    StringBuilder goalsStr = new StringBuilder();
    for (Map.Entry<String, Double> entry : goalsMap.entrySet()) {
        goalsStr.append(entry.getKey()).append(": ₹").append(Math.round(entry.getValue())).append(", ");
    }
    if (goalsStr.length() > 2) goalsStr.setLength(goalsStr.length() - 2); // remove trailing ", "

    return String.format("""
        You are FinSage AI — a certified financial savings advisor with 15+ years of experience helping Indian users plan money wisely.

        Your task:
        Create a realistic, practical, and motivating savings plan personalized to the user based on the inputs below.

        User details:
        - Monthly take-home salary: ₹%.0f
        - Current monthly expenses: ₹%.0f
        - Savings or investment goals: %s

        Strict rules you MUST follow:
        1. Be friendly, positive, and non-judgmental. Explain like talking to a normal Indian user.
        2. Use simple Indian English — avoid jargon unless explained.
        3. Follow this exact priority: (1) Emergency fund → (2) Debt clearance → (3) Goals → (4) Wealth building.
        4. Recommend SIPs only in diversified equity/debt/index mutual funds. Never suggest individual stocks or high-risk instruments.
        5. Assume: 10–12%% annual equity returns, 7–8%% debt returns.
        6. Round all rupee amounts to the nearest ₹100.
        7. Always stay within realistic Indian financial standards and do not hallucinate numbers.
        8. NEVER add extra text, notes, analysis, or explanations outside the JSON.

        Important instructions for multiple goals:
        - Allocate monthly savings proportionally across all goals based on their amounts.
        - If total goals exceed remaining savings after emergency fund, suggest realistic timelines for each goal.
        - Include each goal in goalTimelineMonths with expected completion months.

        Output format:
        Return ONLY a clean JSON object with EXACTLY the following structure:
        {
          "idealSavings": 0,
          "sipAmount": 0,
          "safeToSpend": 0,
          "emergencyFundMonths": 0,
          "recommendedTimelineMonths": 0,
          "goalTimelineMonths": {},
          "monthlyPlan": [],
          "rawText": "..."
        }

        Make sure:
        - All keys exist.
        - Values are consistent with calculations.
        - goalTimelineMonths must be an object of goal → months.
        - monthlyPlan must be an array of 3–7 actionable steps.
        - rawText must be a warm, friendly, motivational summary written in first-person (FinSage).

        Output ONLY valid JSON. No other text.
        """, salary, expenses, goalsStr.toString());
}



    // Attempt to extract content string from choices entry (different models return different shapes)
    private String extractContentStringFromChoice(JSONObject choice) {
        // Try common paths without throwing
        try {
            // path 1: choices[].message.content (string)
            if (choice.has("message")) {
                JSONObject msg = choice.getJSONObject("message");
                // sometimes content is a string
                if (msg.has("content") && msg.get("content") instanceof String) {
                    return msg.getString("content");
                }
                // sometimes content is JSONObject or JSONArray
                if (msg.has("content")) {
                    Object contentObj = msg.get("content");
                    // if array of blocks
                    if (contentObj instanceof JSONArray) {
                        JSONArray arr = (JSONArray) contentObj;
                        // Join text pieces if present
                        StringBuilder sb = new StringBuilder();
                        for (int i = 0; i < arr.length(); i++) {
                            Object el = arr.get(i);
                            if (el instanceof JSONObject) {
                                JSONObject o = (JSONObject) el;
                                if (o.has("text")) sb.append(o.optString("text", ""));
                                else sb.append(o.toString());
                            } else {
                                sb.append(String.valueOf(el));
                            }
                            sb.append("\n");
                        }
                        return sb.toString().trim();
                    } else if (contentObj instanceof JSONObject) {
                        JSONObject contentJson = (JSONObject) contentObj;
                        // some models put text under 'text'
                        if (contentJson.has("text")) return contentJson.optString("text", "");
                        // else stringify
                        return contentJson.toString();
                    }
                }
            }

            // path 2: choices[].text (string)
            if (choice.has("text")) return choice.optString("text", null);

            // path 3: choices[].message -> choices[0].message -> content -> text
            // already covered above
        } catch (Exception ignored) {
        }
        return null;
    }

    // Attempt to extract a JSON substring from arbitrary text:
    // - Remove triple-backtick fences if present
    // - If still not JSON, find first '{' and last '}' and take substring
    private String extractJsonText(String raw) {
        if (raw == null) return null;
        String s = raw.trim();

        // remove fenced code blocks like ```json ... ``` or ``` ... ```
        if (s.contains("```")) {
            s = s.replaceAll("(?s)```[a-zA-Z]*\\n?", "");
            s = s.replaceAll("```", "");
            s = s.trim();
        }

        // If starts with { or [ assume it's JSON already
        if (s.startsWith("{") || s.startsWith("[")) {
            return s;
        }

        // Otherwise try to find first '{' and last '}' and extract
        int first = s.indexOf('{');
        int last = s.lastIndexOf('}');
        if (first >= 0 && last >= 0 && last > first) {
            return s.substring(first, last + 1).trim();
        }

        // No JSON found
        return null;
    }

    private String safeMessageFromException(Throwable t) {
        return t == null ? "unknown" : t.getMessage() == null ? t.toString() : t.getMessage();
    }

    @Override
    public void destroy() {
        // graceful shutdown
        scheduler.shutdownNow();
    }

}
