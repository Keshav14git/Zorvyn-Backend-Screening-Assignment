# Finance Dashboard API Documentation

This document provides a detailed specification of all available endpoints in the Finance Dashboard REST API. 

## Base Configuration

- **Base URL:** `http://localhost:5000/api`
- **Content-Type:** `application/json`

## Authentication
Most endpoints require a valid JSON Web Token (JWT) provided in the request headers:
```
Authorization: Bearer <your_jwt_token>
```

## Standard Response Format
All API responses strictly adhere to the following JSON structure:
```json
{
  "success": true,
  "message": "Human-readable description of the result.",
  "data": { ... } // Payload (null on failures or deletions)
}
```

---

## 1. System Health

### GET `/health`
Verifies that the API server is active and responding.

- **Auth Required:** None (Public)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Finance Dashboard API is running.",
  "data": {
    "environment": "development",
    "uptime": "120s"
  }
}
```

---

## 2. Authentication

### POST `/auth/login`
Authenticates a user and issues a JWT token.

- **Auth Required:** None (Public)
- **Request Body:**
```json
{
  "email": "admin@finance.com",    // string, required, valid email
  "password": "admin123"           // string, required
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "_id": "60d...123",
      "name": "Admin User",
      "email": "admin@finance.com",
      "role": "admin",
      "status": "active"
    },
    "token": "eyJhb..."
  }
}
```

### POST `/auth/register`
Registers a new user into the system.

- **Auth Required:** `admin`
- **Request Body:**
```json
{
  "name": "New User",              // string, required, max 50 chars
  "email": "user@finance.com",     // string, required, valid email
  "password": "password123",       // string, required, min 6 chars
  "role": "viewer"                 // string, required (admin, analyst, viewer)
}
```
- **Response (201 Created):** Returns user object (excluding password).

---

## 3. User Management

### POST `/users`
Creates a new user profile directly. Identical to register but structured for internal user management.

- **Auth Required:** `admin`
- **Request Body:** Requires `name`, `email`, `password`, `role`, and optional `status` (active/inactive).
- **Response (201 Created)**

### GET `/users`
Retrieves a paginated list of all users in the system.

- **Auth Required:** `admin`
- **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `role` (string, optional: admin, analyst, viewer)
- **Response (200 OK):** Returns a list of users and a `pagination` metadata object.

### PATCH `/users/:id`
Updates an existing user's details or deactivates their account.

- **Auth Required:** `admin`
- **Path Parameter:** `id` (Valid MongoDB ObjectId)
- **Request Body (At least one field required):** `name`, `role`, or `status`.
- **Response (200 OK):** Returns the updated user object.

---

## 4. Financial Records

### POST `/records`
Logs a new income or expense.

- **Auth Required:** `admin`
- **Request Body:**
```json
{
  "amount": 5000,                  // number, required, > 0
  "type": "income",                // string, required (income, expense)
  "category": "Salary",            // string, required, max 50 chars
  "date": "2024-06-01T00:00:00Z",  // string, required (ISO Date Format)
  "note": "Monthly payment"        // string, optional, max 500 chars
}
```
- **Response (201 Created):** Returns the newly generated financial record.

### GET `/records`
Fetches all financial records. Supports searching, sorting, mapping, and heavy filtering.

- **Auth Required:** `admin`, `analyst`, `viewer`
- **Query Parameters:**
  - `page` / `limit` (numbers, pagination)
  - `type` (string: income, expense)
  - `category` (string: strict match)
  - `search` (string: case-insensitive regex search against notes and categories)
  - `startDate` / `endDate` (ISO Date strings for ranging)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Records retrieved successfully.",
  "data": {
    "records": [{ ... }],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 42,
      "limit": 10
    }
  }
}
```

### GET `/records/:id`
Fetches a single financial record by its highly specific ID.

- **Auth Required:** `admin`, `analyst`, `viewer`
- **Path Parameter:** `id` (Valid MongoDB ObjectId)
- **Response (200 OK)**

### PATCH `/records/:id`
Updates fields on an existing financial transaction.

- **Auth Required:** `admin`
- **Path Parameter:** `id` (Valid MongoDB ObjectId)
- **Request Body:** Partial object containing any of `amount`, `type`, `category`, `date`, or `note`.
- **Response (200 OK)**

### DELETE `/records/:id`
Soft-deletes a record from the database. It will no longer appear in standard queries or analytics.

- **Auth Required:** `admin`
- **Path Parameter:** `id` (Valid MongoDB ObjectId)
- **Response (200 OK):** `data` payload will be `null`.

---

## 5. Dashboard & Analytics

### GET `/dashboard/summary`
Calculates high-level statistical summaries.

- **Auth Required:** `admin`, `analyst`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Dashboard summary retrieved successfully.",
  "data": {
    "totalIncome": 125000,
    "totalExpense": 42000,
    "netBalance": 83000
  }
}
```

### GET `/dashboard/category-breakdown`
Computes total spending and earning algorithms grouped by specific categories.

- **Auth Required:** `admin`, `analyst`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Category breakdown retrieved successfully.",
  "data": {
    "income": [
      { "_id": "Salary", "total": 120000 }
    ],
    "expense": [
      { "_id": "Rent", "total": 24000 },
      { "_id": "Marketing", "total": 18000 }
    ]
  }
}
```

### GET `/dashboard/trends`
Calculates financial trajectories on a month-over-month basis.

- **Auth Required:** `admin`, `analyst`
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Monthly trends retrieved successfully.",
  "data": [
    {
      "month": "2024-01",
      "income": 10200,
      "expense": 1750
    },
    {
      "month": "2024-02",
      "income": 10500,
      "expense": 2830
    }
  ]
}
```

### GET `/dashboard/recent`
Returns the 5 most recently created transactions across the company.

- **Auth Required:** `admin`, `analyst`
- **Response (200 OK):** Returns a standard array of up to 5 fully populated record objects.

---

## Common Error Codes

The API uses standardized HTTP status codes to communicate execution failure context securely:

- **400 Bad Request:** Missing fields, invalid formatting, or generic Joi validation errors.
- **401 Unauthorized:** Missing or expired JWT Auth Token.
- **403 Forbidden:** The authenticated user does not have the required role to access this route, or their account has been marked `inactive`.
- **404 Not Found:** The targeted resource does not exist (or was soft-deleted).
- **409 Conflict:** Resource duplication (e.g., trying to register an email that already exists).
- **429 Too Many Requests:** The client has hit the rate limit threshold.
- **500 Internal Server Error:** An unexpected exception occurred.
