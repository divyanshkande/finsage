package com.example.finsage.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.finsage.model.SavingsGoal;

public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long> {
    List<SavingsGoal> findByUserEmailAndStatus(String userEmail, String status);
}
