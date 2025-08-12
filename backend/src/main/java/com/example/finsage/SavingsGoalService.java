package com.example.finsage;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

@Service
public class SavingsGoalService {

    private final SavingsGoalRepository repository;
    private final ExpenseRepository expenseRepository;

    public SavingsGoalService(SavingsGoalRepository repository, ExpenseRepository expenseRepository) {
        this.repository = repository;
        this.expenseRepository = expenseRepository;
    }

    public List<SavingsGoal> getGoals(String userEmail) {
        double totalIncome = expenseRepository.getTotalIncome(userEmail);
        double totalExpenses = expenseRepository.getTotalExpenses(userEmail);
        double savings = totalIncome - totalExpenses;

        List<SavingsGoal> userGoals = repository.findByUserEmailAndStatus(userEmail, "ACTIVE");

        List<SavingsGoal> completedGoals = userGoals.stream()
                .filter(goal -> savings >= goal.getAmount())
                .collect(Collectors.toList());

        if (!completedGoals.isEmpty()) {
            completedGoals.forEach(goal -> goal.setStatus("COMPLETED"));
            repository.saveAll(completedGoals);
        }

        return repository.findByUserEmailAndStatus(userEmail, "ACTIVE");
    }


    public SavingsGoal addGoal(SavingsGoal goal, String userEmail) {
        goal.setUserEmail(userEmail);
        return repository.save(goal);
    }

    public void deleteGoal(Long id, String userEmail) {
        SavingsGoal goal = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getUserEmail().equals(userEmail)) {
            throw new RuntimeException("Not authorized");
        }

        goal.setStatus("DELETED");
        repository.save(goal);
    }

}