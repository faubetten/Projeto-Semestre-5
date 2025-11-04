-- schema.sql
DROP DATABASE IF EXISTS event_recommender;
CREATE DATABASE event_recommender
  CHARACTER SET = 'utf8mb4'
  COLLATE = 'utf8mb4_unicode_ci';
USE event_recommender;

-- users
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- user_profiles
CREATE TABLE user_profiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  preferred_distance_km FLOAT DEFAULT NULL,
  preferred_time_of_day ENUM('MORNING','AFTERNOON','EVENING','ANY') NOT NULL DEFAULT 'ANY',
  preferred_days VARCHAR(100) DEFAULT NULL,   -- e.g. "Mon,Tue,Sat"
  travel_method ENUM('WALK','CAR','PUBLIC_TRANSPORT','ANY') NOT NULL DEFAULT 'ANY',
  interests TEXT DEFAULT NULL,                 -- comma-separated or JSON text
  location_lat DECIMAL(9,6) DEFAULT NULL,
  location_lng DECIMAL(9,6) DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_profiles_user_id (user_id)
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- event_categories
CREATE TABLE event_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- events
CREATE TABLE events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category_id BIGINT UNSIGNED DEFAULT NULL,
  date_time DATETIME NOT NULL,
  duration_hours FLOAT DEFAULT NULL,
  location_name VARCHAR(150) DEFAULT NULL,
  latitude DECIMAL(9,6) DEFAULT NULL,
  longitude DECIMAL(9,6) DEFAULT NULL,
  organizer VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES event_categories(id) ON DELETE SET NULL,
  INDEX idx_events_category_id (category_id),
  INDEX idx_events_date_time (date_time),
  INDEX idx_events_lat_lng (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- saved_events (bookmarks)
CREATE TABLE saved_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  event_id BIGINT UNSIGNED NOT NULL,
  saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_user_event (user_id, event_id),
  INDEX idx_saved_events_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- recommendations log
CREATE TABLE recommendations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED DEFAULT NULL,
  input_text TEXT NOT NULL,
  recommended_event_ids TEXT DEFAULT NULL,   -- comma-separated event IDs (or JSON array)
  ai_confidence_score FLOAT DEFAULT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_recommendations_user_id (user_id),
  INDEX idx_recommendations_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: event tags (many-to-many)
CREATE TABLE tags (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE event_tags (
  event_id BIGINT UNSIGNED NOT NULL,
  tag_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (event_id, tag_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  INDEX idx_event_tags_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Helpful sample data (optional)
INSERT INTO event_categories (name, description) VALUES ('Technology','Tech workshops and talks'), ('Art','Art classes and workshops');

-- Create an application DB user (you can run these later as root)
-- Replace 'your_app_user' and 'strong_password' before running:
-- CREATE USER 'your_app_user'@'localhost' IDENTIFIED BY 'strong_password';
-- GRANT ALL PRIVILEGES ON event_recommender.* TO 'your_app_user'@'localhost';
-- FLUSH PRIVILEGES;
