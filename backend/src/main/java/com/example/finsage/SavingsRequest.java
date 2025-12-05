package com.example.finsage;
import java.util.Map;
public class SavingsRequest {
    private double salary;
    private double expenses;
    private Map<String, Double> goals; // ex: {"Laptop": 60000, "Trip":25000}

    // getters & setters
    public double getSalary() { return salary; }
    public void setSalary(double salary) { this.salary = salary; }
    public double getExpenses() { return expenses; }
    public void setExpenses(double expenses) { this.expenses = expenses; }
    public Map<String, Double> getGoals() { return goals; }
    public void setGoals(Map<String, Double> goals) { this.goals = goals; }
    
}
