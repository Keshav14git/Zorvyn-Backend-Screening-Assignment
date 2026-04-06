# Finance Dashboard Backend — Implementation Plan

## Overview

Build a production-grade backend for a Finance Dashboard application that demonstrates clean architecture, strong business logic, robust access control, and efficient MongoDB aggregation pipelines. The system will be deployed-ready with JWT authentication, role-based access, soft-delete, pagination, and comprehensive validation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (v18+) |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Validation | Joi |
| Environment | dotenv |
| Security | helmet, cors, express-rate-limit |
| Logging | morgan |
| Dev | nodemon |

---

## Project Structure

```
d:\Zorvyn Screening Test\
├── src/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   │   └── env.js                 # Environment config
│   ├── controllers/
│   │   ├── auth.controller.js     # Login/register handlers
│   │   ├── user.controller.js     # User CRUD handlers
│   │   ├── record.controller.js   # Financial record handlers
│   │   └── dashboard.controller.js# Dashboard/analytics handlers
│   ├── services/
│   │   ├── auth.service.js        # Auth business logic
│   │   ├── user.service.js        # User business logic
│   │   ├── record.service.js      # Record business logic
│   │   └── dashboard.service.js   # Aggregation pipelines
│   ├── models/
│   │   ├── user.model.js          # User schema
│   │   └── record.model.js        # Financial record schema
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── record.routes.js
│   │   └── dashboard.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT verification
│   │   ├── role.middleware.js      # Role-based access control
│   │   ├── validate.middleware.js  # Joi validation runner
│   │   └── error.middleware.js     # Global error handler
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── user.validator.js
│   │   ├── record.validator.js
│   │   └── common.validator.js     # ObjectId, pagination schemas
│   ├── utils/
│   │   ├── ApiError.js            # Custom error class
│   │   ├── ApiResponse.js         # Standard response builder
│   │   ├── constants.js           # Enums, roles, config constants
│   │   └── logger.js              # Request logging setup
│   └── app.js                     # Express app setup
├── server.js                      # Entry point
├── .env.example                   # Environment template
├── .gitignore
├── package.json
└── README.md
```

---

## User Review Required

> [!IMPORTANT]
> **Optional Enhancements Selection** — The spec says "choose 2 max." I propose implementing:
> 1. **JWT Authentication** — Essential for a realistic auth flow; makes the system actually usable.
> 2. **Request logging middleware** — Adds observability using `morgan` with custom formatting.
>
> Rate limiting will also be included via `express-rate-limit` as it's trivial to add alongside helmet/cors.

> [!IMPORTANT]
> **Seed Data** — I will include a `seed.js` script that creates a default Admin user and sample financial records so the system is immediately testable after setup.

> [!NOTE]
> **Auth Approach** — Since JWT is selected as an enhancement, `POST /auth/login` and `POST /auth/register` (admin-only registration) endpoints will be added. The `checkAuth` middleware will verify JWT tokens from the `Authorization: Bearer <token>` header.

---

## Proposed Changes — Phase Breakdown

---

### Phase 1: Foundation & Configuration

Set up the project scaffold, dependencies, environment config, and Express app skeleton.

#### [NEW] package.json
- All production & dev dependencies
- Scripts: `start`, `dev`, `seed`

#### [NEW] .env.example
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance-dashboard
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

#### [NEW] .gitignore
- `node_modules/`, `.env`, `logs/`

#### [NEW] src/config/env.js
- Centralized env config using `dotenv`
- Validates required variables exist at startup

#### [NEW] src/config/db.js
- Mongoose connection with error handling and reconnection logic

#### [NEW] src/utils/constants.js
- `ROLES` enum: `{ ADMIN: 'admin', ANALYST: 'analyst', VIEWER: 'viewer' }`
- `USER_STATUS` enum: `{ ACTIVE: 'active', INACTIVE: 'inactive' }`
- `RECORD_TYPES` enum: `{ INCOME: 'income', EXPENSE: 'expense' }`

#### [NEW] src/utils/ApiError.js
- Custom error class extending `Error`
- Fields: `statusCode`, `message`, `isOperational`

#### [NEW] src/utils/ApiResponse.js
- Standard response helper: `{ success, message, data }`

#### [NEW] src/utils/logger.js
- Morgan request logging configuration

#### [NEW] src/app.js
- Express app with middleware pipeline:
  1. `helmet()` → security headers
  2. `cors()` → CORS
  3. `express.json()` → body parsing
  4. `morgan` → request logging
  5. `express-rate-limit` → rate limiting
  6. Routes mounting
  7. 404 handler
  8. Global error handler

#### [NEW] server.js
- Connect to DB, then start Express server

---

### Phase 2: Data Models & Database Layer

Define Mongoose schemas with proper validation, indexes, and virtuals.

#### [NEW] src/models/user.model.js

**Schema fields:**
| Field | Type | Rules |
|---|---|---|
| name | String | required, trimmed |
| email | String | required, unique, lowercase, validated format |
| password | String | required, min 6, select: false |
| role | String | enum [admin, analyst, viewer], default: viewer |
| status | String | enum [active, inactive], default: active |
| timestamps | auto | createdAt, updatedAt |

**Hooks:**
- `pre('save')` → hash password with bcryptjs
- Instance method `comparePassword(candidatePassword)`

#### [NEW] src/models/record.model.js

**Schema fields:**
| Field | Type | Rules |
|---|---|---|
| amount | Number | required, min: 0.01 |
| type | String | enum [income, expense], required |
| category | String | required, trimmed, indexed |
| date | Date | required, indexed |
| note | String | optional, trimmed |
| createdBy | ObjectId | ref: User, required |
| isDeleted | Boolean | default: false |
| timestamps | auto | createdAt, updatedAt |

**Indexes:**
- `{ date: 1 }`
- `{ category: 1 }`
- `{ type: 1 }`
- `{ isDeleted: 1, date: -1 }` (compound for common query pattern)

---

### Phase 3: Authentication & RBAC Middleware

#### [NEW] src/middleware/auth.middleware.js — `checkAuth`
1. Extract token from `Authorization: Bearer <token>`
2. Verify with `jwt.verify()`
3. Look up user by decoded ID, ensure `status === 'active'`
4. Attach `req.user` to request
5. Return `401` if token missing/invalid, `403` if user inactive

#### [NEW] src/middleware/role.middleware.js — `checkRole([...roles])`
- Factory function returning middleware
- Checks `req.user.role` against allowed roles
- Returns `403 Forbidden` if unauthorized

#### [NEW] src/middleware/validate.middleware.js
- Generic middleware factory that takes a Joi schema
- Validates `req.body`, `req.query`, or `req.params`
- Returns `400` with structured validation errors

#### [NEW] src/middleware/error.middleware.js
- Global error handler
- Handles: `ApiError`, Mongoose `ValidationError`, Mongoose `CastError` (invalid ObjectId), duplicate key errors, JWT errors
- Returns consistent `{ success, message, data }` format
- Stack trace only in development

#### [NEW] src/validators/*.js
- **auth.validator.js**: login schema (email, password), register schema
- **user.validator.js**: create user, update user, ID param
- **record.validator.js**: create record, update record, query filters
- **common.validator.js**: ObjectId param, pagination query

---

### Phase 4: User Management & Auth APIs

#### [NEW] src/services/auth.service.js
- `register(userData)` → create user, return JWT
- `login(email, password)` → validate credentials, return JWT
- `generateToken(userId)` → sign JWT with expiry

#### [NEW] src/services/user.service.js
- `createUser(data)` → validate uniqueness, create
- `getAllUsers(query)` → paginated list
- `getUserById(id)` → find by ID
- `updateUser(id, data)` → validate role transitions, update

**Business rules enforced in service:**
- Cannot set role to invalid value
- Cannot create duplicate email
- Status transitions validated

#### [NEW] src/controllers/auth.controller.js
- `POST /auth/register` → admin only → `authService.register()`
- `POST /auth/login` → public → `authService.login()`

#### [NEW] src/controllers/user.controller.js
- Thin handlers delegating to `userService`

#### [NEW] src/routes/auth.routes.js
```
POST /auth/register  → checkAuth, checkRole(['admin']), validate, register
POST /auth/login     → validate, login
```

#### [NEW] src/routes/user.routes.js
```
POST   /users      → checkAuth, checkRole(['admin']), validate, createUser
GET    /users      → checkAuth, checkRole(['admin']), listUsers
PATCH  /users/:id  → checkAuth, checkRole(['admin']), validate, updateUser
```

---

### Phase 5: Financial Records & Dashboard Analytics

#### [NEW] src/services/record.service.js
- `createRecord(data, userId)` → create with `createdBy`
- `getRecords(filters)` → filter by type, category, date range, pagination; exclude `isDeleted: true`
- `getRecordById(id)` → find non-deleted by ID
- `updateRecord(id, data)` → update non-deleted record
- `softDeleteRecord(id)` → set `isDeleted: true`

#### [NEW] src/controllers/record.controller.js
- Thin handlers for all record CRUD

#### [NEW] src/routes/record.routes.js
```
POST   /records      → checkAuth, checkRole(['admin']), validate, create
GET    /records      → checkAuth, checkRole(['admin','analyst','viewer']), list
GET    /records/:id  → checkAuth, checkRole(['admin','analyst','viewer']), getById
PATCH  /records/:id  → checkAuth, checkRole(['admin']), validate, update
DELETE /records/:id  → checkAuth, checkRole(['admin']), softDelete
```

#### [NEW] src/services/dashboard.service.js — **MongoDB Aggregation Pipelines**

**`getSummary()`**
```js
// Single aggregation pipeline
Record.aggregate([
  { $match: { isDeleted: false } },
  { $group: {
    _id: null,
    totalIncome:  { $sum: { $cond: [{ $eq: ['$type', 'income'] },  '$amount', 0] } },
    totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } }
  }},
  { $addFields: { netBalance: { $subtract: ['$totalIncome', '$totalExpense'] } } },
  { $project: { _id: 0 } }
]);
```

**`getCategoryBreakdown()`**
```js
Record.aggregate([
  { $match: { isDeleted: false } },
  { $group: {
    _id: { category: '$category', type: '$type' },
    total: { $sum: '$amount' },
    count: { $sum: 1 }
  }},
  { $group: {
    _id: '$_id.category',
    breakdown: { $push: { type: '$_id.type', total: '$total', count: '$count' } },
    categoryTotal: { $sum: '$total' }
  }},
  { $sort: { categoryTotal: -1 } },
  { $project: { _id: 0, category: '$_id', categoryTotal: 1, breakdown: 1 } }
]);
```

**`getTrends()`**
```js
Record.aggregate([
  { $match: { isDeleted: false } },
  { $group: {
    _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
    total: { $sum: '$amount' }
  }},
  { $group: {
    _id: { year: '$_id.year', month: '$_id.month' },
    income:  { $sum: { $cond: [{ $eq: ['$_id.type', 'income'] },  '$total', 0] } },
    expense: { $sum: { $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0] } }
  }},
  { $sort: { '_id.year': 1, '_id.month': 1 } },
  { $project: { _id: 0, year: '$_id.year', month: '$_id.month', income: 1, expense: 1, net: { $subtract: ['$income', '$expense'] } } }
]);
```

**`getRecentTransactions()`**
```js
Record.find({ isDeleted: false })
  .sort({ date: -1 })
  .limit(5)
  .populate('createdBy', 'name email');
```

#### [NEW] src/controllers/dashboard.controller.js
- `getSummary`, `getCategoryBreakdown`, `getTrends`, `getRecent`

#### [NEW] src/routes/dashboard.routes.js
```
GET /dashboard/summary            → checkAuth, checkRole(['admin','analyst'])
GET /dashboard/category-breakdown → checkAuth, checkRole(['admin','analyst'])
GET /dashboard/trends             → checkAuth, checkRole(['admin','analyst'])
GET /dashboard/recent             → checkAuth, checkRole(['admin','analyst'])
```

---

### Phase 6: Seed Data, Testing & Documentation

#### [NEW] seed.js
- Creates default Admin: `admin@finance.com / admin123`
- Creates sample Analyst and Viewer users
- Inserts 20+ sample financial records across multiple categories and months

#### [NEW] README.md
Professional documentation including:
- Project overview & architecture diagram (Mermaid)
- Tech stack table
- Folder structure with explanations
- Setup instructions (step-by-step)
- Complete API endpoint reference table
- Role permissions matrix
- Sample cURL requests/responses
- Design decisions (Why MongoDB, Why service layer, Trade-offs)
- Environment variables reference

---

## Role Permissions Matrix

| Endpoint | Admin | Analyst | Viewer |
|---|:---:|:---:|:---:|
| `POST /auth/register` |  |  |  |
| `POST /auth/login` |  |  |  |
| `POST /users` |  |  |  |
| `GET /users` |  |  |  |
| `PATCH /users/:id` |  |  |  |
| `POST /records` |  |  |  |
| `GET /records` |  |  |  |
| `GET /records/:id` |  |  |  |
| `PATCH /records/:id` |  |  |  |
| `DELETE /records/:id` |  |  |  |
| `GET /dashboard/*` |  |  |  |

---

## Open Questions

> [!IMPORTANT]
> **1. MongoDB Connection** — Do you have MongoDB installed locally, or should I configure it for MongoDB Atlas (cloud)? The `.env` will default to `localhost:27017`.

> [!NOTE]
> **2. Initial Admin Password** — The seed script will create an admin with `admin123`. This is for development only. Want a different default?

> [!NOTE]
> **3. Port** — Defaulting to `5000`. Any preference?

---

## Verification Plan

### Automated Tests
1. Run `npm run dev` and confirm server starts without errors
2. Run `npm run seed` and verify seed data is created
3. Test all endpoints via cURL commands documented in README

### Manual Verification
- Login as each role (admin, analyst, viewer) and verify correct access
- Attempt unauthorized actions and confirm `403` responses
- Test pagination, filtering, and date range queries
- Verify soft delete excludes records from all queries and aggregations
- Confirm aggregation pipeline results match expected calculations
- Test with inactive user to confirm global block
