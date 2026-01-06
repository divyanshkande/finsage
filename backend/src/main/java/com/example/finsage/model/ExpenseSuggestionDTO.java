package com.example.finsage.model;

public class ExpenseSuggestionDTO {


	private String category;
    private Double suggestedAmount;
    private String message;

    public ExpenseSuggestionDTO(String category, Double suggestedAmount, String message) {
        this.category = category;
        this.suggestedAmount = suggestedAmount;
        this.message = message;
    }

    public void setCategory(String category) {
		this.category = category;
	}

	public void setSuggestedAmount(Double suggestedAmount) {
		this.suggestedAmount = suggestedAmount;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getCategory() {
		return category;
	}

	public Double getSuggestedAmount() {
		return suggestedAmount;
	}

	public String getMessage() {
		return message;
	}
    // getters
}
