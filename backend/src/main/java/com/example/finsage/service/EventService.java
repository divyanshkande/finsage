package com.example.finsage.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import org.springframework.stereotype.Service;

import com.example.finsage.EventRepository;
import com.example.finsage.Events;
import com.example.finsage.User;
import com.example.finsage.UserRepository;

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
        return userRepository.findByEmail(email).orElseThrow();
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
        Events event = eventRepository.findById(id).orElseThrow();

        // Optional (but recommended): Ensure event belongs to the authenticated user
        if (!event.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to view this event");
        }

        return event;
    }

    public void deleteEvent(Long id, Authentication auth) {
        eventRepository.deleteById(id); // Optional: validate user ownership
    }
    
    public Events updateEventCategoryBreakdown(Long eventId, Map<String, Double> newBreakdown, Authentication auth) {
        User user = getCurrentUser(auth);
        Events event = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this event");
        }

        event.setCategoryBreakdown(newBreakdown);
        double totalSpent = newBreakdown.values().stream().mapToDouble(Double::doubleValue).sum();
        event.setTotalSpent(totalSpent);

        return eventRepository.save(event); // ✅ returning updated event
    }

    public Events updateCategoryBreakdown(Long id, Map<String, Double> breakdown, Authentication auth) {
        Events event = eventRepository.findById(id).orElseThrow();
        event.setCategoryBreakdown(breakdown);
        double totalSpent = breakdown.values().stream().mapToDouble(Double::doubleValue).sum();
        event.setTotalSpent(totalSpent);
        return eventRepository.save(event);
    }

}
