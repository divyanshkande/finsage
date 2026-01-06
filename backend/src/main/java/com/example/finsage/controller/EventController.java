package com.example.finsage.controller;



import com.example.finsage.model.Events;
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
    public ResponseEntity<Events> createEvent(@RequestBody Events event, Authentication authentication) {
        Events created = eventService.createEvent(event, authentication);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Events>> getAllEvents(Authentication authentication) {
        List<Events> events = eventService.getAllEventsForUser(authentication);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Events> getEvent(@PathVariable Long id, Authentication authentication) {
        Events event = eventService.getEventById(id, authentication);
        return ResponseEntity.ok(event);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id, Authentication authentication) {
        eventService.deleteEvent(id, authentication);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    @PutMapping("/{id}")
    public ResponseEntity<Events> updateEventCategoryBreakdown(
            @PathVariable Long id,
            @RequestBody Map<String, Double> categoryBreakdown,
            Authentication authentication) {

        Events updated = eventService.updateEventCategoryBreakdown(id, categoryBreakdown, authentication);
        return ResponseEntity.ok(updated);
    }
}
