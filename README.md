# Hotel and Restaurant Management System

## Overview

The **Hotel and Restaurant Management System** is a full-stack web application designed to simplify hotel and restaurant operations. The system helps administrators, staff, and customers manage reservations, food orders, billing, event bookings, room management, and customer services from a single platform.

This project is built using:

* **Frontend:** React.js + Vite + Tailwind CSS
* **Backend:** Spring Boot (Java)
* **Database:** MySQL
* **Authentication:** JWT + Spring Security



# Features

## Customer Features

* User Registration & Login
* Hotel Room Booking
* Restaurant Food Ordering
* Event Booking & Payments
* View Bills & Booking History
* Service Request Management
* Customer Dashboard

## Admin Features

* Manage Rooms
* Manage Reservations
* Manage Menu Items
* Manage Orders
* Manage Billing
* Manage Customers
* Staff Management
* Event Request Management
* Service Package Management
* Refund Handling
* Dashboard Analytics

## Staff Features

* Staff Dashboard
* Handle Service Requests
* Manage Assigned Events
* Track Orders & Reservations



# Project Structure
bash
Hotel and Restaurant project/
│
├── frontend/                 # React Frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/                  # Spring Boot Backend
│   ├── src/main/java/
│   ├── src/main/resources/
│   └── pom.xml
│
└── package.json




# Technologies Used

## Frontend

* React.js
* React 19
* Vite
* React Router DOM
* Tailwind CSS
* Axios
* Recharts
* Lucide React

## Backend

* Java 17
* Spring Boot 3
* Spring Security
* Spring Data JPA
* JWT Authentication
* Maven

## Database

* MySQL



# Installation & Setup

## Prerequisites

Make sure the following are installed on your system:

* React.js Environment
* npm
* Java 17+
* Maven
* MySQL



# Frontend Setup

bash
cd frontend
npm install
npm run dev


Frontend runs on:

bash
http://localhost:5173


# Backend Setup

## Configure Database

Update your MySQL credentials inside:

bash
backend/src/main/resources/application.properties


Example:

properties
spring.datasource.url=jdbc:mysql://localhost:3306/hotel_management
spring.datasource.username=root
spring.datasource.password=your_password


## Run Backend

bash
cd backend
mvn spring-boot:run


Backend runs on:

bash
http://localhost:8080


# API Features

* JWT Authentication
* Secure Login & Registration
* CRUD Operations
* Reservation Management APIs
* Order Management APIs
* Billing APIs
* Event Booking APIs

# Available Pages

## Customer Pages

* Customer Dashboard
* Booking List
* Place Order
* My Event Bookings
* Customer Bills

## Admin Pages

* Admin Dashboard
* Manage Rooms
* Manage Reservations
* Manage Orders
* Manage Menu
* Manage Customers
* Manage Billing
* Staff List

## Staff Pages

* Staff Dashboard
* Staff Event Dashboard
* Staff Service Requests



# Security

The application uses:

* Spring Security
* JWT Token Authentication
* Role-Based Access Control


# Future Improvements

* Online Payment Gateway Integration
* Real-time Notifications
* Email & SMS Alerts
* Advanced Reporting Dashboard
* Multi-language Support
* Cloud Deployment



# Author
Vinay Arvind Wase


# License

This project is developed for educational and learning purposes.
