package com.example.finsage;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.Month;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.example.finsage.model.Expense;
import com.example.finsage.repository.ExpenseRepository;
import com.example.finsage.service.ExpenseService;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceDateFilterTest {

    @Mock
    private ExpenseRepository expenseRepo;

    @InjectMocks
    private ExpenseService expenseService;

    private Expense expenseJan15;
    private Expense expenseJan20;

    @BeforeEach
    void setUp() {
        expenseJan15 = new Expense();
        expenseJan15.setDate(LocalDate.of(2025, Month.JANUARY, 15));
        expenseJan15.setCategory("Food");
        expenseJan15.setAmount(50.0);

        expenseJan20 = new Expense();
        expenseJan20.setDate(LocalDate.of(2025, Month.JANUARY, 20));
        expenseJan20.setCategory("Transport");
        expenseJan20.setAmount(30.0);
    }

    @Test
    void filterExpenses_shouldFilterByExactDate() {
        when(expenseRepo.findByUserEmail("test@example.com"))
                .thenReturn(Arrays.asList(expenseJan15, expenseJan20));

        List<Expense> filtered = expenseService.filterExpenses("test@example.com", null, "2025-01-15");
        assertEquals(1, filtered.size());
        assertEquals(expenseJan15, filtered.get(0));
    }

    @Test
    void filterExpenses_shouldFilterByMonthOnly() {
        when(expenseRepo.findByUserEmail("test@example.com"))
                .thenReturn(Arrays.asList(expenseJan15, expenseJan20));

        List<Expense> filtered = expenseService.filterExpenses("test@example.com", null, "2025-01");
        assertEquals(2, filtered.size());
        // Both Jan 15 and Jan 20 should match the month filter
    }

    @Test
    void filterExpenses_shouldFilterByCategory() {
        when(expenseRepo.findByUserEmail("test@example.com"))
                .thenReturn(Arrays.asList(expenseJan15, expenseJan20));

        List<Expense> filtered = expenseService.filterExpenses("test@example.com", "Food", null);
        assertEquals(1, filtered.size());
        assertEquals("Food", filtered.get(0).getCategory());
    }

    @Test
    void filterExpenses_shouldFilterByCategoryAndDate() {
        when(expenseRepo.findByUserEmail("test@example.com"))
                .thenReturn(Arrays.asList(expenseJan15, expenseJan20));

        List<Expense> filtered = expenseService.filterExpenses("test@example.com", "Food", "2025-01-15");
        assertEquals(1, filtered.size());
        assertEquals("Food", filtered.get(0).getCategory());
    }

    @Test
    void filterExpenses_shouldReturnAllWhenNoFilters() {
        when(expenseRepo.findByUserEmail("test@example.com"))
                .thenReturn(Arrays.asList(expenseJan15, expenseJan20));

        List<Expense> filtered = expenseService.filterExpenses("test@example.com", null, null);
        assertEquals(2, filtered.size());
    }

    @Test
    void filterExpenses_shouldHandleNullDateStr() {
        when(expenseRepo.findByUserEmail("test@example.com"))
                .thenReturn(Arrays.asList(expenseJan15, expenseJan20));

        List<Expense> filtered = expenseService.filterExpenses("test@example.com", null, null);
        assertEquals(2, filtered.size());
    }
}