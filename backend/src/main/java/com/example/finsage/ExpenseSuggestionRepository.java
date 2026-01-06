package com.example.finsage;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface ExpenseSuggestionRepository extends JpaRepository<ExpenseSuggestion, Long> {

    Optional<ExpenseSuggestion> findByEmailAndSuggestedDate(String email, LocalDate date);

    Optional<ExpenseSuggestion> findByEmailAndSuggestedDateAndStatus(
            String email,
            LocalDate date,
            ExpenseSuggestion.Status status
    );
}