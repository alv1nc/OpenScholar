# OpenScholar - Backend Blueprint & System Design

## 1. Architecture Strategy
- **Tech Stack**: Node.js, Express, PostgreSQL
- **Database Access**: `Prisma` (ORM chosen to deeply integrate with frontend camelCase model types based on your instructions).
- **Design Pattern**: Strict 4-layer architecture.
    1. **Routes**: Handle HTTP request mappings and middleware assignment.
    2. **Middleware**: Authentication (JWT), role verification (`requireRole`), and file parsing (`multer`).
    3. **Controllers**: Request validation, extracting params/body, formatting responses identical to the API contract.
    4. **Services**: Core business logic and orchestration.
    5. **DAL (Data Access Layer)**: Direct database interactions securely via Prisma Client.

## 2. API Contract Resolution
*Note: The global backend `{ success, data, message }` envelope requirement has been explicitly relaxed.* 
The controllers will return data exactly as expected by the frontend in `API_CONTRACT.md`.
For example: 
- Login will directly return `{ "accessToken": "...", "user": {...} }`.
- Logout will perform the cleanup and return `{ "success": true }`.

## 3. Database Schema (Matched to Frontend Contract)
To align with the frontend API expectations and avoid overhead, the backend implementation of our entities will apply a strict camelCase naming pattern to automatically map accurately:

### Users Model
- `id`: UUID (Primary Key)
- `email`: VARCHAR (Unique)
- `passwordHash`: VARCHAR
- `name`: VARCHAR (Matches frontend `name` rather than `full_name`)
- `role`: ENUM ('student', 'faculty', 'admin')
- `department`: VARCHAR
- `isVerified`: BOOLEAN (Default: false)

### Papers Model
- `id`: UUID (Primary Key)
- `uploadedBy`: UUID (Foreign Key -> Users.id)
- `title`: VARCHAR
- `abstract`: TEXT
- `authors`: TEXT[]
- `keywords`: TEXT[] (with GIN index)
- `year`: INTEGER (Matches frontend `year`)
- `department`: VARCHAR
- `pdfUrl`: VARCHAR
- `citationCount`: INTEGER (Default: 0 - Matches frontend `citationCount`)
- `doi`: VARCHAR (Matches frontend `doi`)

### Citations Model
- `citingPaperId`: UUID (Foreign Key -> Papers.id)
- `citedPaperId`: UUID (Foreign Key -> Papers.id)
- *Constraints: Composite Unique Constraint on (citingPaperId, citedPaperId).*

### Comments Model
- `id`: UUID (Primary Key)
- `paperId`: UUID (Foreign Key -> Papers.id)
- `userId`: UUID (Foreign Key -> Users.id)
- `parentCommentId`: UUID (Foreign Key -> Comments.id, nullable for top-level)
- `content`: TEXT (Matches frontend `content`)
- `isDeleted`: BOOLEAN (Default: false)
- `createdAt`: TIMESTAMP (Matches frontend `createdAt`)

### Conversations Model
- `id`: UUID (Primary Key)
- `participantA`: UUID (Foreign Key -> Users.id)
- `participantB`: UUID (Foreign Key -> Users.id)
- `updatedAt`: TIMESTAMP (Matches frontend `updatedAt`)
- *Constraints: Unique constraint on (participantA, participantB), Check constraint (A != B).*

### Messages Model
- `id`: UUID (Primary Key)
- `conversationId`: UUID (Foreign Key -> Conversations.id)
- `senderId`: UUID (Foreign Key -> Users.id)
- `recipientId`: UUID (Foreign Key -> Users.id) 
- `text`: TEXT (Matches frontend `text` rather than `body`)
- `isRead`: BOOLEAN (Default: false)
- `createdAt`: TIMESTAMP (Matches frontend `createdAt` rather than `sent_at`)

## 4. Security & Auth Middleware Layer
- **Password Hashing:** `bcrypt` (cost 12).
- **JWT Token System:**
  - `accessToken`: Short-lived (e.g., 15m), returned in JSON response payload.
  - `refreshToken`: Long-lived (e.g., 7d), appended via cookie (`httpOnly: true`, `Secure: true`, `SameSite: 'Strict'`).
- **Middlewares:**
  - `authenticateJWT`: Extracts Bearer token, verifies signature, injects `req.user`.
  - `requireRole(role)`: Asserts `req.user.role === role`.
  - `fileUpload`: Express middleware mapping to `multipart/form-data` returning mocked cloud URLs.

## 5. Endpoints Routing Plan
| Method | Route | Controller Method | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | AuthController.register | Create user, issue tokens |
| POST | `/api/v1/auth/login` | AuthController.login | Validate creds, issue tokens |
| POST | `/api/v1/auth/refresh` | AuthController.refresh | Cycle refresh tokens |
| GET | `/api/v1/auth/me` | AuthController.me | Session restoration |
| POST | `/api/v1/auth/logout` | AuthController.logout | Invalidate session / clear cookies |
| GET | `/api/v1/users/search/query` | UsersController.search | Locate users via substring match |
| GET | `/api/v1/users/:id` | UsersController.getProfile | View user profile data |
| PATCH | `/api/v1/users/:id` | UsersController.updateProfile | Edit core profile metrics natively |
| GET | `/api/v1/papers` | PapersController.getAll | Search directory via `?q=` |
| GET | `/api/v1/papers/recent`| PapersController.getRecent| Last 20 papers |
| GET | `/api/v1/papers/:id` | PapersController.getById | Include comments/threads |
| GET | `/api/v1/papers/:id/pdf` | PapersController.getPdf | Streams the PDF blobb |
| POST | `/api/v1/papers` | PapersController.create | Handle multi-part upload |
| POST | `/api/v1/papers/:id/citations`| PapersController.addCitation| Atomically increment `citationCount` |
| GET | `/api/v1/conversations` | ConversationsController.getAll | Side-panel recent chats |
| POST | `/api/v1/conversations` | ConversationsController.startChat| Find existing or create chat |
| GET | `/api/v1/conversations/:id/messages`| MessagesController.list| Poll conversation history|
| POST | `/api/v1/conversations/:id/messages`| MessagesController.send| Add message to thread |

## 6. Frontend Integration Notes & Edge Cases
When engineering the controllers mapped above, the frontend uniquely expects specific structural mappings that the raw Postgres/Prisma models do not intrinsically match. The backend developers must implement these transformations:

### Payload Mismatches (Input parsing)
- **User Registration Form (`fullName` vs `name`)**: The backend `Users Model` rightly uses the field `name`. However, the frontend API Contract explicitly POSTs the field as `fullName`. The `AuthController.register` method will need to aggressively map `req.body.fullName` onto `name` before saving to Prisma.
- **Publish Paper Form Data Types**: The frontend `<form>` submits `multipart/form-data`. Because HTML forms cannot natively append structured arrays, the frontend appends `authors` and `keywords` as raw comma-separated strings (e.g., `"Jane Doe, John Smith"`). The `Papers Model` expects PostgreSQL `TEXT[]` arrays. The `PapersController.create` must strictly split these strings (`.split(',')`) before committing them to the database.

### Nested Data Formatting (Response mapping)
- **Comments & Replies (`parentCommentId` vs `replies`)**: The `Comments Model` uses a standard self-referential schema with `parentCommentId`. This is structurally correct for PostgreSQL, but the frontend natively expects a nested tree structure (`comments: [{ ..., replies: [...] }]`). Furthermore, the frontend requires the `authorName` natively inside each comment payload, so the underlying `PapersController.getById` must perform SQL Joins/Prisma nested includes linking `Users.name` to `Comments.userId`, and recursively map `parentCommentId` children into `replies`.
- **Conversations Model Aggregations**: The frontend inherently expects a rich envelope from `GET /conversations` including `participants: [{ id, name }]`, along with `lastMessage` string and `unreadCount` integer mapping directly locally. The `Conversations` Database Model realistically tracks `participantA`, `participantB`, and `updatedAt`. The backend controller will have to dynamically perform complex JOINS against the `Users` and `Messages` tables to shape this response payload to effectively match the expected `API_CONTRACT.md`.
