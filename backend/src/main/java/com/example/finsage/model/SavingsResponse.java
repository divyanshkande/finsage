package com.example.finsage.model;

import java.util.List;
import java.util.Map;

public class SavingsResponse {
    private double idealSavings;
    private double sipAmount;
    private double safeToSpend;
    private int emergencyFundMonths;               // <--- ADDED
    private int recommendedTimelineMonths;
    private Map<String, Integer> goalTimelineMonths;
    private List<String> monthlyPlan;
    private String rawText;

    public double getIdealSavings() {
        return idealSavings;
    }

    public void setIdealSavings(double idealSavings) {
        this.idealSavings = idealSavings;
    }

    public double getSipAmount() {
        return sipAmount;
    }

    public void setSipAmount(double sipAmount) {
        this.sipAmount = sipAmount;
    }

    public double getSafeToSpend() {
        return safeToSpend;
    }

    public void setSafeToSpend(double safeToSpend) {
        this.safeToSpend = safeToSpend;
    }

    public int getEmergencyFundMonths() {
        return emergencyFundMonths;
    }

    public void setEmergencyFundMonths(int emergencyFundMonths) {
        this.emergencyFundMonths = emergencyFundMonths;
    }

    public int getRecommendedTimelineMonths() {
        return recommendedTimelineMonths;
    }

    public void setRecommendedTimelineMonths(int recommendedTimelineMonths) {
        this.recommendedTimelineMonths = recommendedTimelineMonths;
    }

    public Map<String, Integer> getGoalTimelineMonths() {
        return goalTimelineMonths;
    }

    public void setGoalTimelineMonths(Map<String, Integer> goalTimelineMonths) {
        this.goalTimelineMonths = goalTimelineMonths;
    }

    public List<String> getMonthlyPlan() {
        return monthlyPlan;
    }

    public void setMonthlyPlan(List<String> monthlyPlan) {
        this.monthlyPlan = monthlyPlan;
    }

    public String getRawText() {
        return rawText;
    }

    public void setRawText(String rawText) {
        this.rawText = rawText;
    }
}
