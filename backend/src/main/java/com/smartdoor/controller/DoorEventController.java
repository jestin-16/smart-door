package com.smartdoor.controller;

import com.smartdoor.model.DoorEvent;
import com.smartdoor.repository.DoorEventRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
@Tag(name = "Events", description = "Historical Audit Log of Door Openings, Closings, and Light Activations")
public class DoorEventController {

    private final DoorEventRepository eventRepository;

    public DoorEventController(DoorEventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @GetMapping
    @Operation(summary = "Get event history", description = "Retrieves recent door events with pagination and filtering.")
    public ResponseEntity<List<DoorEvent>> getEvents(
            @RequestParam(required = false) String deviceId,
            @RequestParam(defaultValue = "50") int limit) {

        int clampedLimit = Math.min(100, Math.max(1, limit));

        List<DoorEvent> events;
        if (deviceId != null && !deviceId.isBlank()) {
            events = eventRepository.findByDeviceIdOrderByCreatedAtDesc(deviceId, PageRequest.of(0, clampedLimit));
        } else {
            events = eventRepository.findTop50ByOrderByCreatedAtDesc();
        }

        return ResponseEntity.ok(events);
    }
}
