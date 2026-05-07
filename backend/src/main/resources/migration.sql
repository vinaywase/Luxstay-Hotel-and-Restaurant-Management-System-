-- Create Table for Event Service Packages
CREATE TABLE IF NOT EXISTS event_service_packages (
    package_id INT AUTO_INCREMENT PRIMARY KEY,
    package_name VARCHAR(100) NOT NULL,
    service_type ENUM('CATERING', 'DECORATION', 'PHOTOGRAPHY', 'AV_EQUIPMENT', 'FLORAL', 'SECURITY') NOT NULL,
    pricing_type ENUM('PER_PERSON', 'FLAT_RATE') NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create Table for Event Booking Services (Link between booking and package)
CREATE TABLE IF NOT EXISTS event_booking_services (
    booking_service_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    package_id INT NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES event_bookings(booking_id),
    FOREIGN KEY (package_id) REFERENCES event_service_packages(package_id)
);

-- Create Table for Event Menu Selections
CREATE TABLE IF NOT EXISTS event_menu_selections (
    menu_selection_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    food_item_id INT NOT NULL,
    quantity INT DEFAULT 1,
    item_type ENUM('STARTER', 'MAIN_COURSE', 'DESSERT', 'BEVERAGE') NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES event_bookings(booking_id),
    FOREIGN KEY (food_item_id) REFERENCES food_items(food_item_id)
);

-- Create Table for Event Payments
CREATE TABLE IF NOT EXISTS event_payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    payment_type ENUM('ADVANCE', 'FINAL', 'REFUND') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('CASH', 'CARD', 'UPI', 'BANK_TRANSFER') NOT NULL,
    payment_status ENUM('PENDING', 'COMPLETED', 'REFUNDED', 'REFUND_INITIATED', 'REFUND_FAILED') DEFAULT 'PENDING',
    transaction_id VARCHAR(100),
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    refund_reason VARCHAR(500),
    refunded_at TIMESTAMP NULL,
    FOREIGN KEY (booking_id) REFERENCES event_bookings(booking_id)
);

-- Create Table for Event Refunds
CREATE TABLE IF NOT EXISTS event_refunds (
    refund_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    original_payment_id INT,
    refund_amount DECIMAL(10, 2) NOT NULL,
    refund_reason VARCHAR(500),
    refund_policy ENUM('FULL_REFUND', 'PARTIAL_REFUND', 'NO_REFUND') NOT NULL,
    refund_status ENUM('REQUESTED', 'APPROVED', 'PROCESSED', 'REJECTED') DEFAULT 'REQUESTED',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    processed_by INT,
    admin_notes TEXT,
    FOREIGN KEY (booking_id) REFERENCES event_bookings(booking_id),
    FOREIGN KEY (original_payment_id) REFERENCES event_payments(payment_id)
);

-- Alter Event Booking table to add new columns
ALTER TABLE event_bookings ADD COLUMN IF NOT EXISTS grand_total DECIMAL(10, 2);
ALTER TABLE event_bookings ADD COLUMN IF NOT EXISTS advance_paid DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE event_bookings ADD COLUMN IF NOT EXISTS balance_due DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE event_bookings ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(500);
ALTER TABLE event_bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP NULL;
ALTER TABLE event_bookings ADD COLUMN IF NOT EXISTS refund_status VARCHAR(50);

-- Insert Sample Data for Service Packages
INSERT INTO event_service_packages (package_name, service_type, pricing_type, base_price, description) VALUES
('Standard Buffet', 'CATERING', 'PER_PERSON', 25.00, 'Basic 3-course buffet meal'),
('Premium Dining', 'CATERING', 'PER_PERSON', 55.00, 'Luxury 5-course sit-down dinner'),
('Elegant Decor', 'DECORATION', 'FLAT_RATE', 500.00, 'Floral arrangements and stage lighting'),
('Minimalist Theme', 'DECORATION', 'FLAT_RATE', 200.00, 'Simple and clean decor setup'),
('Full Coverage Photo', 'PHOTOGRAPHY', 'FLAT_RATE', 1200.00, 'Photography and Video coverage for 8 hours'),
('Basic AV Setup', 'AV_EQUIPMENT', 'FLAT_RATE', 150.00, 'Projector, screen, and basic sound system');
