# 🛠️ LaborLink - HyperLocal Skilled Worker Marketplace

**LaborLink** is a premium web platform designed to bridge the gap between neighborhood residents (Customers) looking for fast, reliable help and local skilled trade professionals (Workers) looking for local job opportunities. 

The application is structured to deliver a seamless service booking lifecycle, backed by real-time analytics, user filters, secure transactions, and a clean administrative oversight dashboard.

---

## 🚀 Key Functional Features & User Flows

LaborLink serves three distinct user personas, each equipped with dedicated services and tools:

### 1. Customer Services
* **Skilled Worker Directory**: Customers can browse active trade professionals, with direct filtering by category (e.g. Electrician, Plumber, Carpenter, Painter).
* **Booking Creation**: Select a worker and submit a service request containing the task location, service date, and description of the repair work.
* **Transaction Log**: Track active bookings under a personal dashboard tab, complete with status updates.
* **Rating & Feedback**: Provide ratings (out of 5 stars) on completed jobs, dynamically updating the worker's average rating.

### 2. Worker Services
* **Professional Stats Dashboard**: Real-time metrics tracking *Active Offers*, *Completed Jobs*, and *Average Rating*.
* **Availability Toggle**: A one-click status switch (`AVAILABLE` / `BUSY`). Switching to `BUSY` instantly hides the worker's card from customer searches to prevent overbooking.
* **Active Proposal Cards**: Review incoming requests displaying the client's name, phone number, task location, requested date, and description.
* **Accept / Reject Actions**: Accept or decline proposals. Accepting a request immediately transitions the transaction from `PENDING` to `ACCEPTED` in the database.
* **Proposal History Log**: Review past transactions, completed bookings, and ratings received from customers.

### 3. Administrative Control Center
* **Transaction Analytics Dashboard**: Overview counters summarizing the total *Accepted*, *Pending*, and *Rejected* bookings across the platform.
* **Workers Directory Panel**: Search workers by name or skill, view average ratings, check availability, view their total assigned bookings count column, and open a booking history lookup modal with a `Total: X Bookings` badge in the header.
* **Customers Directory Panel**: Search customers by name or email, view a dedicated column showing the number of bookings they have placed, and open their individual booking history logs.
* **Profile Registrations**: Directly register new Customer or Worker profiles. To avoid browser auto-fill issues, form fields are completely empty by default and display placeholder guidelines (e.g. `ex: user@domain.com`).

---

## 💻 Technology Stack & Architecture

```
┌─────────────────────────────────┐
│        Vite + React UI          │
│  (React Hooks, Responsive SVGs) │
└────────────────▲────────────────┘
                 │
                 │ JSON REST APIs
                 ▼
┌─────────────────────────────────┐
│     Spring Boot Web Service     │
│   (REST Controllers & DTOs)     │
└────────────────▲────────────────┘
                 │
                 │ Spring Data JPA / Hibernate
                 ▼
┌─────────────────────────────────┐
│       MySQL Server Database     │
│ (Users, Profiles, Bookings Logs)│
└─────────────────────────────────┘
```

### Frontend (`laborlink-frontend`)
* **Core**: React (built with Vite) for modular component state management.
* **Styling**: Vanilla CSS with full dark-themed layout variables, neon glowing borders, smooth card hover states, and disabled scrollbars for a fullscreen app look.
* **Assets**: Inline animated vector SVGs on the registration panel that scale dynamically across viewports.

### Backend (`workplace`)
* **Core**: Spring Boot (Java) implementing RESTful MVC controllers.
* **Persistence Layer**: Spring Data JPA and Hibernate ORM for relational queries.
* **Database**: MySQL Server.
* **Seeding Check**: Seeds the `adminworkplace@gmail.com` profile on startup if it is not present in the database.

---

## 🗄️ Database Schema & Entities

The application stores data in the `laborlink_db` database using three primary mapped entities:

```
    ┌───────────────┐
    │     users     │ (One-to-One with worker_profiles)
    │  (Role: Role) │
    └───────▲───────┘
            │ 1
            ├───────────────────────┐
            │ 1:Many                │ 1:Many (Customer ID)
            ▼                       ▼
   ┌─────────────────┐     ┌─────────────────┐
   │ worker_profiles │     │    bookings     │
   │   (user_id)     │     │ (worker_id,    │
   └────────▲────────┘     │  customer_id)   │
            │ 1            └─────────────────┘
            └───────────────────────┘
                     1:Many (Worker ID)
```

1. **`users` Table**: Contains account credentials.
   * `user_id` (PK), `name`, `email`, `phone`, `password`, `city`, `district`, `state`, `role` (`CUSTOMER`, `WORKER`, `ADMIN`), `private_question`, `security_answer`.
2. **`worker_profiles` Table**: Connected to `users` via a One-to-One mapping.
   * `worker_id` (PK), `user_id` (FK), `skill` (trade skill category), `experience` (years), `location` (city, state), `availability` (`AVAILABLE`, `BUSY`), `rating` (double).
3. **`bookings` Table**: Forms a Many-to-One connection with `users` (as customer) and `worker_profiles` (as worker).
   * `booking_id` (PK), `customer_id` (FK), `worker_id` (FK), `work_description` (text), `location` (text), `booking_date` (date), `status` (`PENDING`, `ACCEPTED`, `REJECTED`), `rating` (double).

---

## 🛠️ Local Installation & Run Guide

### Prerequisites
* Java JDK (version 17 or higher)
* Node.js (version 18 or higher)
* MySQL Server (running on port `3306`)

---

### Step 1: Database Setup
1. Open your MySQL client and create the database:
   ```sql
   CREATE DATABASE laborlink_db;
   ```
2. Check `workplace/src/main/resources/application.properties` and verify your username and password:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/laborlink_db
   spring.datasource.username=YOUR_USERNAME
   spring.datasource.password=YOUR_PASSWORD
   spring.jpa.hibernate.ddl-auto=update
   ```

---

### Step 2: Run the Spring Boot Backend
1. Open a terminal in the `/workplace` directory.
2. Build and run the project:
   ```cmd
   mvnw spring-boot:run
   ```
   *The backend will automatically start on port `8080`.*

---

### Step 3: Run the Vite React Frontend
1. Open a terminal in the `/laborlink-frontend` directory.
2. Install dependency packages:
   ```cmd
   npm install
   ```
3. Launch the development server:
   ```cmd
   npm run dev
   ```
   *The frontend will open on port `5173`.*

---

## 🔑 Default Profiles for Testing

You can use these pre-configured user credentials to log in and test the system:

* **Administrator Profile**
  * **Email**: `adminworkplace@gmail.com`
  * **Password**: `ADMIN_PASSWORD`
* **Skilled Worker (Electrician) Profile**
  * **Email**: `suresh@gmail.com`
  * **Password**: `password`
* **Default Customer Profile**
  * **Email**: `jane@gmail.com`
  * **Password**: `password`

---


