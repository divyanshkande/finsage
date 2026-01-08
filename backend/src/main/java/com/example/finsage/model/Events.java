package com.example.finsage.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Events {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}
	private String title;

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}
	private LocalDate date;
	public LocalDate getDate() {
		return date;
	}

	public void setDate(LocalDate date) {
		this.date = date;
	}
	private double totalBudget;

	public double getTotalBudget() {
		return totalBudget;
	}

	public void setTotalBudget(double totalBudget) {
		this.totalBudget = totalBudget;
	}
	 private double totalSpent;


	public double getTotalSpent() {
		return totalSpent;
	}

	public void setTotalSpent(double totalSpent) {
		this.totalSpent = totalSpent;
	}
	@ElementCollection
    @CollectionTable(name = "event_category_breakdown", joinColumns = @JoinColumn(name = "event_id"))
    @MapKeyColumn(name = "category")
    @Column(name = "amount")
    private Map<String, Double> categoryBreakdown = new HashMap<>();

	public Map<String, Double> getCategoryBreakdown() {
		return categoryBreakdown;
	}

	public void setCategoryBreakdown(Map<String, Double> categoryBreakdown) {
		this.categoryBreakdown = categoryBreakdown;
	}
	@ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	

    

    

   
    

    
}
