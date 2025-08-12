package com.example.finsage;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long> {
    List<SavingsGoal> findByUserEmailAndStatus(String userEmail, String status);
}
