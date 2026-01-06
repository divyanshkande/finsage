package com.example.finsage.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import org.springframework.stereotype.Service;

import com.example.finsage.model.Events;
import com.example.finsage.model.User;
import com.example.finsage.repository.EventRepository;
import com.example.finsage.repository.UserRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;


@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public Events createEvent(Events event, Authentication auth) {
        User user = getCurrentUser(auth);
        event.setUser(user);

        if (event.getCategoryBreakdown() != null) {
            double spent = event.getCategoryBreakdown().values().stream().mapToDouble(Double::doubleValue).sum();
            event.setTotalSpent(spent);
        }

        return eventRepository.save(event);
    }

    public List<Events> getAllEventsForUser(Authentication auth) {
        User user = getCurrentUser(auth);
        return eventRepository.findByUser(user);
    }

    public Events getEventById(Long id, Authentication authentication) {
        User user = getCurrentUser(authentication);
        Events event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to view this event");
        }

        return event;
    }

    public void deleteEvent(Long id, Authentication auth) {
        User user = getCurrentUser(auth);
        Events event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this event");
        }

        eventRepository.delete(event);
    }

    public Events updateEventCategoryBreakdown(Long eventId, Map<String, Double> newBreakdown, Authentication auth) {
        User user = getCurrentUser(auth);
        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this event");
        }

        event.setCategoryBreakdown(newBreakdown);
        double totalSpent = newBreakdown.values().stream().mapToDouble(Double::doubleValue).sum();
        event.setTotalSpent(totalSpent);

        return eventRepository.save(event);
    }
}
