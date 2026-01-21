SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE bookings (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY uq_bookings_date_time (booking_date, booking_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER bookings_before_insert
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        SET NEW.id = UUID();
    END IF;
END$$
DELIMITER ;



CREATE TABLE newsletter_subscriptions (
    id CHAR(36) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER newsletter_subscriptions_before_insert
BEFORE INSERT ON newsletter_subscriptions
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        SET NEW.id = UUID();
    END IF;
END$$
DELIMITER ;



CREATE TABLE contact_submissions (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(64),
    whatsapp VARCHAR(64) NOT NULL,
    brand_about TEXT NOT NULL,
    goals TEXT NOT NULL,
    services TEXT NOT NULL,
    message TEXT,
    submitted_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER contact_submissions_before_insert
BEFORE INSERT ON contact_submissions
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        SET NEW.id = UUID();
    END IF;
END$$
DELIMITER ;



CREATE TABLE user_roles (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    role ENUM('admin','user') NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    UNIQUE KEY uq_user_role (user_id, role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER user_roles_before_insert
BEFORE INSERT ON user_roles
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        SET NEW.id = UUID();
    END IF;
END$$
DELIMITER ;



CREATE TABLE reviews (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    project_type TEXT NOT NULL,
    rating INT NOT NULL,
    review TEXT NOT NULL,
    is_anonymous TINYINT(1) NOT NULL DEFAULT 0,
    company TEXT,
    role TEXT,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER reviews_before_insert
BEFORE INSERT ON reviews
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL OR NEW.id = '' THEN
        SET NEW.id = UUID();
    END IF;

    IF NEW.rating < 1 OR NEW.rating > 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'rating must be between 1 and 5';
    END IF;
END$$
DELIMITER ;

CREATE INDEX idx_reviews_created_at ON reviews (created_at);

SET FOREIGN_KEY_CHECKS = 1;
