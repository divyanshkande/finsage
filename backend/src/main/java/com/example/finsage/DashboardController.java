package com.example.finsage;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(Authentication authentication) {
        String email = authentication.getName();
        Map<String, Object> summary = dashboardService.getDashboardSummary(email);
        return ResponseEntity.ok(summary);
    }
    
    @GetMapping("/monthly")
    public ResponseEntity<Map<String, Double>> getMonthlySummary(Authentication auth) {
        String email = auth.getName();
        return ResponseEntity.ok(dashboardService.getMonthlyExpenses(email));
    }

    @GetMapping("/yearly")
    public ResponseEntity<Map<String, Double>> getYearlySummary(Authentication auth) {
        String email = auth.getName();
        return ResponseEntity.ok(dashboardService.getYearlyExpenses(email));
    }
}
