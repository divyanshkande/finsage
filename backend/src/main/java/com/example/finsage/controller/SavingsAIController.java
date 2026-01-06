package com.example.finsage.controller;


import org.springframework.web.bind.annotation.*;

import com.example.finsage.model.SavingsRequest;
import com.example.finsage.model.SavingsResponse;
import com.example.finsage.service.SavingsAIService;

@RestController
@RequestMapping("/api/savings")
@CrossOrigin(origins = "*")
public class SavingsAIController {

    private final SavingsAIService service;

    public SavingsAIController(SavingsAIService service) {
        this.service = service;
    }

    @PostMapping("/plan")
    public SavingsResponse plan(@RequestBody SavingsRequest req) {
        return service.generatePlan(req);
    }
}
