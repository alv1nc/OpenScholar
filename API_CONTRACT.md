# OpenScholar API Contract

This document outlines the expected RESTful API endpoints, request payloads, and JSON response structures that the frontend currently expects from the Node.js/Express + PostgreSQL backend.

## Base URL
All endpoints are currently prefixed with: `/api/v1`

## Authentication (`/api/v1/auth`)

The frontend relies on a two-token authentication system (JWT Access Token in memory, Refresh Token in an `httpOnly` cookie).

### 1. User Login
- **Endpoint:** `POST /auth/login`
- **Request Body (JSON):**
  ```json
  {
    "email": "user@university.edu",
    "password": "securepassword123"
  }
  ```
- **Success Response (200 OK):**
  The backend must also set the `httpOnly` refresh token cookie here.
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "uuid-1234",
      "name": "Dr. Alan Turing",
      "email": "alan.turing@openscholar.edu",
      "role": "faculty", // or "student"
      "department": "Computer Science"
    }
  }
  ```

### 2. User Registration
- **Endpoint:** `POST /auth/register`
- **Request Body (JSON):**
  ```json
  {
    "fullName": "Grace Hopper",
    "email": "grace@university.edu",
    "password": "securepassword123",
    "role": "faculty",
    "department": "Computer Science"
  }
  ```
- **Success Response (201 Created):**
  Must return the same structure as Login, setting the refresh cookie.
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1...",
    "user": { ... }
  }
  ```

### 3. Token Refresh
Called automatically by the frontend Axios interceptor on a `401` error.
- **Endpoint:** `POST /auth/refresh`
- **Request Headers:** Requires the `httpOnly` refresh cookie.
- **Success Response (200 OK):**
  ```json
  {
    "accessToken": "new_eyJhbGciOiJIUzI1..."
  }
  ```

### 4. Fetch Current Session
Used on initial app load to restore the user session.
- **Endpoint:** `GET /auth/me`
- **Request Headers:** `Authorization: Bearer <accessToken>`
- **Success Response (200 OK):**
  ```json
  {
    "user": {
      "id": "uuid-1234",
      "name": "Dr. Alan Turing",
      "email": "alan.turing@openscholar.edu",
      "role": "faculty",
      "department": "Computer Science"
    }
  }
  ```

### 5. Logout
Clears the session configuration.
- **Endpoint:** `POST /auth/logout`
- **Success Response (200 OK):**
  The backend must inherently clear the `httpOnly` refresh token cookie here.
  ```json
  {
    "success": true
  }
  ```

---

## User Models (`/api/v1/users`)

### 1. View User Profile
- **Endpoint:** `GET /users/:id`
- **Success Response (200 OK):**
  Required for hydrating non-active profile paths.
  ```json
  {
    "user": {
      "id": "target_uuid",
      "name": "Dr. Mock Profile User",
      "email": "mocked@openscholar.edu",
      "role": "faculty",
      "department": "Computer Science"
    }
  }
  ```

---

## Papers Pipeline (`/api/v1/papers`)

### 1. Get Recent Papers (Dashboard)
- **Endpoint:** `GET /papers/recent`
- **Success Response (200 OK):**
  ```json
  {
    "papers": [
      {
        "id": "paper_uuid_1",
        "title": "Quantum Computing Frontiers",
        "abstract": "This paper explores...",
        "authors": ["Alan Turing", "Richard Feynman"],
        "year": 2024,
        "department": "Computer Science",
        "citationCount": 42,
        "doi": "10.1234/qc.2024.1",
        "keywords": ["Quantum", "Cryptography"]
      }
    ]
  }
  ```

### 2. Search Directory
- **Endpoint:** `GET /papers?q=<search_query>`
- **Success Response (200 OK):** Identical array structure to `recent`.

### 3. Get Paper Detail
- **Endpoint:** `GET /papers/:id`
- **Success Response (200 OK):**
  Returns the exact paper properties plus nested discussion threads.
  ```json
  {
    "paper": { ... },
    "comments": [
      {
        "id": "comment_uuid",
        "paperId": "paper_uuid_1",
        "userId": "user_uuid_1",
        "authorName": "John von Neumann",
        "content": "Fascinating approach...",
        "createdAt": "2024-04-04T12:00:00Z",
        "replies": [
          {
            "id": "reply_uuid",
            "userId": "user_uuid_2",
            "authorName": "Alan Turing",
            "content": "Thanks for the feedback.",
            "createdAt": "2024-04-04T12:30:00Z"
          }
        ]
      }
    ]
  }
  ```

### 4. Download PDF
- **Endpoint:** `GET /papers/:id/pdf`
- **Success Response (200 OK):** 
  Backend should stream the underlying `application/pdf` Blob or handle redirects to a cloud bucket (e.g., AWS S3 URL).

### 5. Post Discussion Comment
- **Endpoint:** `POST /papers/:id/comments`
- **Request Body:** `{ "content": "My thoughts...", "parentCommentId": "optional_UUID" }`
- **Success Response (201 Created):**
  Returns structural sync envelope for instantaneous React processing without hard refreshing:
  ```json
  {
    "success": true,
    "comment": {
      "id": "new_comment_uuid",
      "paperId": "paper_uuid_1",
      "userId": "me_uuid",
      "authorName": "Dr. Alan Turing",
      "content": "My thoughts...",
      "createdAt": "2024-04-06T12:00:00Z",
      "replies": []
    }
  }
  ```

### 6. Publish Paper
- **Endpoint:** `POST /papers`
- **Content-Type:** `multipart/form-data`
- **Form Data Fields:** `title`, `abstract`, `authors`, `keywords`, `department`, `year`, `doi`, `file`
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "paper": {
      "id": "new_paper_uuid",
      "title": "Quantum Computing Frontiers",
      "status": "published"
    }
  }
  ```

---

## Messaging (`/api/v1/conversations`)

The frontend uses short-polling (e.g. hitting `GET /messages` every 3 seconds) for the active UI. 

### 1. Get All Active Conversations Side-panel
- **Endpoint:** `GET /conversations`
- **Success Response (200 OK):**
  ```json
  {
    "conversations": [
      {
        "id": "conv_uuid_1",
        "participants": [
          { "id": "me_uuid", "name": "My Name" },
          { "id": "other_uuid", "name": "Other User" }
        ],
        "lastMessage": "Are we meeting tomorrow?",
        "updatedAt": "2024-04-04T10:00:00Z",
        "unreadCount": 1
      }
    ]
  }
  ```

### 2. Get Global Unread Count
- **Endpoint:** `GET /conversations/unread-count`
- **Success Response (200 OK):**
  ```json
  {
    "unreadCount": 3
  }
  ```

### 3. Start / Fetch specific Conversation
Used when clicking "Message" on someone's profile.
- **Endpoint:** `POST /conversations`
- **Request Body:** `{ "userId": "target_user_uuid" }`
- **Success Response (200 OK):** (Returns the existing conversation ID if they already chatted, or creates a new one).
  ```json
  {
    "conversation": {
      "id": "conv_uuid_1",
      "participants": [...]
    }
  }
  ```

### 4. Fetch Conversation Messages (Polling target)
- **Endpoint:** `GET /conversations/:id/messages`
- **Side Effect:** Automatically sets `isRead = true` in PostgreSQL for all retrieved messages targeting the requesting user!
- **Success Response (200 OK):** Sorted chronologically (oldest to newest).
  ```json
  {
    "messages": [
      {
        "id": "msg_uuid_1",
        "senderId": "other_uuid",
        "text": "Are we meeting tomorrow?",
        "createdAt": "2024-04-04T10:00:00Z"
      }
    ]
  }
  ```

### 4. Send Message
- **Endpoint:** `POST /conversations/:id/messages`
- **Request Body (JSON):**
  ```json
  {
    "text": "Yes, I will be there."
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "message": {
      "id": "msg_uuid_2",
      "senderId": "me_uuid",
      "text": "Yes, I will be there.",
      "createdAt": "2024-04-04T10:05:00Z"
    }
  }
  ```
