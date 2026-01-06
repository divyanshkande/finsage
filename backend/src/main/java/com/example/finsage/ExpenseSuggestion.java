package com.example.finsage;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class ExpenseSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public double getAmount() {
		return amount;
	}

	public void setAmount(double amount) {
		this.amount = amount;
	}

	public LocalDate getSuggestedDate() {
		return suggestedDate;
	}

	public void setSuggestedDate(LocalDate suggestedDate) {
		this.suggestedDate = suggestedDate;
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		this.status = status;
	}

	private String email;
    private String category;
    private double amount;
    private LocalDate suggestedDate;

    @Enumerated(EnumType.STRING)
    private Status status; // PENDING, DISMISSED, SNOOZED

    public enum Status {
        PENDING, DISMISSED, SNOOZED
    }
}
