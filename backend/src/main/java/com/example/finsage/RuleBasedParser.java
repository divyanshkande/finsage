package com.example.finsage;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Primary
public class RuleBasedParser implements AIParserService {

    private static final Pattern AMOUNT_PATTERN = Pattern.compile("(\\d{1,7}[.,]\\d{1,2})");
    private static final Pattern DATE_PATTERN = Pattern.compile("(\\d{2}[/-]\\d{2}[/-]\\d{4})");

    @Override
    public Map<String, Object> parseTextToExpense(String rawText) {
        Map<String, Object> out = new HashMap<>();
        out.put("rawText", rawText);

        // Merchant/title = first non-empty line
        String merchant = Arrays.stream(rawText.split("\\r?\\n"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .findFirst().orElse("Unknown Merchant");
        out.put("merchant", merchant);

        // Amount: try to find the largest number that could be total
        Matcher m = AMOUNT_PATTERN.matcher(rawText.replaceAll(",", ""));
        double max = 0.0;
        while (m.find()) {
            String s = m.group(1).replaceAll(",", "");
            try {
                double v = Double.parseDouble(s);
                if (v > max) max = v;
            } catch (NumberFormatException ignored) {}
        }
        out.put("amount", max);

        // Date
        Matcher d = DATE_PATTERN.matcher(rawText);
        if (d.find()) {
            String ds = d.group(1);
            try {
                DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                if (ds.contains("-")) fmt = DateTimeFormatter.ofPattern("dd-MM-yyyy");
                LocalDate date = LocalDate.parse(ds, fmt);
                out.put("date", date);
            } catch (Exception e) {
                out.put("date", LocalDate.now());
            }
        } else {
            out.put("date", LocalDate.now());
        }

        // Category: simple keyword mapping
        String lower = rawText.toLowerCase();
        String category = "Other";
        if (containsAny(lower, "food", "restaurant", "swiggy", "zomato", "pizza", "cafe", "dine")) category = "Food";
        else if (containsAny(lower, "uber", "ola", "taxi", "bus", "train", "fuel", "petrol")) category = "Transport";
        else if (containsAny(lower, "amazon", "flipkart", "myntra", "shopping", "snapdeal", "ajio")) category = "Shopping";
        else if (containsAny(lower, "pharmacy", "chemist", "clinic", "hospital")) category = "Medical";

        out.put("category", category);

        return out;
    }

    private boolean containsAny(String text, String... tokens) {
        for (String t : tokens) if (text.contains(t)) return true;
        return false;
    }
}
