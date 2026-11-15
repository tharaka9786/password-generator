-- =============================================================================
-- PassForge Security & Identity Suite — MySQL Database Schema
-- Compatible with local WAMP MySQL/MariaDB and PythonAnywhere production MySQL.
-- Uses utf8mb4 character set & utf8mb4_unicode_ci collation for multilingual
-- and Sinhala Unicode support.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `passforge_db`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `passforge_db`;

-- -----------------------------------------------------------------------------
-- 1. Users Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(80) NOT NULL UNIQUE,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_users_username` (`username`),
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Vault Items Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vault_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `username_value` VARCHAR(255) DEFAULT NULL,
    `encrypted_password` TEXT NOT NULL,
    `category` VARCHAR(50) NOT NULL COMMENT 'password, username, account_pair',
    `notes` TEXT DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_vault_items_user_id` (`user_id`),
    CONSTRAINT `fk_vault_items_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Sinhala Humanizer History Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `humanizer_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `mode` VARCHAR(30) NOT NULL COMMENT 'academic, general',
    `original_text` LONGTEXT NOT NULL,
    `humanized_text` LONGTEXT NOT NULL,
    `fm_abhaya_text` LONGTEXT DEFAULT NULL,
    `ai_score` FLOAT DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_humanizer_history_user_id` (`user_id`),
    CONSTRAINT `fk_humanizer_history_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Security Tool Execution History Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tool_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `tool_name` VARCHAR(50) NOT NULL COMMENT 'strength_checker, hash_generator, breach_checker',
    `input_summary` VARCHAR(255) DEFAULT NULL,
    `result_summary` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_tool_history_user_id` (`user_id`),
    CONSTRAINT `fk_tool_history_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
