package com.example.finsage;

import com.example.finsage.ExpenseService;
import com.example.finsage.UserRepository;
import com.example.finsage.model.Expense;
import com.example.finsage.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/ocr")
public class OCRController {

    @Autowired private ImagePreprocessor preprocessor;
    @Autowired private OCRService ocrService;
    @Autowired private AIParserService aiParser;
    @Autowired private ExpenseService expenseService;
    @Autowired private UserRepository userRepo;

    // Change this to any folder you want (absolute path recommended)
    @Value("${app.upload.dir:${user.dir}/uploads}")
    private String uploadDir;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> uploadAndParse(
            @RequestParam("file") MultipartFile file,
            @RequestParam("email") String email) throws Exception {

        // THIS IS THE ONLY PART THAT MATTERS — THE REST CAN STAY THE SAME
        Path uploadPath = Paths.get(uploadDir);

        // Create the directory if it doesn't exist (and all parent dirs)
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);  // ← this fixes the Tomcat temp folder bug forever
        }

        String originalName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(originalName);

        // This writes directly to your folder → bypasses Tomcat's broken temp folder
        file.transferTo(filePath.toFile());
        // END OF FIX

        // Rest of your perfect code (unchanged)
        String processedPath = preprocessor.preprocess(filePath.toString());

        String rawText = ocrService.extractText(processedPath);

        Map<String, Object> parsed = aiParser.parseTextToExpense(rawText);

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Expense expense = new Expense();
        expense.setUser(user);

        Object merchant = parsed.get("merchant");
        expense.setTitle(merchant == null ? "Expense" : merchant.toString());

        Object amountObj = parsed.get("amount");
        double amount = 0.0;
        if (amountObj instanceof Number) {
            amount = ((Number) amountObj).doubleValue();
        } else if (amountObj != null) {
            try { amount = Double.parseDouble(amountObj.toString()); } catch (Exception ignored) {}
        }
        expense.setAmount(amount);

        Object dateObj = parsed.get("date");
        if (dateObj instanceof LocalDate) {
            expense.setDate((LocalDate) dateObj);
        } else if (dateObj != null) {
            try {
                expense.setDate(LocalDate.parse(dateObj.toString()));
            } catch (Exception ex) {
                expense.setDate(LocalDate.now());
            }
        } else {
            expense.setDate(LocalDate.now());
        }

        Object cat = parsed.get("category");
        expense.setCategory(cat == null ? "Other" : cat.toString());

        expenseService.addExpense(expense);

        parsed.put("saved", true);
        parsed.put("rawText", rawText);
        parsed.put("processedImage", processedPath);
        parsed.put("originalImage", filePath.toString());

        return parsed;
    }
}