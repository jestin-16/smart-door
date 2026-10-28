package com.smartdoor.repository;

import com.smartdoor.model.DoorEvent;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoorEventRepository extends JpaRepository<DoorEvent, String> {
    List<DoorEvent> findByDeviceIdOrderByCreatedAtDesc(String deviceId, Pageable pageable);
    List<DoorEvent> findTop50ByOrderByCreatedAtDesc();
}
