package com.example.finsage;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.finsage.model.Expense;

public interface ExpenseRepository extends JpaRepository<Expense,Long> {
	List<Expense> findByUserAndDate(User user, LocalDate date);
    List<Expense> findByUser(User user);
    List<Expense> findByUserEmail(String email);
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.email = :email AND e.category = 'income'")
    double getTotalIncome(@Param("email") String email);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.email = :email AND e.category = 'expense'")
    double getTotalExpenses(@Param("email") String email);


}
