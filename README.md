# 🚖 CampusRide – Real-Time Campus Mobility & Ride Management Platform

## 📌 Overview

CampusRide is a real-time ride management platform designed for large campus environments such as IIT Roorkee. The platform connects passengers and drivers through a centralized system, enabling seamless ride booking, ride assignment, real-time ride tracking, driver management, and feedback collection.

The application aims to improve transportation efficiency by replacing fragmented ride coordination methods with a scalable, technology-driven solution.

---

## ✨ Features

### 🔐 Authentication & User Management

* Passenger Registration & Login
* Driver Registration & Login
* JWT-based Authentication
* User Profile Management

### 🚗 Driver Management

* Go Online / Offline
* Driver Verification Information
* Vehicle Information Management
* Driver Availability Tracking

### 🎯 Ride Request Workflow

* Request a Ride
* Select Pickup Location
* Select Destination
* View Ride Status

### 📡 Real-Time Communication

* Live Ride Status Updates
* Real-Time Driver Availability Updates
* Instant Ride Assignment Notifications
* WebSocket / Socket.IO Integration

### 🔄 Ride Lifecycle Management

* Requested
* Accepted
* In Progress
* Completed
* Cancelled

### 📊 Driver Dashboard

* Total Rides Completed
* Active Rides
* Ride History
* Driver Ratings
* Performance Statistics

### ⭐ Ratings & Feedback

* Passenger Rating System
* Written Feedback
* Average Driver Ratings
* Feedback History

---

## 🏗️ System Architecture

Frontend (React)
│
▼
Backend API (Node.js + Express)
│
▼
Socket.IO Server
│
▼
MongoDB Atlas Database

---

## 🛠️ Technology Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Axios

### Backend

* Node.js
* Express.js
* Socket.IO
* JWT Authentication

### Database

* MongoDB Atlas
* Mongoose ODM

### Version Control

* Git
* GitHub

---

## 📂 Project Structure

project-root/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── socket/
│   └── package.json
│
└── README.md

---

## ⚙️ Setup Instructions

### Prerequisites

* Node.js (v18+ recommended)
* npm
* MongoDB Atlas Account

### Clone Repository

git clone <repository-url>

cd <repository-name>

---

## Backend Setup

Navigate to backend folder:

cd backend

Install dependencies:

npm install

Create a .env file:

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

PORT=5000

Run backend:

npm start

Backend runs on:

http://localhost:5000

---

## Frontend Setup

Navigate to frontend folder:

cd frontend

Install dependencies:

npm install

Create .env file:

VITE_API_URL=http://localhost:5000

Run frontend:

npm run dev

Frontend runs on:

http://localhost:5173

---

## 🚀 Running the Application

1. Start MongoDB Atlas connection.
2. Start backend server.
3. Start frontend application.
4. Register Passenger and Driver accounts.
5. Set Driver status to Online.
6. Request rides as Passenger.
7. Accept rides as Driver.
8. Track ride progress in real time.
9. Complete ride and submit ratings.

---

## 📸 Demonstrated Workflows

* User Registration & Login
* Driver Availability Management
* Ride Request Workflow
* Ride Assignment Process
* Real-Time Ride Updates
* Ride Lifecycle Tracking
* Driver Dashboard Analytics
* Ratings & Feedback System

---

## 🎯 Key Engineering Highlights

* Real-Time Communication using Socket.IO
* Consistent Ride State Management
* Secure JWT Authentication
* Modular Backend Architecture
* Scalable Database Design
* Responsive User Interface

---



For educational and demonstration purposes only.
