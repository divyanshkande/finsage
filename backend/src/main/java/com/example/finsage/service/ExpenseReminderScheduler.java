package com.example.finsage.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.finsage.model.User;
import com.example.finsage.repository.ExpenseRepository;
import com.example.finsage.repository.UserRepository;

@Service
public class ExpenseReminderScheduler {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ExpenseRepository expenseRepo;

    @Scheduled(cron = "*/30 * * * * ?")
    public void dailyExpenseReminder() {

        System.out.println("⏰ Expense reminder job started");

        LocalDate today = LocalDate.now();
        List<User> users = userRepo.findAll();

        for (User user : users) {

            boolean hasAddedExpense =
                    expenseRepo.existsByUserAndDate(user, today);

            if (!hasAddedExpense) {
                System.out.println(
                    "🔔 REMINDER: User " + user.getEmail() +
                    " has NOT added any expense for " + today
                );
            } else {
                System.out.println(
                    "✅ User " + user.getEmail() +
                    " already added expense today"
                );
            }
        }

        System.out.println("⏹ Expense reminder job finished\n");
    }
}
