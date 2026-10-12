package com.example.finsage.model;

import java.time.LocalDateTime;
import java.util.Map;

public class SavingsPlanHistoryDTO {

    private Long id;
    private LocalDateTime createdAt;
    private double salary;
    private double expenses;
    private Map<String, Double> goals;
    private SavingsResponse plan;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public double getSalary() { return salary; }
    public void setSalary(double salary) { this.salary = salary; }

    public double getExpenses() { return expenses; }
    public void setExpenses(double expenses) { this.expenses = expenses; }

    public Map<String, Double> getGoals() { return goals; }
    public void setGoals(Map<String, Double> goals) { this.goals = goals; }

    public SavingsResponse getPlan() { return plan; }
    public void setPlan(SavingsResponse plan) { this.plan = plan; }
}