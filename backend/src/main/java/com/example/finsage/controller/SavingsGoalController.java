package com.example.finsage.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.finsage.model.SavingsGoal;
import com.example.finsage.service.SavingsGoalService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/savings/goals")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class SavingsGoalController {

    private final SavingsGoalService service;

    public SavingsGoalController(SavingsGoalService service) {
        this.service = service;
    }

    
    @GetMapping
    public ResponseEntity<List<SavingsGoal>> getAllGoals(HttpServletRequest request) {
        String userEmail = request.getUserPrincipal().getName();
        return ResponseEntity.ok(service.getGoals(userEmail));
    }

    // 🟢 POST - add goal
    @PostMapping
    public ResponseEntity<SavingsGoal> addGoal(@RequestBody SavingsGoal goal, HttpServletRequest request) {
        String userEmail = request.getUserPrincipal().getName();
        return ResponseEntity.ok(service.addGoal(goal, userEmail));
    }

    // 🔴 DELETE by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id, HttpServletRequest request) {
        String userEmail = request.getUserPrincipal().getName();
        service.deleteGoal(id, userEmail);
        return ResponseEntity.noContent().build();
    }
}