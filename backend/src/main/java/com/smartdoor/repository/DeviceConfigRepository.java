package com.smartdoor.repository;

import com.smartdoor.model.DeviceConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeviceConfigRepository extends JpaRepository<DeviceConfig, String> {
}
