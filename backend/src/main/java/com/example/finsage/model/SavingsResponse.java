package com.example.finsage.model;

import java.util.List;
import java.util.Map;

public class SavingsResponse {
    private double idealSavings;
    public double getIdealSavings() {
        return idealSavings;
    }

    public void setIdealSavings(double idealSavings) {
        this.idealSavings = idealSavings;
    }
    private double sipAmount;
    public double getSipAmount() {
        return sipAmount;
    }

    public void setSipAmount(double sipAmount) {
        this.sipAmount = sipAmount;
    }
    private double safeToSpend;
    public double getSafeToSpend() {
        return safeToSpend;
    }

    public void setSafeToSpend(double safeToSpend) {
        this.safeToSpend = safeToSpend;
    }
    private int emergencyFundMonths;
    public int getEmergencyFundMonths() {
        return emergencyFundMonths;
    }

    public void setEmergencyFundMonths(int emergencyFundMonths) {
        this.emergencyFundMonths = emergencyFundMonths;
    }
            
    private int recommendedTimelineMonths;
     public int getRecommendedTimelineMonths() {
        return recommendedTimelineMonths;
    }

    public void setRecommendedTimelineMonths(int recommendedTimelineMonths) {
        this.recommendedTimelineMonths = recommendedTimelineMonths;
    }
    private Map<String, Integer> goalTimelineMonths;
    public Map<String, Integer> getGoalTimelineMonths() {
        return goalTimelineMonths;
    }

    public void setGoalTimelineMonths(Map<String, Integer> goalTimelineMonths) {
        this.goalTimelineMonths = goalTimelineMonths;
    }

    private List<String> monthlyPlan;
    public List<String> getMonthlyPlan() {
        return monthlyPlan;
    }

    public void setMonthlyPlan(List<String> monthlyPlan) {
        this.monthlyPlan = monthlyPlan;
    }
    private String rawText;
    
    public String getRawText() {
        return rawText;
    }

    public void setRawText(String rawText) {
        this.rawText = rawText;
    }
}
