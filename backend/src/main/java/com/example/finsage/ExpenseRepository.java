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
    boolean existsByUserAndDate(User user, LocalDate date);
    @Query("""
    		SELECT e.category, COUNT(e)
    		FROM Expense e
    		WHERE e.user.email = :email
    		GROUP BY e.category
    		ORDER BY COUNT(e) DESC
    		""")
    		List<Object[]> findMostUsedCategories(@Param("email") String email);
    		@Query("""
    				SELECT AVG(e.amount)
    				FROM Expense e
    				WHERE e.user.email = :email AND e.category = :category
    				""")
    				Double findAverageAmountForCategory(
    				        @Param("email") String email,
    				        @Param("category") String category
    				);


}
