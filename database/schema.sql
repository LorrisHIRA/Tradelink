-- TradeLink database schema (Sprint 1: registration and profiles)
CREATE DATABASE IF NOT EXISTS tradelink;
USE tradelink;

CREATE TABLE IF NOT EXISTS users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(100) NOT NULL,
  phone_number  VARCHAR(15)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('tradesperson','admin') NOT NULL DEFAULT 'tradesperson',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trade_categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS locations (
  location_id INT AUTO_INCREMENT PRIMARY KEY,
  district    VARCHAR(50) NOT NULL,
  sector      VARCHAR(50) NULL,
  UNIQUE KEY uq_location (district, sector)
);

CREATE TABLE IF NOT EXISTS profiles (
  profile_id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL UNIQUE,
  category_id      INT NOT NULL,
  location_id      INT NOT NULL,
  bio              VARCHAR(500),
  years_experience INT NOT NULL DEFAULT 0,
  availability     BOOLEAN NOT NULL DEFAULT TRUE,
  status           ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(user_id)                  ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES trade_categories(category_id),
  FOREIGN KEY (location_id) REFERENCES locations(location_id)
);

INSERT IGNORE INTO trade_categories (name) VALUES
  ('Plumber'), ('Electrician'), ('Mason'), ('Carpenter'), ('Mechanic');

-- Pilot area: Kigali's three districts (sectors can be added later)
INSERT IGNORE INTO locations (district, sector) VALUES
  ('Gasabo', NULL), ('Kicukiro', NULL), ('Nyarugenge', NULL);
