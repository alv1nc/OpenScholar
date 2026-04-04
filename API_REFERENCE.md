# OpenScholar Backend - Final API Reference

This document serves as the authoritative source of truth for the implemented backend endpoints, defining expected HTTP requests, security requirements, and the precise JSON payload responses. It perfectly aligns with the implemented `Node/Express` application so the frontend can develop synchronously without mismatches.

## Base Path
All endpoints map to: `http://localhost:5000/api/v1`

---

## 1. Authentication (`/api/v1/auth`)

The backend coordinates authentication using a JSON Web Token (JWT). The **access token** is short-lived and returned directly in the response payload. The **refresh token** is long-lived and securely placed inside an HTTP-only browser Cookie automatically handled by credentials.

### `POST /auth/register`
Creates a brand-new user and logs them in concurrently.
**Payload:**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@university.edu",
  "password": "securepassword",
  "role": "faculty",
  "department": "Computer Science"
}
```
**Response (201 Created):**
```json
{
  "accessToken": "eyJhbGciOi...",
  "user": {
    "id": "uuid-1234",
    "name": "Jane Doe",
    "email": "jane@university.edu",
    "role": "faculty",
    "department": "Computer Science"
  }
}
```

### `POST /auth/login`
Validates credentials and injects access and refresh tokens.
**Payload:**
```json
{
  "email": "jane@university.edu",
  "password": "securepassword"
}
```
**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOi...",
  "user": {
    "id": "uuid-1234",
    "name": "Jane Doe",
    "email": "jane@university.edu",
    "role": "faculty",
    "department": "Computer Science"
  }
}
```

### `POST /auth/refresh`
Cycles the auth session. The browser must pass cookies automatically (`withCredentials: true` in Axios).
**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOi..."
}
```

### `GET /auth/me`
Fetches session hydration data based on the HTTP-only cookie.
**Headers:** `Authorization: Bearer <accessToken>`
**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid-1234",
    "name": "Jane Doe",
    "email": "jane@university.edu",
    "role": "faculty",
    "department": "Computer Science"
  }
}
```

### `POST /auth/logout`
Destroys the session by clearing cookies automatically.
**Response (200 OK):**
```json
{ "success": true }
```

---

## 2. Directory & Users (`/api/v1/users`)

### `GET /users/:id`
Fetch a specific user profile to render a public profile UI natively.
**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid-1234",
    "name": "Jane Doe",
    "email": "jane@university.edu",
    "role": "faculty",
    "department": "Computer Science"
  }
}
```

---

## 3. Papers (`/api/v1/papers`)

### `GET /papers/recent` (Dashboard Index)
Fetches a lightweight list of the latest 20 papers.
**Response (200 OK):**
```json
{
  "papers": [
    {
      "id": "paper_uuid_1",
      "uploadedBy": "user_uuid",
      "title": "Quantum AI",
      "abstract": "Exploring Neural...",
      "authors": ["Jane Doe", "Alan Turing"],
      "keywords": ["Quantum", "AI"],
      "year": 2026,
      "department": "Computer Science",
      "pdfUrl": "https://bucket/url.pdf",
      "citationCount": 5,
      "doi": "10.1234/567"
    }
  ]
}
```

### `GET /papers?q=ai` (Search)
Fetches dynamic results using Prisma's text/GIN indexing over keywords and title.
**Response (200 OK):** *Identical structural array to Recent.*

### `GET /papers/:id` (Detail View)
Returns full paper details cleanly aggregated alongside fully nested discussion threads.
**Response (200 OK):**
```json
{
  "paper": {
    "id": "paper_uuid_1",
    "title": "Quantum AI",
     // ... other paper metrics
  },
  "comments": [
    {
      "id": "comment_uuid_1",
      "paperId": "paper_uuid_1",
      "userId": "user_uuid_1",
      "authorName": "Alan Turing",
      "content": "Excellent research structure.",
      "createdAt": "2026-04-04T12:00:00Z",
      "replies": [
         {
           "id": "comment_uuid_2",
           "paperId": "paper_uuid_1",
           "userId": "user_uuid_2",
           "authorName": "Jane Doe",
           "content": "Thank you!",
           "createdAt": "2026-04-04T12:30:00Z",
           "replies": []
         }
      ]
    }
  ]
}
```

### `GET /papers/:id/pdf`
Redirect proxy resolving to the raw binary file URL bucket.
**Response (200 OK):**
```json
{ "url": "https://bucket/url.pdf" }
```

### `POST /papers` (Publish Endpoint)
**Headers:** `Authorization: Bearer <accessToken>`
**Content-Type:** `multipart/form-data`
*Note:* Provide `authors` and `keywords` as comma-separated Strings (e.g. `"Jane Doe, John Smith"`). The backend parses them automatically into arrays natively. Let `file` be the actual PDF blob. Let `year` be a standard Integer string parsing target.
**Response (201 Created):**
```json
{
  "success": true,
  "paper": { "id": "uuid", "title": "...", "authors": [...] }
}
```

### `POST /papers/:id/citations`
Tracks cross-references between papers.
**Headers:** `Authorization: Bearer <accessToken>`
**Role Requirement:** `faculty` or `admin`
**Body:** `{ "citingPaperId": "uuid" }`
**Response (200 OK):**
```json
{
  "success": true,
  "citationCount": 6
}
```

---

## 4. Conversations (`/api/v1/conversations`)

*All conversation endpoints require `Authorization: Bearer <accessToken>`.*

### `GET /conversations`
Used to feed the main messaging side-panel. Features native polling integrations.
**Response (200 OK):**
```json
{
  "conversations": [
    {
      "id": "conv_uuid",
      "participants": [
        { "id": "my_uuid", "name": "Me" },
        { "id": "their_uuid", "name": "Them" }
      ],
      "lastMessage": "Are we meeting later?",
      "updatedAt": "2026-04-04T12:00:00Z",
      "unreadCount": 0
    }
  ]
}
```

### `POST /conversations`
Fired when initiating a brand new chat. Prevents duplication by checking composite keys.
**Payload:** `{ "userId": "target_user_uuid" }`
**Response (200 OK):**
```json
{
  "conversation": {
    "id": "conv_uuid",
    "participants": [...]
  }
}
```

### `GET /conversations/:id/messages`
Active short-polling endpoint used while a chat is opened.
**Response (200 OK):**
```json
{
  "messages": [
    {
      "id": "msg_uuid_1",
      "senderId": "their_uuid",
      "text": "Are we meeting later?",
      "createdAt": "2026-04-04T12:00:00Z"
    }
  ]
}
```

### `POST /conversations/:id/messages`
**Payload:** `{ "text": "Yes we are." }`
**Response (201 Created):**
```json
{
  "message": {
    "id": "msg_uuid_2",
    "senderId": "my_uuid",
    "text": "Yes we are.",
    "createdAt": "2026-04-04T12:05:00Z"
  }
}
```
