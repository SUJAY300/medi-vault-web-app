# MediVault – Hospital Management System

A hospital management web application with role-based dashboards (Admin, Doctor, Nurse, Patient, Intern/Student), blockchain-backed medical document storage, and a Gemini-powered summarizer and chatbot for querying patient reports.

**Stack:** React (frontend), Node.js + Express (backend), MongoDB (database) — **MERN only** (no Next.js, no TypeScript).

---

## Current features

- **Landing page** at `/` with **Login** and **Sign up** buttons.
- **Login page** (`/login`) and **Sign up** page (`/signup`) with form UI. Backend auth and database integration will be implemented next.

---

## Project structure

The repository is organized so that **blockchain**, **chatbot**, and **MERN integration** can be developed in parallel with clear ownership and integration points.

```
medi-vault-web-app/
├── backend/                      # Node.js + Express API
│   ├── config/                   # DB, env, app config
│   ├── controllers/              # HTTP handlers; delegate to services
│   │   ├── blockchain/           # [Blockchain owner] Controllers for blockchain APIs
│   │   └── chatbot/              # [Chatbot owner] Controllers for summarizer/chat
│   ├── middlewares/              # Auth, validation, error handling
│   ├── models/                   # MongoDB models (shared)
│   ├── routes/                   # Route definitions (auth, documents, etc.)
│   ├── services/                 # Business logic – integration boundary
│   │   ├── blockchain/           # [Blockchain owner] Document storage, hash resolution
│   │   └── chatbot/              # [Chatbot owner] Gemini summarizer & chatbot
│   ├── utils/
│   └── server.js                 # Express app entry
│
├── frontend/                     # React SPA (Vite)
│   ├── public/                   # Static assets, favicon
│   └── src/
│       ├── pages/                # Landing, Login, Signup (and future dashboard pages)
│       ├── components/           # Reusable and feature-specific components
│       ├── api/                  # API client / fetch wrappers
│       ├── context/              # React context (e.g. auth)
│       ├── hooks/
│       ├── App.jsx               # Routes: /, /login, /signup
│       ├── main.jsx
│       └── index.css
│
├── shared/                       # Contract layer (schemas, constants)
│   ├── constants/                # Roles, statuses, API paths
│   └── schemas/                  # Document/user shapes for validation
│
├── docs/                         # Integration and module contracts
│   ├── INTEGRATION.md            # How blockchain & chatbot plug into the app
│   ├── BLOCKCHAIN_API.md         # Expected blockchain service interface
│   ├── CHATBOT_API.md            # Expected chatbot/summarizer interface
│   └── ROLES_AND_ACCESS.md       # Role definitions and access rules
│
├── scripts/                      # Seed, migrations, one-off utilities
├── prisma/                       # Prisma schema and seed (if used)
├── package.json                  # Root scripts: install:all, backend, frontend, dev
└── README.md                     # This file
```

---

## Module ownership

| Area | Owner | Location |
|------|--------|----------|
| **Blockchain storage** | Member 1 | `backend/services/blockchain/`, `backend/controllers/blockchain/`, `backend/models/blockchain/`, `backend/utils/blockchain/` |
| **Summarizer & chatbot (Gemini)** | Member 2 | `backend/services/chatbot/`, `backend/controllers/chatbot/`, `backend/models/chatbot/`, `backend/utils/chatbot/` |
| **MERN backend & frontend, integration** | Integration owner | Rest of `backend/`, `frontend/`, `shared/`, wiring of blockchain and chatbot into routes and UI |

---

## Integration at a glance

- **Documents:** Upload → backend calls `services/blockchain` (get hash) → store hash + metadata in MongoDB. List/fetch use MongoDB; file content (when needed) via `services/blockchain` using hash.
- **Chatbot:** Doctor (or other allowed roles) → backend chatbot route → `services/chatbot` (Gemini) with allowed context → response to client.

Details and expected interfaces: see **`docs/INTEGRATION.md`**, **`docs/BLOCKCHAIN_API.md`**, and **`docs/CHATBOT_API.md`**.

---

## Auth and login

- **Landing, Login, and Signup pages** are implemented (UI only). Backend auth endpoints and MongoDB integration will be added next.
- When implementing auth, use `backend/routes/` and `backend/controllers/` for login/signup; keep payloads aligned with **`shared/schemas`** and enforce roles as in **`docs/ROLES_AND_ACCESS.md`**.

---

## Getting started

1. **Install dependencies**
   ```bash
   npm run install:all
   ```
   Or manually: `npm install` (root), then `cd backend && npm install`, then `cd frontend && npm install`.

2. **Start backend** (Node.js + Express on port 5000)
   ```bash
   npm run backend
   ```

3. **Start frontend** (React + Vite on port 5173)
   ```bash
   npm run frontend
   ```

4. Open **http://localhost:5173** for the landing page; use **Login** and **Sign up** to open the auth forms.

5. (Optional) Copy `.env.example` to `backend/.env` and set `MONGODB_URI`, `FRONTEND_URL`, etc., when you add database and auth.

---

## Adding new features

- New backend domains: add under `backend/services/<domain>/` and corresponding routes and controllers.
- New frontend features: add under `frontend/src/components/<feature>/` and new routes in `frontend/src/App.jsx` (e.g. dashboard by role).
- Keep **`shared/schemas`** and **`shared/constants`** in sync so all modules use the same shapes and role/status values.
