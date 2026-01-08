package com.example.finsage.controller;

import com.example.finsage.model.Expense;
import com.example.finsage.model.User;
import com.example.finsage.repository.UserRepository;
import com.example.finsage.service.AIParserService;
import com.example.finsage.service.ExpenseService;
import com.example.finsage.service.ImagePreprocessor;
import com.example.finsage.service.OCRService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/ocr")
@CrossOrigin(
        origins = "http://localhost:3000",
        allowCredentials = "true"
)
public class OCRController {

    @Autowired private ImagePreprocessor preprocessor;
    @Autowired private OCRService ocrService;
    @Autowired private AIParserService aiParser;
    @Autowired private ExpenseService expenseService;
    @Autowired private UserRepository userRepo;

    @Value("${app.upload.dir:${user.dir}/uploads}")
    private String uploadDir;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> uploadAndParse(
            @RequestParam("file") MultipartFile file,
            Authentication authentication   // ✅ FROM JWT
    ) throws Exception {

        //  Extract email securely from JWT
        String email = authentication.getName();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Ensure upload directory exists
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String originalName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(originalName);
        file.transferTo(filePath.toFile());

        // OCR pipeline
        String processedPath = preprocessor.preprocess(filePath.toString());
        String rawText = ocrService.extractText(processedPath);

        // AI parsing
        Map<String, Object> parsed = aiParser.parseTextToExpense(rawText);

        Expense expense = new Expense();
        expense.setUser(user);

        // TITLE / MERCHANT
        String title = parsed.getOrDefault("title", "").toString();
        if (title.isBlank()) {
            String[] lines = rawText.split("\\R");
            title = lines.length > 0 ? lines[0].trim() : "OCR Expense";
        }
        title = title.replaceAll("^\\d+\\s*", "");
        expense.setTitle(title);

        // DESCRIPTION
        expense.setDescription(parsed.getOrDefault("description", "Expense").toString());

        // AMOUNT
        double amount = 0.0;
        Object amountObj = parsed.get("amount");
        if (amountObj instanceof Number) amount = ((Number) amountObj).doubleValue();
        else if (amountObj != null) {
            try { amount = Double.parseDouble(amountObj.toString()); } catch (Exception ignored) {}
        }
        expense.setAmount(amount);

        // DATE (AI preferred → OCR → fallback today)
        String extractedDate = parsed.getOrDefault("date", "").toString();
        if (extractedDate.isBlank()) extractedDate = extractDateFromText(rawText);
        expense.setDate(parseDateSmart(extractedDate));

        // CATEGORY (AI preferred → keyword fallback)
        String category = parsed.getOrDefault("category", "").toString();
        if (category.isBlank()) category = classifyCategory(rawText);
        expense.setCategory(category);

      
        parsed.put("rawText", rawText);
        parsed.put("processedImage", processedPath);
        parsed.put("originalImage", filePath.toString());
        parsed.put("finalTitle", title);
        parsed.put("finalCategory", category);
        parsed.put("finalDate", expense.getDate());
        parsed.put("merchant", title);

        return parsed;
    }

    // ======= HELPERS =======

    private LocalDate parseDateSmart(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return LocalDate.now();

        try { return LocalDate.parse(dateStr); } catch (Exception ignored) {}

        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("M/d/yyyy");
            return LocalDate.parse(dateStr, formatter);
        } catch (Exception ignored) {}

        return LocalDate.now();
    }

    private String extractDateFromText(String text) {
        if (text == null) return null;
        Pattern pattern = Pattern.compile("(\\d{1,2}/\\d{1,2}/\\d{4})");
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group(1) : null;
    }

    private String classifyCategory(String text) {
        if (text == null) return "Other";
        String t = text.toLowerCase();

        if (t.contains("restaurant") || t.contains("cafe") || t.contains("bar")
                || t.contains("noodles") || t.contains("pizza") || t.contains("dine")) return "Food";

        if (t.contains("uber") || t.contains("ola") || t.contains("flight")
                || t.contains("train") || t.contains("bus") || t.contains("petrol") || t.contains("fuel")) return "Travel";

        if (t.contains("amazon") || t.contains("flipkart") || t.contains("mall")
                || t.contains("store") || t.contains("invoice") || t.contains("qty")) return "Shopping";

        if (t.contains("electricity") || t.contains("water") || t.contains("broadband")
                || t.contains("recharge")) return "Utilities";

        if (t.contains("hospital") || t.contains("pharmacy") || t.contains("doctor")) return "Medical";

        if (t.contains("movie") || t.contains("cinema") || t.contains("ticket")) return "Entertainment";

        return "Other";
    }
}
