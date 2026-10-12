package com.example.finsage.service.ai;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.example.finsage.model.Events;
import com.example.finsage.model.Expense;
import com.example.finsage.model.SavingsGoal;
import com.example.finsage.model.User;
import com.example.finsage.repository.UserRepository;
import com.example.finsage.service.EventService;
import com.example.finsage.service.ExpenseService;
import com.example.finsage.service.SavingsGoalService;

/**
 * Controlled, read-only tools the AI assistant is allowed to call.
 *
 * SECURITY: every method here resolves the CURRENT user from Spring Security's
 * SecurityContextHolder — the same identity established by the existing JwtFilter
 * for every other authenticated request in this app. No method accepts a userId
 * or email as a parameter, so the LLM has no way to ask for another user's data
 * even if a malicious prompt tried to trick it into doing so.
 *
 * Every tool delegates to an EXISTING service (ExpenseService, EventService,
 * SavingsGoalService) rather than querying repositories directly — no new
 * database logic is introduced here, only new read-only views over data that
 * already flows through the app's normal, already-tested code paths.
 */
@Component
public class FinanceTools {

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private EventService eventService;

    @Autowired
    private SavingsGoalService savingsGoalService;

    @Autowired
    private UserRepository userRepository;

    private String currentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("No authenticated user for this request");
        }
        return auth.getName();
    }

    private Authentication currentAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new IllegalStateException("No authenticated user for this request");
        }
        return auth;
    }

    private User currentUser() {
        return userRepository.findByEmail(currentUserEmail())
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    @Tool(description = "Get the current signed-in user's monthly income as set in their profile")
    public double getMonthlyIncome() {
        return currentUser().getIncome();
    }

    @Tool(description = "Get the current signed-in user's total recorded expenses and overall savings (income minus expenses)")
    public Map<String, Object> getExpenseSummary() {
        return expenseService.getExpenseSummary(currentUserEmail());
    }

    @Tool(description = "Get the current signed-in user's expenses broken down by category (e.g. Food, Travel, Rent), with the total amount spent in each")
    public Map<String, Double> getExpensesByCategory() {
        return expenseService.getCategoryWise(currentUserEmail());
    }

    @Tool(description = "Get the current signed-in user's total expenses grouped by month (format YYYY-MM), useful for comparing spending across months")
    public Map<String, Double> getMonthlyExpenseTotals() {
        return expenseService.getMonthlyExpenses(currentUserEmail());
    }

    @Tool(description = "Get the current signed-in user's most recent expenses, most recent first")
    public List<Map<String, Object>> getRecentExpenses(
            @ToolParam(description = "How many recent expenses to return, default 10 if not specified") Integer limit) {
        int n = (limit == null || limit <= 0) ? 10 : limit;
        List<Expense> expenses = expenseService.getAllExpenses(currentUserEmail());
        return expenses.stream()
                .sorted(Comparator.comparing(Expense::getDate).reversed())
                .limit(n)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("title", e.getTitle());
                    m.put("category", e.getCategory());
                    m.put("amount", e.getAmount());
                    m.put("date", e.getDate() != null ? e.getDate().toString() : null);
                    return m;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @Tool(description = "Get the category the current signed-in user has spent the most money on overall")
    public Map<String, Object> getHighestSpendingCategory() {
        Map<String, Double> byCategory = expenseService.getCategoryWise(currentUserEmail());
        if (byCategory.isEmpty()) {
            return Map.of("category", "none", "amount", 0.0);
        }
        Map.Entry<String, Double> top = byCategory.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .orElseThrow();
        return Map.of("category", top.getKey(), "amount", top.getValue());
    }

    @Tool(description = "Get the current signed-in user's total current savings (total income minus total expenses)")
    public double getCurrentSavings() {
        Map<String, Object> summary = expenseService.getExpenseSummary(currentUserEmail());
        Object savings = summary.get("savings");
        return savings instanceof Number ? ((Number) savings).doubleValue() : 0.0;
    }

    @Tool(description = "Get all of the current signed-in user's active savings goals with their target amounts")
    public List<Map<String, Object>> getGoals() {
        List<SavingsGoal> goals = savingsGoalService.getGoals(currentUserEmail());
        List<Map<String, Object>> out = new ArrayList<>();
        for (SavingsGoal g : goals) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", g.getId());
            m.put("name", g.getName());
            m.put("targetAmount", g.getAmount());
            m.put("status", g.getStatus());
            out.add(m);
        }
        return out;
    }

    @Tool(description = "Get progress toward one specific savings goal by its name (e.g. 'Laptop'), including current savings, remaining amount, and progress percentage")
    public Map<String, Object> getGoalProgress(
            @ToolParam(description = "The exact name of the goal, as the user created it") String goalName) {
        if (goalName == null || goalName.isBlank()) {
            return Map.of("found", false, "message", "No goal name was given.");
        }

        List<SavingsGoal> goals = savingsGoalService.getGoals(currentUserEmail());
        SavingsGoal match = goals.stream()
                .filter(g -> g.getName() != null && g.getName().equalsIgnoreCase(goalName.trim()))
                .findFirst()
                .orElse(null);

        if (match == null) {
            return Map.of("found", false, "message", "No active goal named '" + goalName + "' was found.");
        }

        double currentSavings = getCurrentSavings();
        double remaining = Math.max(0, match.getAmount() - currentSavings);
        double progressPercent = match.getAmount() > 0
                ? Math.min(100.0, (currentSavings / match.getAmount()) * 100.0)
                : 0.0;

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("found", true);
        out.put("goalName", match.getName());
        out.put("targetAmount", match.getAmount());
        out.put("currentSavings", currentSavings);
        out.put("remaining", remaining);
        out.put("progressPercent", Math.round(progressPercent * 10) / 10.0);
        return out;
    }

    @Tool(description = "Get all events (e.g. trips, celebrations) the current signed-in user has created, with each event's budget and amount spent")
    public List<Map<String, Object>> getEvents() {
        List<Events> events = eventService.getAllEventsForUser(currentAuth());
        List<Map<String, Object>> out = new ArrayList<>();
        for (Events ev : events) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", ev.getId());
            m.put("title", ev.getTitle());
            m.put("date", ev.getDate() != null ? ev.getDate().toString() : null);
            m.put("budget", ev.getTotalBudget());
            m.put("spent", ev.getTotalSpent());
            out.add(m);
        }
        return out;
    }

    @Tool(description = "Get the budget, amount spent, and category breakdown for one specific event, by its event ID (get the ID from getEvents first)")
    public Map<String, Object> getEventDetails(@ToolParam(description = "The event's numeric ID") Long eventId) {
        if (eventId == null) {
            return Map.of("found", false, "message", "No event ID was given.");
        }
        try {
            // getEventById already verifies the event belongs to the current user
            // and throws otherwise — same ownership check every other endpoint uses.
            Events ev = eventService.getEventById(eventId, currentAuth());
            Map<String, Object> out = new LinkedHashMap<>();
            out.put("found", true);
            out.put("title", ev.getTitle());
            out.put("budget", ev.getTotalBudget());
            out.put("spent", ev.getTotalSpent());
            out.put("remaining", Math.max(0, ev.getTotalBudget() - ev.getTotalSpent()));
            out.put("categoryBreakdown", ev.getCategoryBreakdown());
            return out;
        } catch (RuntimeException e) {
            // Covers both "not found" and "unauthorized" — the assistant just needs
            // to know it can't answer this, not the internal reason why.
            return Map.of("found", false, "message", "That event couldn't be found.");
        }
    }
}
