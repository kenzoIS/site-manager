# BayaniHub — Site Manager Dashboard

Internal dashboard for BayaniHub site managers to monitor volunteer deployments, review applications, manage donation inventory, and activate mission sessions.

## Tech Stack

| Layer | Technology |
|---|---|
| Front-End | React (Next.js) · TypeScript |
| Back-End | Node.js (NestJS) · TypeScript |
| Mobile | React Native |
| Database | Supabase (PostgreSQL) · Supabase Storage · Supabase Auth |

## Project Structure

```
/                        # Next.js frontend (React + TypeScript)
├── src/
│   ├── app/             # Pages (App Router)
│   │   ├── page.tsx                          # Dashboard
│   │   ├── donor-applicants/                 # Donor applicant list
│   │   ├── volunteer-applications/           # Application queue + review
│   │   ├── donation-inventory/               # Donation inventory
│   │   ├── activate-mission/                 # Mission activation
│   │   └── volunteer-summary/                # Real-time volunteer summary
│   ├── components/      # Shared UI components
│   └── lib/
│       ├── api.ts        # Typed fetch client for all backend endpoints
│       └── supabase.ts   # Browser-side Supabase client
backend/                 # NestJS API server (Node.js + TypeScript)
├── src/
│   ├── campaigns/
│   ├── donations/
│   ├── missions/
│   ├── supabase/        # Global Supabase service (service-role key)
│   ├── user-profiles/
│   ├── volunteer-applications/
│   └── volunteer-roles/
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with the BayaniHub schema

### Environment Variables

Copy these two files and fill in your credentials:

**`.env.local`** (frontend)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

**`backend/.env`** (NestJS)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PORT=3001
CORS_ORIGIN=http://localhost:3000
FB_PAGE_ACCESS_TOKEN=
JWT_SECRET=
```

### Running Locally

Open two terminals:

**Terminal 1 — Backend (NestJS)**
```bash
cd backend
npm install
npm run start:dev
```
Runs at `http://localhost:3001`

**Terminal 2 — Frontend (Next.js)**
```bash
npm install
npm run dev
```
Runs at `http://localhost:3000`

## Features

- **Donor Applicant List** — Browse and search donor profiles
- **Volunteer Application Queue** — Filter by role/status, review uploaded documents
- **Document Review Workflow** — Approve or reject documents with Facebook Messenger notifications
- **Donation Inventory** — View donations grouped by campaign
- **Activate Mission** — Deploy approved volunteers to an operation
- **Real-time Volunteer Summary** — Live deployment stats and team breakdown
