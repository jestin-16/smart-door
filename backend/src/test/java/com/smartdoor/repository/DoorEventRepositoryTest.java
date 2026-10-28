package com.smartdoor.repository;

import com.smartdoor.model.DoorEvent;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class DoorEventRepositoryTest {

    @Autowired
    private DoorEventRepository eventRepository;

    @Test
    void testSaveAndFindEvents() {
        DoorEvent event1 = new DoorEvent("evt-test-1", "smartdoor-01", "DOOR_OPENED");
        event1.setDoorOpen(true);
        event1.setCreatedAt(Instant.now().minusSeconds(10));
        eventRepository.save(event1);

        DoorEvent event2 = new DoorEvent("evt-test-2", "smartdoor-01", "LIGHT_ON");
        event2.setLightOn(true);
        event2.setCreatedAt(Instant.now());
        eventRepository.save(event2);

        List<DoorEvent> events = eventRepository.findByDeviceIdOrderByCreatedAtDesc("smartdoor-01", PageRequest.of(0, 10));

        assertEquals(2, events.size());
        assertEquals("evt-test-2", events.get(0).getId());
        assertEquals("LIGHT_ON", events.get(0).getEventType());
    }
}
