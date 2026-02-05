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

### 1. Repository Pattern with Unit of Work
**Why**: To strictly decouple business logic from the persistence mechanism and ensure data integrity.
**Benefits**:
- **Testability**: Allows us to easily mock the database layer when unit testing the Service layer.
- **Maintainability**: Switching databases (e.g., MySQL to PostgreSQL) only requires changes in the Repository implementation, not the logic.
- **Atomicity**: The Unit of Work ensures that operations like "Create User" are either fully completed or fully rolled back (ACID properties), preventing partial data states.

### 2. Resilience Patterns (Enrichment Service)
The system integrates with a "potentially unreliable" external service. We implemented a robust defense strategy:

#### Circuit Breaker (Opossum)
- **Mechanism**: Wraps external calls. If failures exceed a 50% threshold or the service times out repeatedly, the circuit moves to `OPEN` state.
- **Why**: Prevents "Cascade Failures". If the external service hangs, our API shouldn't hang with it. It fails fast, freeing up threads/resources.
- **Benefit**: Ensures the core User API remains responsive even when the Enrichment subsystem is dead.

#### Retry Mechanism (Exponential Backoff)
- **Mechanism**: Uses `axios-retry`. If a request fails (network error or 5xx), it retries 3 times with specific delays: 100ms, 200ms, 400ms.
- **Why**: Distinguishes between "outage" and "blip". A temporary network packet loss shouldn't cause a user error.
- **Trade-off**: Increases latency for the failed request (Total Wait = ~700ms + timeouts), but significantly improves success rates for transient errors.

#### Fallback Strategy
- When the Circuit Breaker is open or retries validly fail, the system returns `{ enrichedDataStatus: 'unavailable' }` instead of a 500 Error. This allows the frontend to show the user their profile, perhaps with a "Enrichment data currently unavailable" warning, rather than a blank screen.

## 📸 Demonstration

*(Please insert screenshots or a link to your video demo here)*

### Scenarios to Demonstrate:
1.  **Happy Path**: Successful creation and retrieval of a user with enrichment data.
2.  **Validation Error**: Trying to create a user with an invalid email.
3.  **Circuit Breaker**:
    - Configure `mock-service` to fail 100% of the time.
    - Hit the API and observe the `unavailable` status.
    - Check logs for "Circuit Breaker OPEN".

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
