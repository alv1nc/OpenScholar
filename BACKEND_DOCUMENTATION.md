# OpenScholar Backend Documentation

This document explicitly breaks down the OpenScholar Node.js/Express backend, providing an in-depth surgical view of the files written throughout its development. It is curated so that future maintainers can immediately grasp the technical architecture, locate underlying bugs, and extend functionality seamlessly.

## Architecture Paradigm

The backend successfully executes a **Strict 4-Layer Architecture**:
1. **Routes (Doorways)**: Match URL Strings -> Verify JWT Middlewares -> Pass to Controllers.
2. **Controllers (Bouncers)**: Read `req.body` & `req.params`, parse JSON/FormData mismatches, trigger Services, and return pure JSON to Axios.
3. **Services (Logic)**: Run the algorithms, hash passwords, aggregate maps, loop through arrays, and interact completely with Prisma.
4. **Prisma (DAL)**: Execute the raw PostgreSQL execution pipelines securely typed via TypeScript.

---

## 1. Database Layer (`backend/prisma/`)

### `schema.prisma`
- **Purpose**: Defines PostgreSQL Tables mapped inherently into TypeScript interfaces.
- **Key Details**: 
  - Standardized strictly using `camelCase` (e.g. `paperId` instead of `paper_id`) to inherently bypass the mapping layer required by Javascript convention, mirroring the frontend Axios payloads exactly.
  - Generates types utilized extensively throughout the `Services` component via relation mappings (e.g. `Paper` connects functionally to `User` uploads).

---

## 2. Infrastructure Layer (`backend/src/`)

### `config/env.ts`
- **Purpose**: Strict validation engine protecting the app from booting incorrectly.
- **Key Details**: Employs structural mapping, ensuring `JWT_SECRET` and `DATABASE_URL` cannot silently fail inside controllers and crash during production.

### `lib/prisma.ts`
- **Purpose**: Database Singleton Connector using native PostgreSQL adapters.
- **Key Details**: Built specifically for `Prisma 7.6.0+`. It utilizes `@prisma/adapter-pg` coupled securely with native `pg` Pools, completely stripping out deprecated config files inside the schema for highly modular PostgreSQL execution loops.

### `app.ts` & `index.ts`
- **Purpose**: Server bootstrapping sequence.
- **Key Details**: 
  - `express.json()` and `express.urlencoded` orchestrate pure string payload interception.
  - `cookie-parser` strips credentials manually inside `AuthRoutes`.
  - The router mappings literally combine all routes cleanly into `/api/v1` namespace.
  - Hooks the `errorHandler` middleware strictly at the end.

---

## 3. Middleware Layer (`backend/src/middlewares/`)

### `authMiddleware.ts`
- **Purpose**: Blocks and verifies incoming users via headers.
- **Key Details**: Exposes `authenticateJWT` which physically cracks the `Authorization: Bearer <token>` string, extracting the payload and injecting `req.user` deeply into the Express pipeline. Exposes `requireRole(['faculty'])` which protects administrative endpoints safely.

### `errorHandler.ts`
- **Purpose**: Global failure safety net.
- **Key Details**: Any endpoint exception (`next(error)`) flows straight here gracefully. It parses the custom `statusCode` and emits a JSON payload. 
- *Crucial Update:* It exports both `"message"` AND `"error"` identical properties. The frontend naturally expects `error.response.data.error` during axios failure, forcing the synchronization! 

---

## 4. Controllers Layer (`backend/src/controllers/`)

### `AuthController.ts`
- Parses `fullName`, hashing it explicitly into the Prisma mapping `name`. 
- Handles the explicit issuance of HTTP-only cookies (`res.cookie('refreshToken')`). The cookie prevents harmful javascript XSS attacks locally in the browser!

### `PapersController.ts`
- **Upload (`create`)**: Uses `multipart/form-data`. Because HTML5 Forms cannot pass arrays cleanly, `authors` and `keywords` hit this layer as explicitly encoded `comma separated strings`. The controller safely splits `req.body` variables via `.split(',')` mapping them explicitly into PostgreSQL array syntax!
- **Download (`getPdf`)**: Leverages zero-JSON raw streaming architecture. Uses `fs.existsSync` verifying the local `/uploads` payload, stripping the explicit filename safely out of Prisma, enforcing `Content-Type: application/pdf`, and running native `fs.createReadStream().pipe(res)` for frictionless native blob parsing down to browsers.

### `ConversationsController.ts` & `UsersController.ts`
- Performs standard explicit 1-to-1 data mappings extracting explicit UUID parameters safely enforced mechanically (e.g. `req.params.id as string` cast solving Typescript union Array errors).

---

## 5. Services Layer (`backend/src/services/`)

### `AuthService.ts`
- Orchestrates `bcrypt` utilizing a salt-round of `10`. Mechanically intercepts login payloads, checking existing strings manually against the database logic.
- Implements symmetrical JWT signatures mechanically generating both short-lived access (`15m`) and long-lived refresh (`7d`) sequences securely via JSONWebToken modules.

### `PapersService.ts`
- **Nested Recursive Comments Algorithm**: 
  - Standard SQL does not return nested tree arrays naturally. 
  - The `getById` sequence fetches completely flattened comment tables. It initiates a rapid `Map` index. Finding comments with explicit `parentCommentId` markers, it physically loops back pushing the target comment directly inside a mapped `.replies` list memory block, restructuring 1D arrays into 2D recursive matrices exclusively mapping exactly to `frontend/API_CONTRACT.md` rules.
- Integrates `addCitation` mathematically incrementing explicit citation metrics organically.

### `ConversationsService.ts`
- Mechanically checks the composite Unique indexes. If User1 opens a chat with User2, it runs an auto-combinator array (`[User1, User2].sort()`) checking specifically mapped index strings safely preventing conversation duplication loops natively built into SQL checks!

---

## 6. Routes Layer (`backend/src/routes/`)

### `papersRoutes.ts` (Multer Integration)
- Implements `multer.diskStorage()` natively on the routes layer dynamically before the Controller reaches the payload. 
- Structurally constructs unique randomized suffixes avoiding overwrite collisions safely natively piping the raw PDF bin-blocks dynamically directly into a `/uploads` folder.
