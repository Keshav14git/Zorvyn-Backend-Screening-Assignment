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
  "data": { } // Payload containing the requested resource
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
    "uptime": "120.45s"
  }
}
```

---

## 2. Authentication

### POST `/auth/login`
Authenticates an existing user and issues a JWT token.

- **Auth Required:** None (Public)
- **Request Body:**
```json
{
  "email": "admin@finance.com",
  "password": "admin123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "_id": "660c1234b3e9451a2c88f910",
      "name": "Admin User",
      "email": "admin@finance.com",
      "role": "admin",
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZ..."
  }
}
```

### POST `/auth/register`
Registers a new user. Only an Admin can securely register new employee accounts into the system to prevent unauthorized access.

- **Auth Required:** `admin`
- **Request Body:**
```json
{
  "name": "Jane Analyst",
  "email": "jane@finance.com",
  "password": "securepassword",
  "role": "analyst"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "_id": "660c125bb3e9451a2c88f915",
      "name": "Jane Analyst",
      "email": "jane@finance.com",
      "role": "analyst",
      "status": "active"
    }
  }
}
```

---

## 3. User Management

### POST `/users`
Directly creates a user profile. Similar to register, but explicitly structured for internal management systems.

- **Auth Required:** `admin`
- **Request Body:**
```json
{
  "name": "John Viewer",
  "email": "john@finance.com",
  "password": "password123",
  "role": "viewer",
  "status": "active"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully.",
  "data": {
    "user": {
      "_id": "660c127cb3e9451a2c88f920",
      "name": "John Viewer",
      "email": "john@finance.com",
      "role": "viewer",
      "status": "active"
    }
  }
}
```

### GET `/users`
Retrieves a list of all users in the system.

- **Auth Required:** `admin`
- **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `role` (string, optional: admin, analyst, viewer)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved successfully.",
  "data": {
    "users": [
      {
        "_id": "660c1234b3e9451a2c88f910",
        "name": "Admin User",
        "email": "admin@finance.com",
        "role": "admin",
        "status": "active"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCount": 1,
      "limit": 10
    }
  }
}
```

### PATCH `/users/:id`
Updates an existing user's details or deactivates their account.

- **Auth Required:** `admin`
- **Path Parameter:** `id` (Valid MongoDB ObjectId)
- **Request Body (Pass only the fields to update):**
```json
{
  "status": "inactive",
  "role": "viewer"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully.",
  "data": {
    "user": {
      "_id": "660c125bb3e9451a2c88f915",
      "name": "Jane Analyst",
      "email": "jane@finance.com",
      "role": "viewer",
      "status": "inactive"
    }
  }
}
```

---

## 4. Financial Records

### POST `/records`
Logs a new financial record (income or expense).

- **Auth Required:** `admin`
- **Request Body:**
```json
{
  "amount": 4500.50,
  "type": "income",
  "category": "Consulting",
  "date": "2024-05-15T00:00:00Z",
  "note": "Payment for software architecture consulting"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Record created successfully.",
  "data": {
    "record": {
      "_id": "660c2345c4f2461b2d99e120",
      "amount": 4500.5,
      "type": "income",
      "category": "Consulting",
      "date": "2024-05-15T00:00:00.000Z",
      "note": "Payment for software architecture consulting",
      "createdBy": "660c1234b3e9451a2c88f910",
      "isDeleted": false
    }
  }
}
```

### GET `/records`
Fetches a list of financial records. This endpoint supports heavy querying, text search, and pagination.

- **Auth Required:** `admin`, `analyst`, `viewer`
- **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `type` (string, optional: income, expense)
  - `category` (string, optional: strict match)
  - `search` (string, optional: case-insensitive regex search against notes and categories)
  - `startDate` (ISO Date string, optional)
  - `endDate` (ISO Date string, optional)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Records retrieved successfully.",
  "data": {
    "records": [
      {
        "_id": "660c2345c4f2461b2d99e120",
        "amount": 4500.5,
        "type": "income",
        "category": "Consulting",
        "date": "2024-05-15T00:00:00.000Z",
        "note": "Payment for software architecture consulting",
        "createdBy": {
          "_id": "660c1234b3e9451a2c88f910",
          "name": "Admin User",
          "email": "admin@finance.com",
          "role": "admin"
        },
        "isDeleted": false
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCount": 1,
      "limit": 10
    }
  }
}
```

### GET `/records/:id`
Fetches a single financial record by its highly specific ID.

- **Auth Required:** `admin`, `analyst`, `viewer`
- **Path Parameter:** `id` (Valid MongoDB ObjectId)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Record retrieved successfully.",
  "data": {
    "record": {
      "_id": "660c2345c4f2461b2d99e120",
      "amount": 4500.5,
      "type": "income",
      "category": "Consulting",
      "date": "2024-05-15T00:00:00.000Z",
      "note": "Payment for software architecture consulting",
      "createdBy": {
        "_id": "660c1234b3e9451a2c88f910",
        "name": "Admin User",
        "email": "admin@finance.com",
        "role": "admin"
      },
      "isDeleted": false
    }
  }
}
```

### PATCH `/records/:id`
Updates fields on an existing financial transaction.

- **Auth Required:** `admin`
- **Path Parameter:** `id` (Valid MongoDB ObjectId)
- **Request Body (Pass only the fields to update):**
```json
{
  "amount": 5000,
  "note": "Payment adjusted"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Record updated successfully.",
  "data": {
    "record": {
      "_id": "660c2345c4f2461b2d99e120",
      "amount": 5000,
      "type": "income",
      "category": "Consulting",
      "date": "2024-05-15T00:00:00.000Z",
      "note": "Payment adjusted",
      "createdBy": "660c1234b3e9451a2c88f910",
      "isDeleted": false
    }
  }
}
```

### DELETE `/records/:id`
Soft-deletes a record from the database. It will no longer appear in standard queries or analytics.

- **Auth Required:** `admin`
- **Path Parameter:** `id` (Valid MongoDB ObjectId)
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Record securely soft-deleted.",
  "data": null
}
```

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
      { "_id": "Salary", "total": 120000 },
      { "_id": "Consulting", "total": 5000 }
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
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Recent transactions retrieved successfully.",
  "data": [
    {
      "_id": "660c2345c4f2461b2d99e120",
      "amount": 5000,
      "type": "income",
      "category": "Consulting",
      "date": "2024-05-15T00:00:00.000Z",
      "note": "Payment adjusted",
      "createdBy": {
        "_id": "660c1234b3e9451a2c88f910",
        "name": "Admin User",
        "email": "admin@finance.com",
        "role": "admin"
      },
      "isDeleted": false
    }
  ]
}
```

---

## Common Error Codes

The API uses standardized HTTP status codes to communicate execution failure context securely. Below is an example of a standardized error response payload.

**Error Response Example:**
```json
{
  "success": false,
  "message": "\"password\" length must be at least 6 characters long",
  "data": null
}
```

### Status Code Matrix
- **400 Bad Request:** Missing fields, invalid formatting, or generic Joi validation errors.
- **401 Unauthorized:** Missing or expired JWT Auth Token.
- **403 Forbidden:** The authenticated user does not have the required role to access this route, or their account has been marked `inactive`.
- **404 Not Found:** The targeted resource does not exist (or was soft-deleted).
- **409 Conflict:** Resource duplication (e.g., trying to register an email that already exists).
- **429 Too Many Requests:** The client has hit the rate limit threshold.
- **500 Internal Server Error:** An unexpected exception occurred.
