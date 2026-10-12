-- FinSage Initial Database Schema
-- Compatible with MySQL 8.0+ and Hibernate 6.x (MySQL8Dialect)
-- Generated from JPA entity mappings with spring.jpa.hibernate.ddl-auto=validate

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- Table: users
-- ============================================================
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NULL,
    `full_name` VARCHAR(255) NULL,
    `provider` VARCHAR(255) NOT NULL,
    `role` VARCHAR(255) NOT NULL DEFAULT 'USER',
    `income` DOUBLE NOT NULL DEFAULT 0.0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- Table: expense
-- ============================================================
CREATE TABLE `expense` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `category` VARCHAR(255) NULL,
    `amount` DOUBLE NULL,
    `description` VARCHAR(255) NULL,
    `date` DATE NOT NULL,
    `source` VARCHAR(255) NOT NULL,
    `user_id` BIGINT NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_expense_user_id` (`user_id`),
    KEY `idx_expense_user_date` (`user_id`, `date`),
    KEY `idx_expense_user_category` (`user_id`, `category`),
    CONSTRAINT `fk_expense_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- Table: savings_goal
-- ============================================================
CREATE TABLE `savings_goal` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `amount` DOUBLE NOT NULL DEFAULT 0.0,
    `user_email` VARCHAR(255) NULL,
    `status` VARCHAR(255) NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (`id`),
    KEY `idx_savings_goal_user_status` (`user_email`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- Table: events
-- ============================================================
CREATE TABLE `events` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NULL,
    `date` DATE NULL,
    `total_budget` DOUBLE NOT NULL DEFAULT 0.0,
    `total_spent` DOUBLE NOT NULL DEFAULT 0.0,
    `user_id` BIGINT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_events_user_id` (`user_id`),
    CONSTRAINT `fk_events_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- Table: event_category_breakdown (ElementCollection for Events.categoryBreakdown)
-- ============================================================
CREATE TABLE `event_category_breakdown` (
    `event_id` BIGINT NOT NULL,
    `category` VARCHAR(255) NOT NULL,
    `amount` DOUBLE NOT NULL,
    PRIMARY KEY (`event_id`, `category`),
    KEY `idx_event_breakdown_event_id` (`event_id`),
    CONSTRAINT `fk_event_breakdown_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- Table: savings_plan_history
-- ============================================================
CREATE TABLE `savings_plan_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `salary` DOUBLE NOT NULL,
    `expenses` DOUBLE NOT NULL,
    `goals_json` TINYTEXT NULL,
    `response_json` TINYTEXT NULL,
    `created_at` DATETIME(6) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_sph_user_created` (`user_id`, `created_at`),
    CONSTRAINT `fk_sph_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- Table: expense_suggestion
-- ============================================================
CREATE TABLE `expense_suggestion` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NULL,
    `category` VARCHAR(255) NULL,
    `amount` DOUBLE NOT NULL DEFAULT 0.0,
    `suggested_date` DATE NULL,
    `status` VARCHAR(255) NULL,
    PRIMARY KEY (`id`),
    KEY `idx_expense_suggestion_email_date` (`email`, `suggested_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- Table: password_reset_token
-- ============================================================
CREATE TABLE `password_reset_token` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `expiry_date` DATETIME(6) NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;