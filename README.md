# OpenScholar

A localized, institute-centric academic research platform where university members can discover, publish, and discuss academic research.

## Features

- **Institutional Authentication:** Secure authentication restricted to university credentials.
- **Academic Directory:** Search for papers natively through the dashboard using titles, authors, and keywords.
- **Repository Publishing:** Readily upload `.pdf` papers connected to specific departments.
- **Interactive Discussion Engine:** Users can ask questions, provide feedback, and start nested conversation threads on specific papers.
- **Direct Messaging:** Peer-to-peer and faculty messaging mapped to unique connections.
-  A premium, professional interface constructed without harsh UI paradigms, specifically tailored for academia.

## Architecture

This repository uses a strict decoupled infrastructure.

### Backend
- **Core:** Node.js + Express (TypeScript)
- **Database:** PostgreSQL managed via Prisma ORM
- **Object Storage:** Pure native local filesystem (`/uploads`) for PDF streaming
- **Security:** Dual JWT (Access Tokens) + HTTP-Only browser cookies (Refresh Tokens)

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + custom dark themes
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Network Interface:** Axios

*Note: The frontend leverages `.env.local` to securely point to the local backend using `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`.*

## Getting Started

To run this application natively on a fresh device, you must boot both the Backend API and the Frontend Client.

### 1. Database Setup
To securely boot the platform, you must establish a PostgreSQL database. 

1. **Host your database:** You can either download and run PostgreSQL locally (e.g., using pgAdmin or the `psql` CLI) or spin up a cloud-hosted instance (e.g., via AWS RDS, Supabase, or Railway).
2. **Create the target database:** Inside your server, create a blank database specifically named `openscholar` (or any custom name).
3. **Capture your Connection String:** You will need to construct your connection URI mapping your username, password, port, and specific database name. The standard format looks exactly like this:
   `postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public`

### 2. Booting the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install NodeJS dependencies:
   ```bash
   npm install
   ```
3. Initialize the Prisma configuration:
   Create a root `.env` file inside the `/backend` folder. Insert the connection string you built in Step 1:
   ```env
   DATABASE_URL="postgresql://{your postgre username}:{your postgre password}@localhost:5432/{database name}?schema=public"
   ```
4. Push the schema to generate SQL tables:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
5. Compile TypeScript and Start the Server:
   ```bash
   npx tsc
   node dist/index.js
   ```
*The backend will boot up tightly on `http://localhost:5000/api/v1`.*

### 3. Booting the Frontend
1. Open a new discrete terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Ensure you create a `.env.local` file pointing to your new backend:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```
3. Install frontend dependencies:
   ```bash
   npm install
   ```
4. Start the Next.js process:
   ```bash
   npm run dev
   ```

Navigate to **[http://localhost:3000](http://localhost:3000)** and register your first account!

---

## Administrator Setup & Governance

OpenScholar ships with a built-in admin system that gives a designated administrator full control over the platform — users, papers, and roles. This section covers everything from claiming the first admin seat to day-to-day platform governance.

> For the full reference document, see [ADMIN_GUIDE.md](./ADMIN_GUIDE.md).

---

### Step 1 — Register a Normal Account

Visit `http://localhost:3000/register` and create an account. Any role (student or faculty) works — you'll upgrade it in the next step.

---

### Step 2 — Claim the Administrator Seat via `/setup`

Navigate to `http://localhost:3000/setup`.

You will see the **OpenScholar Setup Wizard** — a one-time, self-locking page that only works when no admin exists in the database yet.

1. Enter the **email and password** of the account you just registered.
2. Click **"Claim Administrator Seat"**.
3. You'll see a success confirmation screen. Your account is now admin.
4. **Log back in** — the Admin Panel link will appear in your profile dropdown in the top-right navigation.

> **⚠️ The `/setup` page permanently locks itself after the first admin is created.** If you navigate to it after an admin already exists, you'll see a "Setup Already Complete" screen and no changes can be made. All subsequent admins must be promoted via the Admin Panel.

---

### Step 3 — Access the Admin Panel

Once logged in as an admin, click your **profile avatar** (top-right) and select **"Admin Panel"** from the dropdown. You can also navigate directly to `http://localhost:3000/admin`.

Non-admin users are automatically redirected away from this page.

---

### Admin Panel Features

The Admin Panel has two tabs with live search on both:

#### 👥 User Base Tab
| Action | When Available | What It Does |
|---|---|---|
| **Make Faculty** | Student accounts only | Upgrades role label to `faculty` |
| **Grant Admin** | Non-admin accounts | Promotes account to full `admin` |
| **Terminate** | Any account except your own | **Permanent CASCADE DELETE** — wipes all their papers, comments, messages, and conversations |

> You cannot delete your own account from the panel. It shows "Protected User" next to your row.

#### 📚 Global Library Tab
| Action | What It Does |
|---|---|
| **Shred Asset** | **Permanent CASCADE DELETE** — wipes the paper, all its comments, and all citation links |

Both tabs have a **live search bar** that filters instantly by name/email/role (users) or title/author/department (papers). A result count (`3 of 47 users`) is shown at all times.

---

### Creating Additional Admins

Once you are the admin, you can promote any other user directly from the **User Base** tab:
1. Find the user in the table.
2. Click **"Grant Admin"**.
3. They must **log out and log back in** for their session to reflect the new role.

---

### Database Consistency (Cascade Deletes)

All delete operations in OpenScholar are backed by **PostgreSQL `ON DELETE CASCADE`** rules, meaning the database enforces consistency automatically:

| If you delete... | These are also deleted automatically |
|---|---|
| A **User** | All their papers, comments, messages, conversations, and citation links |
| A **Paper** | All its comments and citation records |
| A **Comment** | All nested replies under it |
| A **Conversation** | All messages within it |

These operations are **irreversible**. There is no soft delete or undo.

---

### Security Model

- All `/api/v1/admin/*` routes require both a valid JWT **and** `role: 'admin'` — enforced server-side.
- The frontend client-side redirect is a UX convenience only, **not** a security boundary.
- The `/setup` endpoint checks the database on every call and refuses if any admin already exists.
