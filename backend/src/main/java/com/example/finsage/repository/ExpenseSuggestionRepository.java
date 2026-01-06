package com.example.finsage.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.finsage.model.ExpenseSuggestion;
@Repository
public interface ExpenseSuggestionRepository extends JpaRepository<ExpenseSuggestion, Long> {

    Optional<ExpenseSuggestion> findByEmailAndSuggestedDate(String email, LocalDate date);

    Optional<ExpenseSuggestion> findByEmailAndSuggestedDateAndStatus(
            String email,
            LocalDate date,
            ExpenseSuggestion.Status status
    );
}