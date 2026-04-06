# Zorvyn Screening Test - Backend Developer Intern

Hello, and thank you for reviewing my submission for the Backend Developer Intern screening test at Zorvyn.

I have designed and implemented a production-ready REST API for a Finance Dashboard. Instead of assembling a basic CRUD application, I focused heavily on software architecture, security, and scalability. This document outlines the rationale behind my technical decisions, the features I have built, and detailed instructions on how to evaluate the API.

---

## 1. Quick Start Guide

To get the application running locally and begin testing, please follow these steps:

### Prerequisites
- Node.js (v18.0.0 or higher)
- A local MongoDB instance or a MongoDB Atlas URI

### Installation & Execution
```bash
# 1. Install all dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Note: Please ensure your MONGODB_URI and JWT_SECRET are correctly set in the .env file.

# 3. Seed the database with sample roles and financial records
npm run seed

# 4. Start the development server
npm run dev
```

### Automated Testing
I have provided two distinct ways to verify the functionality and security of the API:

1. **Unit & Integration Tests:** Run `npm run test`. I built a test suite using Jest and Supertest to automatically verify API endpoints and application health.
2. **API Collection:** Import `Finance_Dashboard_API_collection.json` into your testing client. It contains pre-configured tests that validate Role-Based Access Control (RBAC), endpoint security, and business logic. The raw successful execution output is also available in `Final_Test_Results.json` for your review.

---

## 2. Architecture & Design Decisions

My primary goal was to ensure the application is modular, testable, and strictly adheres to the Single Responsibility Principle. To achieve this, I implemented a Layered Architecture (Controller -> Service -> Model).

### The Layered Approach
- **Controllers:** Kept as thin as possible. Their only responsibility is to parse incoming HTTP requests, pass the payload to the respective service, and return standardized JSON responses.
- **Services:** This layer encapsulates all business logic. By isolating database operations (such as complex MongoDB aggregations or soft-delete mechanics) into the service layer, the application becomes highly reusable and easily unit-testable independent of the Express HTTP context.
- **Middleware:** Handles cross-cutting concerns globally, such as Authentication, Role Authorization, Joi Validation, and Rate Limiting.

### Technology Stack & Rationale
- **Node.js & Express:** Chosen for their non-blocking I/O efficiency and industry-standard routing capabilities.
- **MongoDB & Mongoose:** I specifically utilized MongoDB because of its powerful Aggregation Framework. Instead of fetching thousands of records and mapping them in Node.js memory, I compute analytics (such as monthly trends and category breakdowns) directly at the database layer.
- **Joi:** Selected for request validation because it enforces strict schemas before the request ever reaches the controller, preventing invalid data from entering the database.
- **JWT & bcryptjs:** Implemented for secure, stateless authentication and secure password hashing.

---

## 3. Core Features Implemented

### Role-Based Access Control (RBAC)
I built a custom authorization middleware to enforce strict role boundaries across all API routes:
- **Admin:** Full privileges. Can manage users, and create, update, or soft-delete financial records.
- **Analyst:** Read-only access to records, but possesses full access to the Analytics Dashboard to view financial trends based on the data.
- **Viewer:** Strictly limited to reading basic records. The system actively blocks Viewers from mutating data or accessing the Analytics Dashboard (returns 403 Forbidden).

### Dashboard Analytics (Database Aggregations)
I utilized Mongoose aggregation pipelines within `dashboard.service.js` to calculate:
- **Financial Summary:** Calculates the exact net balance, total income, and total expense across all active records.
- **Category Breakdowns:** Groups expenses and income dynamically by category for visual graph representation.
- **Monthly Trends:** Groups financial trajectories on a month-over-month basis.

### Smart Search & Pagination
The `GET /api/records` endpoint is built to handle large datasets efficiently:
- **Pagination:** Controlled via `?page=1&limit=10` query parameters.
- **Filters:** Supports strict matching for `type`, `category`, `startDate`, and `endDate`.
- **Text Search:** Implemented a `?search=keyword` parameter that securely performs a Regex search across both the "note" and "category" fields simultaneously.

### Security & Production Standards
- **Soft Deletes:** Deleting a record updates an `isDeleted: true` flag rather than permanently wiping the row. This guarantees that historical analytics graphs do not break when an old record is removed.
- **Rate Limiting:** Integrated `express-rate-limit` to prevent brute-force login attacks and general API abuse.
- **Standardized Responses:** Every API response is routed through a custom `ApiResponse` class, guaranteeing a strict `{ success, message, data }` contract for the frontend.

---

## 4. API Endpoint Reference

Below is a detailed map of the API structure. All endpoints are prefixed with `http://localhost:5000/api`.

### Authentication
- `POST /auth/login` (Public) - Authenticates a user and returns a JWT.
- `POST /auth/register` (Admin Only) - Registers a new user with a specific role.

### User Management
- `POST /users` (Admin Only) - Creates a user account.
- `GET /users` (Admin Only) - Lists all users.
- `GET /users?role=analyst` (Admin Only) - Filters users by role.
- `PATCH /users/:id` (Admin Only) - Updates user status or details.

### Financial Records
- `POST /records` (Admin Only) - Creates a new financial record.
- `GET /records` (All Roles) - Retrieves records (supports pagination, filtering, and text search).
- `GET /records/:id` (All Roles) - Retrieves a specific record.
- `PATCH /records/:id` (Admin Only) - Updates note, amount, or category.
- `DELETE /records/:id` (Admin Only) - Soft-deletes a record.

### Dashboard & Analytics
- `GET /dashboard/summary` (Admin, Analyst) - Calculates global financial totals.
- `GET /dashboard/category-breakdown` (Admin, Analyst) - Aggregates totals grouped by category.
- `GET /dashboard/trends` (Admin, Analyst) - Aggregates income/expense sequentially by month.
- `GET /dashboard/recent` (Admin, Analyst) - Returns the 5 most recently created transactions.

---

## Final Thoughts

I treated this screening test exactly as I would treat a professional, production-level Jira ticket. My goal was to demonstrate clean coding practices, secure API design, and a solid grasp of backend architecture. Please feel free to review the test outputs or run the endpoints locally to see the application in action.

Thank you again for your time and for reviewing my application!
