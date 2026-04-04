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

This repository currently houses the `frontend/` application. A dedicated backend will be constructed separately using Node.js/Express + PostgreSQL.

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + custom dark themes
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Network Interface:** Axios

*Note: As the backend is under development, the frontend securely mocks RESTful JSON responses using Next.js API Routes (`/api/v1/...`) mimicking the standard PostgreSQL architecture.*

## Getting Started

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The root navigates automatically to the protected `/dashboard` layout.