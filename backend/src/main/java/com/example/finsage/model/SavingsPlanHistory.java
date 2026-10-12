package com.example.finsage.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "savings_plan_history", indexes = {
    @Index(name = "idx_sph_user_created", columnList = "user_id, createdAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingsPlanHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private double salary;

    @Column(nullable = false)
    private double expenses;

    @Lob
    @Column(name = "goals_json")
    private String goalsJson;

    @Lob
    @Column(name = "response_json")
    private String responseJson;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}