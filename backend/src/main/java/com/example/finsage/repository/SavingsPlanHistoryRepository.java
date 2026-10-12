package com.example.finsage.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.finsage.model.SavingsPlanHistory;
import com.example.finsage.model.User;

public interface SavingsPlanHistoryRepository extends JpaRepository<SavingsPlanHistory, Long> {
    List<SavingsPlanHistory> findByUserOrderByCreatedAtDesc(User user);
}