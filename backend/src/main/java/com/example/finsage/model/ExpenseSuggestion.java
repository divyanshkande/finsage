package com.example.finsage.model;

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
	private String email;

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}
	private String category;


	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}
	private double amount;

	public double getAmount() {
		return amount;
	}

	public void setAmount(double amount) {
		this.amount = amount;
	}
	private LocalDate suggestedDate;

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
    @Enumerated(EnumType.STRING)
    private Status status; 

    public enum Status {
        PENDING, DISMISSED, SNOOZED
    }
}
