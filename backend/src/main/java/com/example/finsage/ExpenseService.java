package com.example.finsage;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.finsage.model.Expense;
@Service
public class ExpenseService {
	@Autowired
    private ExpenseRepository expenseRepo;
	
	 @Autowired
	    private UserRepository userRepo;

    public Expense addExpense(Expense expense) {
        return expenseRepo.save(expense);
    }

    public List<Expense> getTodayExpenses(User user) {
        return expenseRepo.findByUserAndDate(user, LocalDate.now());
    }

    public List<Expense> getAllExpenses(User user) {
        return expenseRepo.findByUser(user);
    }

//    public void deleteExpense(Long id) {
//        expenseRepo.deleteById(id);
//    }

	public Map<String, Object> getExpenseSummary(String email) {
        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) {
            return Map.of("error", "User not found");
        }

        User user = userOpt.get();
        List<Expense> expenses = expenseRepo.findByUser(user);

        double totalIncome = user.getIncome();
        double totalExpenses = expenses.stream().mapToDouble(Expense::getAmount).sum();
        double savings = totalIncome - totalExpenses;

        Map<String, Double> categoryWise = new HashMap<>();
        for (Expense exp : expenses) {
            categoryWise.put(
                exp.getCategory(),
                categoryWise.getOrDefault(exp.getCategory(), 0.0) + exp.getAmount()
            );
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpenses", totalExpenses);
        summary.put("savings", savings);
        summary.put("categoryWise", categoryWise);
        summary.put("expenses", expenses); // Optional: full list

        return summary;
    }
	
	// For category-wise chart (like Pie chart)
	public Map<String, Double> getCategoryWise(String email) {
	    List<Expense> expenses = expenseRepo.findByUserEmail(email);
	    return expenses.stream()
	        .collect(Collectors.groupingBy(
	            Expense::getCategory,
	            Collectors.summingDouble(Expense::getAmount)
	        ));
	}

	// For monthly chart (like Bar chart)
	public Map<String, Double> getMonthlyExpenses(String email) {
	    List<Expense> expenses = expenseRepo.findByUserEmail(email);
	    return expenses.stream()
	        .collect(Collectors.groupingBy(
	            e -> e.getDate().toString().substring(0, 7),  // "YYYY-MM"
	            Collectors.summingDouble(Expense::getAmount)
	        ));
	}

	// For deleting a specific expense by ID
	public void deleteExpenseById(Long id, String email) {
	    Expense expense = expenseRepo.findById(id).orElseThrow(() -> new RuntimeException("Expense not found"));
	    
	    if (!expense.getUser().getEmail().equals(email)) {
	        throw new RuntimeException("Unauthorized delete attempt");
	    }

	    expenseRepo.deleteById(id);
	}

	
	public String updateIncome(String email, double income) {
        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) {
            return "User not found";
        }

        User user = userOpt.get();
        user.setIncome(income);
        userRepo.save(user);

        return "Income updated successfully";
    }

	public List<Expense> filterExpenses(String email, String category, String dateStr) {
        List<Expense> all = expenseRepo.findByUserEmail(email);

        return all.stream()
                .filter(e -> (category == null || e.getCategory().equalsIgnoreCase(category)) &&
                             (dateStr == null || e.getDate().toString().equals(dateStr)))
                .collect(Collectors.toList());
    }
}