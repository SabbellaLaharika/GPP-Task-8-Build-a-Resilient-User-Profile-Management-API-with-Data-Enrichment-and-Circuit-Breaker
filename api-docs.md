# API Documentation

**Base URL**: `http://localhost:8080/api`

## Overview
This API manages user profiles with support for external data enrichment. It implements resilience patterns (Circuit Breaker, Retry) to ensure stability even when external dependencies are unreliable.

## Endpoints

### 1. Create User
**POST** `/users`

Creates a new user profile.

-   **Body**:
    ```json
    {
      "name": "Jane Doe",
      "email": "jane.doe@example.com"
    }
    ```
-   **Response (201 Created)**:
    ```json
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "registrationDate": "2023-10-27T10:00:00.000Z"
    }
    ```
-   **Errors**:
    -   `400 Bad Request`: Invalid email format or missing fields.
    -   `409 Conflict`: Email already exists.

---

### 2. Get User
**GET** `/users/{id}`

Retrieves a user by their UUID.

-   **Response (200 OK)**:
    ```json
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "registrationDate": "2023-10-27T10:00:00.000Z"
    }
    ```
-   **Errors**:
    -   `404 Not Found`: User UUID does not exist.

---

### 3. Update User
**PUT** `/users/{id}`

Updates a user's name or email. Supports **partial updates** (you can send only the fields you want to change).

-   **Body**:
    ```json
    {
      "name": "Jane Smith"
    }
    ```
-   **Response (200 OK)**:
    ```json
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Jane Smith",
      "email": "jane.doe@example.com",
      "registrationDate": "2023-10-27T10:00:00.000Z"
    }
    ```

---

### 4. Delete User
**DELETE** `/users/{id}`

Permanently deletes a user profile.

-   **Response (204 No Content)**: Empty body.

---

### 5. Get Enriched User Profile
**GET** `/users/{id}/enriched`

Retrieves the user profile merged with external data (e.g., recent activity, scores).

-   **Response (200 OK - Full Data)**:
    ```json
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "registrationDate": "2023-10-27T10:00:00.000Z",
      "enrichment": {
        "recentActivity": ["Login", "Purchase"],
        "loyaltyScore": 85,
        "enrichedDataStatus": "available"
      }
    }
    ```

-   **Response (200 OK - Fallback Mode)**:
    *Returned when the external service is down or timed out.*
    ```json
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "registrationDate": "2023-10-27T10:00:00.000Z",
      "enrichment": {
        "enrichedDataStatus": "unavailable"
      }
    }
    ```

## Error Format
All error responses follow this structure:
```json
{
  "errorCode": "INVALID_INPUT",
  "message": "Validation failed",
  "details": ["\"email\" must be a valid email"]
}
```
