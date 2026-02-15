# MediVault – Hospital Management System

A hospital management web application with role-based dashboards (Admin, Doctor, Nurse, Patient, Intern/Student), blockchain-backed medical document storage, and a Gemini-powered summarizer and chatbot for querying patient reports.

---

## Project structure

The repository is organized so that **blockchain**, **chatbot**, and **MERN integration** can be developed in parallel with clear ownership and integration points.

```
medi-vault-web-app/
├── app/                          # Next.js App Router (pages & API routes)
│   ├── api/                      # API route handlers
│   │   ├── auth/                 # Auth endpoints (login, signup, OTP – planned)
│   │   └── documents/            # Document CRUD; integrates with blockchain service
│   ├── auth/                     # Auth pages (login, signup – planned)
│   └── dashboard/                # Role-based dashboards
│       ├── admin/                # Admin: doctors, nurses, patients, files, upload, chatbot
│       ├── doctor/               # Doctor: patients, files, upload, chatbot
│       ├── nurse/                # Nurse: patients, files, chatbot
│       ├── patient/              # Patient: settings, own records
│       └── student/              # Intern/student: cases, chatbot
│
├── backend/                      # Node/Express (or equivalent) API & business logic
│   ├── config/                   # DB, env, app config
│   ├── controllers/              # HTTP handlers; delegate to services
│   │   ├── blockchain/           # [Blockchain owner] Controllers for blockchain APIs
│   │   └── chatbot/              # [Chatbot owner] Controllers for summarizer/chat
│   ├── middlewares/              # Auth, validation, error handling
│   ├── models/                   # MongoDB models (shared)
│   │   ├── blockchain/           # Blockchain-specific models if any
│   │   └── chatbot/              # Chatbot-specific models if any
│   ├── routes/                   # Route definitions
│   ├── services/                 # Business logic – integration boundary
│   │   ├── blockchain/           # [Blockchain owner] Document storage, hash resolution
│   │   └── chatbot/              # [Chatbot owner] Gemini summarizer & chatbot
│   └── utils/                    # Helpers
│       ├── blockchain/
│       └── chatbot/
│
├── components/                   # Shared UI components (root-level)
│   └── ui/                       # Design system / primitives
│
├── frontend/                     # Frontend app (React/Next or separate SPA)
│   ├── public/                   # Static assets
│   └── src/
│       ├── api/                  # API client / fetch wrappers
│       ├── components/           # Feature-specific components
│       │   ├── auth/
│       │   ├── blockchain/
│       │   ├── chatbot/
│       │   ├── dashboard/
│       │   ├── documents/
│       │   ├── layout/
│       │   └── ui/
│       ├── context/              # React context (e.g. auth, theme)
│       ├── hooks/
│       ├── pages/                # Page components if not using app/
│       └── utils/
│
├── shared/                       # Contract layer (schemas, constants)
│   ├── constants/                # Roles, statuses, API paths
│   └── schemas/                  # Document/user shapes for validation & consistency
│
├── docs/                         # Integration and module contracts
│   ├── INTEGRATION.md            # How blockchain & chatbot plug into the app
│   ├── BLOCKCHAIN_API.md         # Expected blockchain service interface
│   ├── CHATBOT_API.md            # Expected chatbot/summarizer interface
│   └── ROLES_AND_ACCESS.md       # Role definitions and access rules
│
├── scripts/                      # Seed, migrations, one-off utilities
├── prisma/                       # Prisma schema and seed (if used)
├── public/                       # Root static assets (if used by app/)
├── .env.example                  # Example environment variables
└── README.md                     # This file
```

---

## Module ownership

| Area | Owner | Location |
|------|--------|----------|
| **Blockchain storage** | Member 1 | `backend/services/blockchain/`, `backend/controllers/blockchain/`, `backend/models/blockchain/`, `backend/utils/blockchain/` |
| **Summarizer & chatbot (Gemini)** | Member 2 | `backend/services/chatbot/`, `backend/controllers/chatbot/`, `backend/models/chatbot/`, `backend/utils/chatbot/` |
| **MERN backend & frontend, integration** | Integration owner | Rest of `backend/`, `app/`, `frontend/`, `shared/`, wiring of blockchain and chatbot into routes and UI |

---

## Integration at a glance

- **Documents:** Upload → backend calls `services/blockchain` (get hash) → store hash + metadata in MongoDB. List/fetch use MongoDB; file content (when needed) via `services/blockchain` using hash.
- **Chatbot:** Doctor (or other allowed roles) → backend chatbot route → `services/chatbot` (Gemini) with allowed context → response to client.

Details and expected interfaces: see **`docs/INTEGRATION.md`**, **`docs/BLOCKCHAIN_API.md`**, and **`docs/CHATBOT_API.md`**.

---

## Auth and login

- **Login and full auth flow are planned for a later phase** and are not part of the current scope.
- When implemented, use `app/auth/`, `app/api/auth/`, and `shared/schemas` for consistent payloads; enforce roles as in **`docs/ROLES_AND_ACCESS.md`**.

---

## Getting started

1. Clone the repo and install dependencies (root and/or `backend/`, `frontend/` as per your setup).
2. Copy `.env.example` to `.env` and set MongoDB, Gemini, and any blockchain-related variables.
3. Run database migrations/seed if applicable (e.g. `prisma` or `scripts/`).
4. Start backend and frontend (see project-specific scripts in `package.json` or in `backend/` and `frontend/`).

---

## Adding new features

- New backend domains: add under `backend/services/<domain>/` and corresponding routes and controllers.
- New frontend features: add under `frontend/src/components/<feature>/` and/or `app/dashboard/<role>/` as appropriate.
- Keep **`shared/schemas`** and **`shared/constants`** in sync so all modules use the same shapes and role/status values.
