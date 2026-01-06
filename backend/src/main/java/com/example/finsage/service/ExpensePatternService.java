package com.example.finsage.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.finsage.model.ExpenseSuggestion;
import com.example.finsage.model.ExpenseSuggestionDTO;
import com.example.finsage.model.User;
import com.example.finsage.repository.ExpenseRepository;
import com.example.finsage.repository.ExpenseSuggestionRepository;
import com.example.finsage.repository.UserRepository;

@Service
public class ExpensePatternService {

    @Autowired
    private ExpenseRepository expenseRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ExpenseSuggestionRepository suggestionRepo;

    public ExpenseSuggestionDTO getTodaySuggestion(String email) {

        User user = userRepo.findByEmail(email).orElseThrow();
        LocalDate today = LocalDate.now();

        // 1️⃣ Check if suggestion already exists today
        Optional<ExpenseSuggestion> existing =
                suggestionRepo.findByEmailAndSuggestedDate(email, today);

        if (existing.isPresent()) {
            if (existing.get().getStatus() != ExpenseSuggestion.Status.PENDING) {
                return null;
            }
        }

        // 2️⃣ If expense already added today → no suggestion
        if (expenseRepo.existsByUserAndDate(user, today)) {
            return null;
        }

        // 3️⃣ Find top category
        List<Object[]> categories = expenseRepo.findMostUsedCategories(email);
        if (categories.isEmpty()) return null;

        String topCategory = categories.get(0)[0].toString();
        Double avgAmount =
                expenseRepo.findAverageAmountForCategory(email, topCategory);

        // 4️⃣ Save suggestion if not exists
        ExpenseSuggestion suggestion = existing.orElseGet(() -> {
            ExpenseSuggestion s = new ExpenseSuggestion();
            s.setEmail(email);
            s.setCategory(topCategory);
            s.setAmount(avgAmount);
            s.setSuggestedDate(today);
            s.setStatus(ExpenseSuggestion.Status.PENDING);
            return suggestionRepo.save(s);
        });

        return new ExpenseSuggestionDTO(
                suggestion.getCategory(),
                suggestion.getAmount(),
                "You often spend on " + suggestion.getCategory() + ". Want to add it today?"
        );
    }
}
