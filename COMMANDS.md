# Command Reference Guide

This document serves as the operational runbook for the Finance Dashboard API. It outlines every terminal command required to initialize the environment, boot the server, populate the database, and execute both unit and end-to-end testing cycles.

All commands below assume you are currently located in the root directory of the project.

---

## 1. Initial Setup

Before starting the server, you must install the runtime dependencies and configure your global environment parameters.

**Install Dependencies:**
```bash
npm install
```

**Configure Environment Variables:**
Copy the template environment file to activate the configuration logic.
```bash
cp .env.example .env
```
*(After running this, open the `.env` file and verify your `MONGODB_URI` and `JWT_SECRET` are correctly configured).*

---

## 2. Database Initialization

The project includes an integrated seeding script that will automatically generate robust test data to simulate an active production environment.

**Seed the Database:**
```bash
npm run seed
```
**Warning:** Running this command will completely drop the existing `users` and `records` collections in your currently connected MongoDB database. It simulates a fresh state and populates exactly 3 Users (Admin, Analyst, Viewer) and 25 diverse Financial Records.

---

## 3. Server Operations

Two primary startup modes are supported depending on whether you are actively designing architecture or running a deployed instance.

**Start Development Server (Live Reloading):**
```bash
npm run dev
```
Utilizes `nodemon` to watch the `src/` directory. Any saved file modification will automatically reboot the server logic without requiring manual restarts.

**Start Production Server:**
```bash
npm start
```
Runs the API via the standard Node.js runtime, ensuring maximum performance stability.

---

## 4. Testing & Validation

The application requires two layers of validation to ensure functional integrity.

### Run Unit & Integration Tests (Jest + Supertest)
This automated programmatic test suite boots up an in-memory instance of the Express server to rapidly assert HTTP endpoint functionality natively.
```bash
npm run test
```

### Run End-to-End API Workflows (Newman + Collection)
To thoroughly evaluate the Role-Based Access Control and authentication routing securely across the architecture, use Newman to execute the JSON collection automatically via the terminal.

This command will run all simulated E2E HTTP requests sequentially and export the test pass rates to a local JSON file:
```bash
npx newman run Finance_Dashboard_API_collection.json -r cli,json --reporter-json-export Final_Test_Results.json
```
