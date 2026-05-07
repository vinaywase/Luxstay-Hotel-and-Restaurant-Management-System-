DROP TABLE IF EXISTS users;

INSERT INTO customers (customer_id, first_name, last_name, email, phone_number, username, password, address, loyalty_points, registration_date) VALUES 
(1, 'John', 'Doe', 'john.doe1@example.com', '1234567891', 'john_doe', 'customer123', '123 Elm St', 50, '2023-01-01'),
(2, 'Jane', 'Smith', 'jane.smith2@example.com', '1234567892', 'jane_smith', 'customer123', '456 Oak St', 100, '2023-01-02'),
(3, 'Robert', 'Brown', 'bob.brown3@example.com', '1234567893', 'bob_brown', 'customer123', '789 Pine St', 20, '2023-01-03'),
(4, 'Emily', 'Davis', 'emily.davis4@example.com', '1234567894', 'emily_davis', 'customer123', '101 Maple Ave', 0, '2023-01-04'),
(5, 'Michael', 'Miller', 'millerm5@example.com', '1234567895', 'michael_miller', 'customer123', '202 Birch Blvd', 250, '2023-01-05'),
(6, 'Sarah', 'Wilson', 'sarah.w6@example.com', '1234567896', 'sarah_wilson', 'customer123', '303 Cedar Rd', 30, '2023-01-06'),
(7, 'David', 'Moore', 'david.m7@example.com', '1234567897', 'david_moore', 'customer123', '404 Walnut St', 10, '2023-01-07'),
(8, 'Laura', 'Taylor', 'laura.t8@example.com', '1234567898', 'laura_taylor', 'customer123', '505 Ash Dr', 80, '2023-01-08'),
(9, 'James', 'Anderson', 'james.a9@example.com', '1234567899', 'james_anderson', 'customer123', '606 Cherry Ln', 150, '2023-01-09'),
(10, 'Linda', 'Thomas', 'laura.t10@example.com', '1234567810', 'linda_thomas', 'customer123', '707 Poplar Way', 200, '2023-01-10');

INSERT INTO rooms (room_id, room_number, room_type, price_per_night, status, capacity) VALUES 
(1, '101', 'Single', 100.00, 'available', 1),
(2, '102', 'Double', 150.00, 'available', 2),
(3, '103', 'Suite', 300.00, 'available', 4),
(4, '201', 'Single', 100.00, 'available', 1),
(5, '202', 'Double', 150.00, 'maintenance', 2),
(6, '203', 'Suite', 300.00, 'available', 4),
(7, '301', 'Single', 100.00, 'available', 1),
(8, '302', 'Double', 150.00, 'available', 2),
(9, '303', 'Suite', 300.00, 'available', 4),
(10, '401', 'Single', 100.00, 'available', 1);

INSERT INTO staff (staff_id, first_name, last_name, email, phone_number, position, hire_date, username, password, role) VALUES 
(1, 'Alice', 'White', 'alice.w@staff.com', '9876543211', 'Manager', '2022-01-01', 'alice_w', 'staff123', 'STAFF'),
(2, 'Bob', 'Black', 'bob.b@staff.com', '9876543212', 'Receptionist', '2022-02-01', 'bob_b', 'staff123', 'STAFF'),
(3, 'Charlie', 'Green', 'charlie.g@staff.com', '9876543213', 'Chef', '2022-03-01', 'charlie_g', 'staff123', 'STAFF'),
(4, 'Diana', 'Blue', 'diana.b@staff.com', '9876543214', 'Waiter', '2022-04-01', 'diana_b', 'staff123', 'STAFF'),
(5, 'Eve', 'Red', 'eve.r@staff.com', '9876543215', 'Housekeeping', '2022-05-01', 'eve_r', 'staff123', 'STAFF'),
(6, 'Frank', 'Yellow', 'frank.y@staff.com', '9876543216', 'Bartender', '2022-06-01', 'frank_y', 'staff123', 'STAFF'),
(7, 'Grace', 'Pink', 'grace.p@staff.com', '9876543217', 'Security', '2022-07-01', 'grace_p', 'staff123', 'STAFF'),
(8, 'Harry', 'Orange', 'harry.o@staff.com', '9876543218', 'Valet', '2022-08-01', 'harry_o', 'staff123', 'STAFF'),
(9, 'Ivy', 'Brown', 'ivy.b@staff.com', '9876543219', 'Concierge', '2022-09-01', 'ivy_b', 'staff123', 'STAFF'),
(10, 'Jack', 'Gray', 'jack.g@staff.com', '9876543220', 'Event Coordinator', '2022-10-01', 'jack_g', 'staff123', 'STAFF'),
(11, 'Admin', 'User', 'admin@example.com', '1234567890', 'Administrator', '2022-01-01', 'admin', 'admin123', 'ADMIN');

INSERT INTO restaurants (restaurant_id, name, location, opening_time, closing_time) VALUES 
(1, 'The Grand Dining', 'Lobby Level', '07:00:00', '22:00:00'),
(2, 'Ocean View Cafe', 'Rooftop', '08:00:00', '23:00:00'),
(3, 'Steakhouse Elite', 'Basement', '17:00:00', '23:00:00'),
(4, 'Morning Bites', 'East Wing', '06:00:00', '12:00:00'),
(5, 'Lounge Bar', 'Lobby Level', '12:00:00', '02:00:00'),
(6, 'Sunset Grill', 'West Wing', '16:00:00', '22:00:00'),
(7, 'Healthy Greens', 'Poolside', '09:00:00', '20:00:00'),
(8, 'Italian Fresco', 'North Wing', '11:00:00', '22:00:00'),
(9, 'Asian Fusion', 'South Wing', '12:00:00', '22:00:00'),
(10, 'Dessert Paradise', 'Lobby Level', '10:00:00', '21:00:00');

INSERT INTO food_items (food_item_id, name, description, price, category, availability) VALUES 
(1, 'Caesar Salad', 'Fresh lettuce with caesar dressing', 12.50, 'Appetizer', true),
(2, 'Tomato Soup', 'Warm soup with basil', 8.50, 'Appetizer', true),
(3, 'Grilled Salmon', 'Premium salmon fillet', 25.00, 'Main Course', true),
(4, 'Beef Steak', 'Rib eye steak with potatoes', 30.00, 'Main Course', true),
(5, 'Spaghetti Bolognese', 'Classic Italian pasta', 18.00, 'Main Course', true),
(6, 'Cheesecake', 'New York style cheesecake', 7.50, 'Dessert', true),
(7, 'Chocolate Brownie', 'Rich chocolate slice', 6.00, 'Dessert', true),
(8, 'Red Wine', 'Glass of Merlot', 15.00, 'Beverage', true),
(9, 'Orange Juice', 'Freshly squeezed', 5.00, 'Beverage', true),
(10, 'Coffee', 'Fresh brewed espresso', 4.00, 'Beverage', true);

INSERT INTO restaurant_tables (table_id, table_number, seating_capacity, status, occupied_seats) VALUES 
(1, 'T1', 2, 'available', 0),
(2, 'T2', 2, 'available', 0),
(3, 'T3', 4, 'available', 0),
(4, 'T4', 4, 'available', 0),
(5, 'T5', 6, 'available', 0),
(6, 'T6', 6, 'available', 0),
(7, 'T7', 8, 'available', 0),
(8, 'T8', 8, 'available', 0),
(9, 'T9', 10, 'available', 0),
(10, 'T10', 10, 'available', 0);

INSERT INTO menus (menu_id, food_item_id, available) VALUES 
(1, 1, true),
(2, 2, true),
(3, 3, true),
(4, 4, true),
(5, 5, true),
(6, 6, true),
(7, 7, true),
(8, 8, true),
(9, 9, true),
(10, 10, true);

INSERT INTO reservations (reservation_id, customer_id, room_id, check_in_date, check_out_date, total_cost, status) VALUES 
(1, 1, 1, '2023-10-01', '2023-10-03', 200.00, 'checked-out'),
(2, 2, 2, '2023-10-05', '2023-10-07', 300.00, 'checked-out'),
(3, 3, 3, '2023-10-10', '2023-10-12', 600.00, 'checked-out'),
(4, 4, 4, '2023-10-15', '2023-10-16', 100.00, 'checked-out'),
(5, 5, 5, '2023-10-20', '2023-10-25', 750.00, 'canceled'),
(6, 6, 6, '2023-11-01', '2023-11-05', 1200.00, 'checked-out'),
(7, 7, 7, '2023-11-10', '2023-11-12', 200.00, 'checked-out'),
(8, 8, 8, '2023-11-15', '2023-11-20', 750.00, 'checked-out'),
(9, 9, 9, '2023-11-25', '2023-11-30', 1500.00, 'checked-out'),
(10, 10, 10, '2023-12-01', '2023-12-05', 400.00, 'checked-out');

INSERT INTO inventory (inventory_id, food_item_id, quantity, minimum_threshold, last_updated) VALUES 
(1, 1, 50, 10, CURRENT_TIMESTAMP),
(2, 2, 30, 10, CURRENT_TIMESTAMP),
(3, 3, 20, 5, CURRENT_TIMESTAMP),
(4, 4, 15, 5, CURRENT_TIMESTAMP),
(5, 5, 40, 10, CURRENT_TIMESTAMP),
(6, 6, 25, 5, CURRENT_TIMESTAMP),
(7, 7, 35, 10, CURRENT_TIMESTAMP),
(8, 8, 100, 20, CURRENT_TIMESTAMP),
(9, 9, 80, 15, CURRENT_TIMESTAMP),
(10, 10, 200, 50, CURRENT_TIMESTAMP);

INSERT INTO events (event_id, customer_id, staff_id, name, event_date, location, status, cost) VALUES 
(1, 1, 10, 'Wedding Anniversary', '2023-11-05', 'Banquet Hall A', 'planned', 1500.00),
(2, 2, 10, 'Corporate Conference', '2023-11-12', 'Conference Room 1', 'planned', 2500.00),
(3, 3, 10, 'Birthday Party', '2023-11-20', 'Rooftop Terrace', 'planned', 800.00),
(4, 4, 10, 'Tech Meetup', '2023-12-01', 'Banquet Hall B', 'planned', 1200.00),
(5, 5, 10, 'Gala Dinner', '2023-12-15', 'Grand Ballroom', 'planned', 5000.00),
(6, 6, 10, 'Team Building', '2024-01-10', 'Outdoor Garden', 'planned', 1000.00),
(7, 7, 10, 'Product Launch', '2024-01-20', 'Conference Room 2', 'planned', 3000.00),
(8, 8, 10, 'Charity Auction', '2024-02-05', 'Grand Ballroom', 'planned', 4500.00),
(9, 9, 10, 'Alumni Reunion', '2024-02-15', 'Banquet Hall A', 'planned', 2000.00),
(10, 10, 10, 'Art Exhibition', '2024-03-01', 'Lobby Atrium', 'planned', 1800.00);

INSERT INTO restaurant_orders (order_id, customer_id, staff_id, table_id, order_date, total_cost, status, dining_location, bill_id) VALUES 
(1, 1, 4, 1, CURRENT_TIMESTAMP, 45.00, 'completed', 'cafeteria', 2),
(2, 2, 4, 2, CURRENT_TIMESTAMP, 60.50, 'pending', 'cafeteria', 4),
(3, 3, 6, 3, CURRENT_TIMESTAMP, 15.00, 'completed', 'room', 6),
(4, 4, 4, 4, CURRENT_TIMESTAMP, 80.00, 'completed', 'cafeteria', 8),
(5, 5, 6, 5, CURRENT_TIMESTAMP, 100.00, 'canceled', 'room', NULL),
(6, 6, 4, 6, CURRENT_TIMESTAMP, 35.50, 'completed', 'cafeteria', 10),
(7, 7, 4, 7, CURRENT_TIMESTAMP, 120.00, 'pending', 'room', NULL),
(8, 8, 6, 8, CURRENT_TIMESTAMP, 25.00, 'completed', 'room', NULL),
(9, 9, 4, 9, CURRENT_TIMESTAMP, 50.00, 'completed', 'cafeteria', NULL),
(10, 10, 6, 10, CURRENT_TIMESTAMP, 70.00, 'completed', 'cafeteria', NULL);

INSERT INTO bills (bill_id, reservation_id, event_id, total_amount, bill_date, payment_status) VALUES 
(1, 1, NULL, 200.00, CURRENT_TIMESTAMP, 'paid'),
(2, NULL, NULL, 45.00, CURRENT_TIMESTAMP, 'paid'),
(3, 2, NULL, 300.00, CURRENT_TIMESTAMP, 'pending'),
(4, NULL, NULL, 60.50, CURRENT_TIMESTAMP, 'pending'),
(5, 3, NULL, 600.00, CURRENT_TIMESTAMP, 'pending'),
(6, NULL, NULL, 15.00, CURRENT_TIMESTAMP, 'paid'),
(7, 4, NULL, 100.00, CURRENT_TIMESTAMP, 'pending'),
(8, NULL, NULL, 80.00, CURRENT_TIMESTAMP, 'paid'),
(9, 6, NULL, 1200.00, CURRENT_TIMESTAMP, 'pending'),
(10, NULL, NULL, 35.50, CURRENT_TIMESTAMP, 'paid'),
(11, NULL, 1, 1500.00, CURRENT_TIMESTAMP, 'pending');

INSERT INTO payments (payment_id, bill_id, payment_date, payment_method, amount_paid) VALUES 
(1, 1, CURRENT_TIMESTAMP, 'credit_card', 200.00),
(2, 2, CURRENT_TIMESTAMP, 'cash', 45.00),
(3, 6, CURRENT_TIMESTAMP, 'debit_card', 15.00),
(4, 8, CURRENT_TIMESTAMP, 'online', 80.00),
(5, 10, CURRENT_TIMESTAMP, 'credit_card', 35.50),
(6, 3, CURRENT_TIMESTAMP, 'cash', 50.00), 
(7, 4, CURRENT_TIMESTAMP, 'debit_card', 20.00), 
(8, 5, CURRENT_TIMESTAMP, 'credit_card', 100.00),
(9, 7, CURRENT_TIMESTAMP, 'online', 50.00),
(10, 9, CURRENT_TIMESTAMP, 'cash', 200.00);

INSERT INTO service_requests (service_request_id, customer_id, staff_id, request_type, request_date, status, cost, bill_id) VALUES 
(1, 1, 5, 'Room Cleaning', CURRENT_TIMESTAMP, 'completed', 0.00, 1),
(2, 2, 5, 'Extra Towels', CURRENT_TIMESTAMP, 'pending', 0.00, 3),
(3, 3, 9, 'Taxi Booking', CURRENT_TIMESTAMP, 'completed', 25.00, 5),
(4, 4, 4, 'Room Service', CURRENT_TIMESTAMP, 'completed', 10.00, 7),
(5, 6, 5, 'Maintenance', CURRENT_TIMESTAMP, 'pending', 0.00, 9),
(6, 7, 5, 'Room Cleaning', CURRENT_TIMESTAMP, 'pending', 0.00, NULL),
(7, 8, 9, 'Wake Up Call', CURRENT_TIMESTAMP, 'completed', 5.00, NULL),
(8, 9, 9, 'Luggage Assistance', CURRENT_TIMESTAMP, 'completed', 10.00, NULL),
(9, 10, 4, 'Room Service', CURRENT_TIMESTAMP, 'completed', 15.00, NULL),
(10, 1, 5, 'Extra Pillows', CURRENT_TIMESTAMP, 'pending', 0.00, NULL);

INSERT INTO feedbacks (feedback_id, customer_id, feedback_date, rating, comments) VALUES 
(1, 1, '2023-10-04', 5, 'Great stay, very comfortable.'),
(2, 3, '2023-10-13', 4, 'Food was good but room was a bit small.'),
(3, 4, '2023-10-17', 5, 'Excellent service and friendly staff.'),
(4, 2, '2023-10-08', 3, 'Average experience, clean rooms.'),
(5, 6, '2023-11-06', 4, 'Nice location and view.'),
(6, 7, '2023-11-13', 5, 'Will definitely come back!'),
(7, 8, '2023-11-21', 2, 'A bit noisy at night.'),
(8, 9, '2023-12-01', 5, 'Perfect luxury experience.'),
(9, 10, '2023-12-06', 4, 'Breakfast options could be better.'),
(10, 1, '2023-12-10', 5, 'Loved the restaurant food.');

