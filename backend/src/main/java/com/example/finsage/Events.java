package com.example.finsage;

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

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public LocalDate getDate() {
		return date;
	}

	public void setDate(LocalDate date) {
		this.date = date;
	}

	public double getTotalBudget() {
		return totalBudget;
	}

	public void setTotalBudget(double totalBudget) {
		this.totalBudget = totalBudget;
	}

	public double getTotalSpent() {
		return totalSpent;
	}

	public void setTotalSpent(double totalSpent) {
		this.totalSpent = totalSpent;
	}

	public Map<String, Double> getCategoryBreakdown() {
		return categoryBreakdown;
	}

	public void setCategoryBreakdown(Map<String, Double> categoryBreakdown) {
		this.categoryBreakdown = categoryBreakdown;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	private String title;

    private LocalDate date;

    private double totalBudget;

    private double totalSpent;

    @ElementCollection
    @CollectionTable(name = "event_category_breakdown", joinColumns = @JoinColumn(name = "event_id"))
    @MapKeyColumn(name = "category")
    @Column(name = "amount")
    private Map<String, Double> categoryBreakdown = new HashMap<>();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
