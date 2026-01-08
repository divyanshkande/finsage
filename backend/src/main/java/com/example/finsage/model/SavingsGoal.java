package com.example.finsage.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;

import lombok.NoArgsConstructor;


@Entity

@NoArgsConstructor
@AllArgsConstructor
public class SavingsGoal {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;
    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}
    private String name;
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
     private double amount;
	public double getAmount() {
		return amount;
	}

	public void setAmount(double amount) {
		this.amount = amount;
	}
     private String userEmail; 
	public String getUserEmail() {
		return userEmail;
	}

	public void setUserEmail(String userEmail) {
		this.userEmail = userEmail;
	}

   private String status = "ACTIVE";

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	} 
}