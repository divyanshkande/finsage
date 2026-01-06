package com.example.finsage.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.finsage.model.Events;
import com.example.finsage.model.User;

public interface EventRepository extends JpaRepository<Events, Long> {
    List<Events> findByUser(User user);
}