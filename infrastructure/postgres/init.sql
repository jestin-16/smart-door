-- PostgreSQL Initialization Script for SmartDoorLight

CREATE TABLE IF NOT EXISTS device_configurations (
    device_id VARCHAR(64) PRIMARY KEY,
    light_threshold INT NOT NULL DEFAULT 1500,
    off_delay_ms BIGINT NOT NULL DEFAULT 15000,
    auto_mode BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS door_events (
    id VARCHAR(64) PRIMARY KEY,
    device_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    door_open BOOLEAN,
    light_on BOOLEAN,
    light_percentage DOUBLE PRECISION,
    light_adc INT,
    is_dark BOOLEAN,
    remaining_delay_ms BIGINT,
    off_delay_ms BIGINT,
    mode VARCHAR(16),
    description TEXT,
    details_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_door_events_device_time ON door_events(device_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_door_events_type ON door_events(event_type);

-- Insert default seed configuration
INSERT INTO device_configurations (device_id, light_threshold, off_delay_ms, auto_mode)
VALUES ('smartdoor-01', 1500, 15000, TRUE)
ON CONFLICT (device_id) DO NOTHING;
