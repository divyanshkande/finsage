package com.example.finsage.model;

public class ExpenseSuggestionDTO {
public ExpenseSuggestionDTO(String category, Double suggestedAmount, String message) {
        this.category = category;
        this.suggestedAmount = suggestedAmount;
        this.message = message;
    }
    private String category;
	public String getCategory() {
		return category;
	}
    public void setCategory(String category) {
		this.category = category;
	}
	 private Double suggestedAmount;
   public Double getSuggestedAmount() {
		return suggestedAmount;
	}
	public void setSuggestedAmount(Double suggestedAmount) {
		this.suggestedAmount = suggestedAmount;
	}
	private String message;
	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	

	

	
 
}
