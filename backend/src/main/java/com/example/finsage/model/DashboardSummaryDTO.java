package com.example.finsage.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDTO {
    private double totalIncome;
    private double totalExpense;
    private double savings;
    private java.util.Map<String, Double> monthlyExpenses;
}
