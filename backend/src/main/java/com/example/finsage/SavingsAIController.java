package com.example.finsage;

import com.example.finsage.SavingsRequest;
import com.example.finsage.SavingsResponse;
import com.example.finsage.SavingsAIService;
import org.springframework.web.bind.annotation.*;

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
