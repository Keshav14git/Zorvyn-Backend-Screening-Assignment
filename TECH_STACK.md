# Technology Stack & Tooling

This document provides a comprehensive breakdown of the frameworks, libraries, and external tools utilized to design, build, secure, and test the Finance Dashboard API.

---

## 1. Core Architecture

### Node.js (Runtime)
The application is built on the Node.js V8 JavaScript engine (targeting v18+). It provides a highly scalable, non-blocking, event-driven architecture that perfectly handles concurrent asynchronous I/O operations inherently required by REST APIs.

### Express.js (HTTP Framework)
Used as the foundational web framework. Express provides a minimal and flexible routing architecture, making it simple to map Layered Application paradigms (Controller -> Service) into standard HTTP methods and standardizing request middleware injections.

### MongoDB & Mongoose (Database & ODM)
- **MongoDB:** A NoSQL document database chosen for its structural flexibility and native Aggregation Framework. The JSON-like document constraints are ideal for dynamic financial logs.
- **Mongoose ODM:** Provides an Object Data Modeling abstraction over MongoDB. Mongoose is utilized to enforce strict schema shapes at the application level, generate safe default values, and trigger lifecycle hooks (such as hashing passwords before saving).

---

## 2. Authentication & Data Validation

### JSON Web Tokens (`jsonwebtoken`)
Manages stateless user authentication. The API issues short-lived JWTs to authenticate clients across requests via the `Authorization: Bearer` header, meaning the server does not need to store stateful session identities.

### bcryptjs
A cryptographic library used to securely hash and salt user passwords prior to database storage, effectively defending against rainbow table and hash brute-force attacks.

### Joi (`joi`)
A powerful schema description language and validator for JavaScript objects. Joi is executed within middleware before any request payload hits the Controllers. This definitively guarantees that the database only receives clean, sanitized, and properly formatted data.

---

## 3. Security & Stability

### Helmet (`helmet`)
Secures Express applications by automatically setting various strict HTTP headers, mitigating common vulnerabilities like Cross-Site Scripting (XSS), Clickjacking, and MIME-sniffing.

### CORS (`cors`)
Configures Cross-Origin Resource Sharing. The API is locked down to specific frontend origins to prevent malicious domains from successfully submitting cross-site requests.

### Express Rate Limit (`express-rate-limit`)
Protects against brute-force attacks and DDOS attempts. The entire API enforces a strict mathematical window limit (e.g., 100 requests per 15 minutes per IP), immediately rejecting traffic that exceeds this threshold with a `429 Too Many Requests` code.

---

## 4. Testing & Quality Assurance

To guarantee system stability, the API relies on a hybrid automated testing configuration split between CLI workflows and programmatic assertions.

### Newman
Used for End-To-End (E2E) API Validation. Newman is a command-line collection runner for Postman. The provided `Finance_Dashboard_API_collection.json` relies on Newman to execute long, sequential API processes—testing token propagation across endpoints, Role-Based Access controls (RBAC), positive and negative validation checks, and returning the results efficiently in a CLI run.

### Jest (`jest`)
Serves as the primary programmatic testing framework. Jest offers an isolated, fast testing environment and built-in assertion expectations natively within the JavaScript runtime.

### Supertest (`supertest`)
Paired seamlessly with Jest, Supertest abstracts Express.js routing away from the network layer. It spins up the underlying server completely in-memory to execute lightning-fast mock HTTP hits against the API logic, making unit and integration testing extremely dependable and fast.

---

## 5. Environment & Development Operations

### dotenv (`dotenv`)
Securely loads variables from a local `.env` file into Node's `process.env`. This ensures zero sensitive data (like `JWT_SECRET` and `MONGODB_URI`) is ever hardcoded into the source code tracking mechanism.

### cross-env (`cross-env`)
A minor but essential operational dependency. It standardizes setting environment variables across differing operating systems (Windows, MacOS, Linux) inside `.json` package scripts.

### nodemon (`nodemon`)
A development utility that actively monitors directory changes and automatically restarts the Node.js application. Ensures seamless iterative development cycles without manually restarting the environment for every code test.
