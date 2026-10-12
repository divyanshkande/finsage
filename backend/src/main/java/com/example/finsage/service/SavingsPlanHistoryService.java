package com.example.finsage.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.finsage.model.SavingsPlanHistory;
import com.example.finsage.model.SavingsPlanHistoryDTO;
import com.example.finsage.model.SavingsRequest;
import com.example.finsage.model.SavingsResponse;
import com.example.finsage.model.User;
import com.example.finsage.repository.SavingsPlanHistoryRepository;
import com.example.finsage.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class SavingsPlanHistoryService {

    private static final Logger logger = LoggerFactory.getLogger(SavingsPlanHistoryService.class);

    @Autowired
    private SavingsPlanHistoryRepository historyRepo;

    @Autowired
    private UserRepository userRepo;

    private final ObjectMapper mapper = new ObjectMapper();

    public void save(String userEmail, SavingsRequest req, SavingsResponse response) {
        try {
            User user = userRepo.findByEmail(userEmail).orElse(null);
            if (user == null) {
                return;
            }

            SavingsPlanHistory entry = SavingsPlanHistory.builder()
                    .user(user)
                    .salary(req.getSalary())
                    .expenses(req.getExpenses())
                    .goalsJson(mapper.writeValueAsString(req.getGoals()))
                    .responseJson(mapper.writeValueAsString(response))
                    .createdAt(LocalDateTime.now())
                    .build();

            historyRepo.save(entry);
        } catch (Exception e) {
            logger.warn("Failed to save savings plan history: {}", e.getMessage());
        }
    }

    public List<SavingsPlanHistoryDTO> getHistory(String userEmail) {
        User user = userRepo.findByEmail(userEmail).orElse(null);
        if (user == null) {
            return List.of();
        }

        return historyRepo.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private SavingsPlanHistoryDTO toDto(SavingsPlanHistory entry) {
        SavingsPlanHistoryDTO dto = new SavingsPlanHistoryDTO();
        dto.setId(entry.getId());
        dto.setCreatedAt(entry.getCreatedAt());
        dto.setSalary(entry.getSalary());
        dto.setExpenses(entry.getExpenses());
        try {
            dto.setGoals(mapper.readValue(entry.getGoalsJson(), new TypeReference<Map<String, Double>>() {}));
            dto.setPlan(mapper.readValue(entry.getResponseJson(), SavingsResponse.class));
        } catch (Exception e) {
            logger.warn("Failed to parse stored savings plan history entry {}: {}", entry.getId(), e.getMessage());
        }
        return dto;
    }
}