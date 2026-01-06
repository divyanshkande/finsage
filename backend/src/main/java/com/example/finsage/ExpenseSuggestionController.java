package com.example.finsage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/api/suggestions")
public class ExpenseSuggestionController {

    @Autowired
    private ExpensePatternService patternService;

    @GetMapping("/today")
    public ResponseEntity<?> getSuggestion(Authentication authentication) {

        String email = authentication.getName(); // 🔐 From JWT

        ExpenseSuggestionDTO suggestion =
                patternService.getTodaySuggestion(email);

        if (suggestion == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(suggestion);
    }

}
