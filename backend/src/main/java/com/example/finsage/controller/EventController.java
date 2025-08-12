package com.example.finsage.controller;


import com.example.finsage.Events;
import com.example.finsage.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;



@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:3000")
public class EventController {

    @Autowired
    private EventService eventService;

    @PostMapping
    public Events createEvent(@RequestBody Events event, Authentication authentication) {
        return eventService.createEvent(event, authentication);
    }

    @GetMapping
    public List<Events> getAllEvents(Authentication authentication) {
        return eventService.getAllEventsForUser(authentication);
    }

    @GetMapping("/{id}")
    public Events getEvent(@PathVariable Long id, Authentication authentication) {
        return eventService.getEventById(id, authentication);
    }

    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable Long id, Authentication authentication) {
        eventService.deleteEvent(id, authentication);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Events> updateEventCategoryBreakdown(
            @PathVariable Long id,
            @RequestBody Map<String, Double> categoryBreakdown,
            Authentication authentication) {

        Events updated = eventService.updateEventCategoryBreakdown(id, categoryBreakdown, authentication);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/category")
    public Events updateCategories(@PathVariable Long id, @RequestBody Map<String, Double> breakdown, Authentication authentication) {
        return eventService.updateCategoryBreakdown(id, breakdown, authentication);
    }
}
