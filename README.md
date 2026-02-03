# Resilient User Profile Management API

A robust, containerized Node.js API for managing user profiles, featuring advanced resilience patterns (Circuit Breaker, Retry), Unit of Work architecture, and external data enrichment.

## 🚀 Key Features

- **User Management**: Full CRUD operations for user profiles.
- **Data Persistence**: MySQL database with Sequelize ORM.
- **Architectural Patterns**:
  - **Repository Pattern**: Abstraction layer for data access.
  - **Unit of Work**: Transaction management for atomic operations.
- **Resilience**:
  - **Circuit Breaker** (Opossum): Prevents cascading failures when the external enrichment service is down.
  - **Retry Mechanism** (Axios-Retry): Exponential backoff for transient network errors.
- **Enrichment**: Merges local user data with simulated external data.
- **Validation**: Strict input validation using Joi.
- **Documentation**: Interactive Swagger/OpenAPI UI.

## 🛠️ Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **ORM**: Sequelize
- **Resilience**: Opossum (Circuit Breaker), Axios-Retry
- **Testing**: Jest, Supertest
- **Containerization**: Docker, Docker Compose

## 🏗️ Architecture & Design Decisions

### Repository & Unit of Work
We implemented the **Repository Pattern** to decouple business logic from data access details. The **Unit of Work** pattern ensures transactional integrity; if any part of a complex operation fails, the entire transaction rolls back, ensuring strictly consistent data.

### Resilience Strategy
The `/enriched` endpoint depends on an unreliable external service.
1.  **Retry**: For transient errors (e.g., network blips), we retry the request up to 3 times with exponential backoff (100ms, 200ms, 400ms).
2.  **Circuit Breaker**: If failures persist (threshold reached), the circuit opens to fail fast and protect system resources.
3.  **Fallback**: When the circuit is open or requests fail, the API gracefully degrades by returning the basic user profile with an `unavailable` status for enrichment data.

## ⚙️ Setup & Installation

### Prerequisites
- Docker & Docker Compose

### Running the Application

1.  **Clone the repository**
2.  **Start Services**:
    ```bash
    docker-compose up -d --build
    ```
    This starts:
    - `app` (API Service) on port **8080**
    - `db` (MySQL) on port **3307**
    - `mock_enrichment_service` on port **8081**

3.  **Verify Status**:
    Check if services are healthy:
    ```bash
    docker-compose ps
    ```

## 📖 API Documentation

Once running, access the **Swagger UI** at:
> **http://localhost:8080/api-docs**

### Key Endpoints
- `POST /api/users` - Create User
- `GET /api/users/{id}` - Get User
- `GET /api/users/{id}/enriched` - Get Resilient Enriched Profile
- `PUT /api/users/{id}` - Update User
- `DELETE /api/users/{id}` - Delete User

## 🧪 Testing

To run integration tests (requires Docker services to be running or local DB setup):

```bash
# Install dependencies locally
npm install

# Run tests
npm test
```

## 📂 Project Structure

```
src/
  config/         # Database configuration
  controllers/    # Request handlers (Input validation, Response formatting)
  services/       # Business logic (Enrichment, Service orchestration)
  repositories/   # Data access layer
    interfaces/   # Repository interfaces
    impl/         # Sequelize implementations (Repo + UnitOfWork)
  models/         # Sequelize Models
  external/       # External API Clients (Circuit Breaker/Retry logic)
  middleware/     # Error handling, etc.
  routes/         # API Routes
tests/
  integration/    # Integration tests for API endpoints
```
