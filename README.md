# OpenScholar

A localized, institute-centric academic research platform where university members can discover, publish, and discuss academic research.

## Features

- **Institutional Authentication:** Secure authentication restricted to university credentials.
- **Academic Directory:** Search for papers natively through the dashboard using titles, authors, and keywords.
- **Repository Publishing:** Readily upload `.pdf` papers connected to specific departments.
- **Interactive Discussion Engine:** Users can ask questions, provide feedback, and start nested conversation threads on specific papers.
- **Direct Messaging:** Peer-to-peer and faculty messaging mapped to unique connections.
- **Dark Mode Aesthetics:** A premium, professional interface constructed without harsh UI paradigms, specifically tailored for academia.

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
Ensure you have a live **PostgreSQL** instance actively running locally.

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
   Create a `.env` file containing your Postgres connection string:
   `DATABASE_URL="postgresql://user:password@localhost:5432/openscholar?schema=public"`
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