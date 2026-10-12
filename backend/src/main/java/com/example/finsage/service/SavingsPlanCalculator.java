package com.example.finsage.service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.finsage.model.SavingsRequest;
import com.example.finsage.model.SavingsResponse;

/**
 * Computes every numeric field of a savings plan deterministically in Java.
 *
 * Per the project's AI integration guidelines: the LLM must never be trusted to
 * calculate critical financial numbers (savings, remaining amount, goal amount,
 * monthly contribution, estimated months). It's used only afterward, to explain
 * these already-computed numbers in plain language (see SavingsAIService).
 *
 * The specific formulas below are simple, transparent rules of thumb — not
 * personalized investment advice — chosen so the numbers are always
 * traceable back to the user's own salary/expenses/goals, never invented.
 */
@Service
public class SavingsPlanCalculator {

    public SavingsResponse calculate(SavingsRequest req) {
        double salary = req.getSalary();
        double expenses = req.getExpenses();
        double monthlyCapacity = Math.max(0, salary - expenses);

        // Recommend saving ~20% of salary where the user can actually afford it,
        // never more than what's genuinely left over each month.
        double idealSavings = roundToNearest100(Math.min(monthlyCapacity, salary * 0.20));

        // 6 months of expenses is the standard emergency-fund rule of thumb;
        // fall back to a smaller, more realistic 3-month target if the user's
        // monthly savings capacity is very tight relative to their expenses.
        int emergencyFundMonths = (monthlyCapacity >= expenses * 0.10) ? 6 : 3;

        // Of the recommended monthly savings, keep ~30% liquid (emergency buffer)
        // and put ~70% toward SIP/goal investing.
        double sipAmount = roundToNearest100(idealSavings * 0.70);

        double safeToSpend = roundToNearest100(Math.max(0, salary - expenses - idealSavings));

        Map<String, Double> goals = Optional.ofNullable(req.getGoals()).orElse(Map.of());
        double totalGoalAmount = goals.values().stream().mapToDouble(Double::doubleValue).sum();

        // Allocate the SIP amount across goals proportionally to each goal's size,
        // then work out how many months that goal will take at its allocated rate.
        Map<String, Integer> goalTimelineMonths = new LinkedHashMap<>();
        for (Map.Entry<String, Double> goal : goals.entrySet()) {
            double amount = goal.getValue() == null ? 0 : goal.getValue();
            if (sipAmount <= 0 || totalGoalAmount <= 0 || amount <= 0) {
                goalTimelineMonths.put(goal.getKey(), 0);
                continue;
            }
            double share = amount / totalGoalAmount;
            double monthlyForThisGoal = sipAmount * share;
            int months = monthlyForThisGoal > 0 ? (int) Math.ceil(amount / monthlyForThisGoal) : 0;
            goalTimelineMonths.put(goal.getKey(), months);
        }

        int recommendedTimelineMonths = (sipAmount > 0 && totalGoalAmount > 0)
                ? (int) Math.ceil(totalGoalAmount / sipAmount)
                : 0;

        SavingsResponse response = new SavingsResponse();
        response.setIdealSavings(idealSavings);
        response.setSipAmount(sipAmount);
        response.setSafeToSpend(safeToSpend);
        response.setEmergencyFundMonths(emergencyFundMonths);
        response.setRecommendedTimelineMonths(recommendedTimelineMonths);
        response.setGoalTimelineMonths(goalTimelineMonths);
        return response;
    }

    private double roundToNearest100(double value) {
        return Math.round(value / 100.0) * 100.0;
    }
}
