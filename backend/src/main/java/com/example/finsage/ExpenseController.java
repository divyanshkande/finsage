package com.example.finsage;


import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.finsage.model.Expense;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;
    
   
    @Autowired
    private UserRepository userRepo;

    @PostMapping
    public ResponseEntity<?> addExpense(@RequestBody Expense expense, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
        }

        String email = authentication.getName();
        System.out.println("🔐 Adding expense for: " + email);

        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }

        expense.setUser(user);
        Expense saved = expenseService.addExpense(expense);
        System.out.println("✅ Saved expense: " + saved);

        return ResponseEntity.ok(saved);
    }
    
    @GetMapping
    public ResponseEntity<List<Expense>> getExpenses(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepo.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(expenseService.getAllExpenses(user));
    }


    @GetMapping("/today")
    public ResponseEntity<List<Expense>> getTodayExpenses(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepo.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(expenseService.getTodayExpenses(user));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Expense>> getAllExpenses(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepo.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(expenseService.getAllExpenses(user));
    }

//    @DeleteMapping("/{id}")
//    public ResponseEntity<?> delete(@PathVariable Long id, Authentication auth) {
//        String email = auth.getName();  // Extract logged-in user email from token
//        expenseService.deleteExpenseById(id, email);  
//        return ResponseEntity.ok("Deleted");
//    }

   

    @GetMapping("/filter")
    public ResponseEntity<List<Expense>> filterExpenses(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String date,
        Authentication authentication) {
        
        String email = authentication.getName();
        List<Expense> filtered = expenseService.filterExpenses(email, category, date);
        return ResponseEntity.ok(filtered);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteExpense(@PathVariable Long id, Authentication auth) {
        String email = auth.getName();
        expenseService.deleteExpenseById(id, email);
        return ResponseEntity.ok("Deleted successfully");
    }
    @GetMapping("/summary/category")
    public ResponseEntity<Map<String, Double>> getCategorySummary(Authentication auth) {
        String email = auth.getName();
        Map<String, Double> categoryData = expenseService.getCategoryWise(email);
        return ResponseEntity.ok(categoryData);
    }

    @GetMapping("/summary/monthly")
    public ResponseEntity<Map<String, Double>> getMonthlySummary(Authentication auth) {
        String email = auth.getName();
        Map<String, Double> monthlyData = expenseService.getMonthlyExpenses(email);
        return ResponseEntity.ok(monthlyData);
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getExpenseSummary(Authentication auth) {
        String email = auth.getName();
        Map<String, Object> summary = expenseService.getExpenseSummary(email);

        if (summary.containsKey("error")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(summary);
        }

        return ResponseEntity.ok(summary);
    }

    @PutMapping("/update-income")
    public ResponseEntity<String> updateIncome(Authentication authentication, @RequestParam double income) {
        String email = authentication.getName(); // <- From JWT
        String result = expenseService.updateIncome(email, income);
        if (result.equals("User not found")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }


}