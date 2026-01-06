package com.example.finsage.service;
import java.util.Map;
public interface AIParserService {
	

	

	
	    /**
	     * Convert raw OCR text -> structured map with keys:
	     *   merchant (String), date (String or ISO), amount (Double), category (String), rawText (String)
	     */
	    Map<String, Object> parseTextToExpense(String rawText);
	}



