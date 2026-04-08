# MediVault – Hospital Management System

MediVault is a hospital management web app with role-based dashboards and a medical-document workflow (IPFS/Pinata + MongoDB metadata). This repo also contains separate, work-in-progress modules for a blockchain service and an AI summarizer/chatbot service.

## Tech stack (as of today)

- **Main web app**
  - **Frontend**: React + Vite (`frontend/`)
  - **Backend**: Node.js + Express + Mongoose (`backend/`)
  - **Database**: MongoDB (Atlas or local)
  - **File storage**: IPFS via Pinata (backend route)
- **Separate modules (WIP / run independently)**
  - **Blockchain module**: FastAPI + Motor (`blockchain part/backend/`) + React (`blockchain part/frontend/`)
  - **AI Summarizer/Chatbot**: FastAPI services (`ChatBot_Summarizer_part/`)

> Note: There are legacy/experimental folders like `app/` and `.next/` in the repo, but the **current runnable scripts** are the Node (`backend/`) + Vite (`frontend/`) setup defined in the root `package.json`.

---

## Current features (main app)

- **Frontend**
  - Landing page (`/`)
  - Login + Signup pages (`/login`, `/signup`)
  - Role dashboards and layouts
    - Doctor dashboard routes under `/dashboard/doctor/*` (patients, upload, files, chatbot placeholder)
    - Patient dashboard routes under `/dashboard/patient/*` (files, doctor, access)
    - Generic role route `/dashboard/:role` (uses `localStorage` for a temporary user session)
- **Backend**
  - Health endpoint: `GET /api/health` (shows DB connection status)
  - Auth routes mounted at `POST /api/auth/signup` and `POST /api/auth/login`
  - IPFS upload route mounted at `POST /api/ipfs/upload` (multipart form field: `file`)
  - Additional API routes mounted (patients/doctors/users/reports) under:
    - `/api/patients`
    - `/api/doctors`
    - `/api/users`
    - `/api/*` (reports)

---

## Repo structure (high level)

```
medi-vault-web-app/
├── backend/                         # Node.js + Express API (main app)
├── frontend/                        # React + Vite SPA (main app)
├── docs/                            # Contracts / integration notes
├── shared/                          # Shared constants/schemas (cross-module)
├── blockchain part/                 # Separate blockchain-focused module (WIP)
│   ├── backend/                     # FastAPI service (Motor/MongoDB)
│   └── frontend/                    # React app (CRA)
├── ChatBot_Summarizer_part/         # Separate AI summarizer/chatbot services (WIP)
└── package.json                     # Root scripts (install:all, dev, etc.)
```

---

## Quickstart (main web app)

### Prerequisites

- Node.js 18+ recommended
- MongoDB (local or Atlas)

### Install

```bash
npm run install:all
```

### Run (2 terminals)

Backend (Express, default `http://localhost:5000`):

```bash
npm run backend
```

Frontend (Vite, default `http://localhost:5173`):

```bash
npm run frontend
```

Or run both together:

```bash
npm run dev
```

---

## Environment variables

### `backend/.env` (Express API)

Create `backend/.env` (do **not** commit it). Common keys used by the backend:

| Key | Purpose | Example |
|---|---|---|
| `PORT` | Express port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/medivault` |
| `FRONTEND_URL` | CORS allow origin | `http://localhost:5173` |
| `PINATA_API_KEY` | Pinata API key (for IPFS uploads) | `your_pinata_key` |
| `PINATA_SECRET_KEY` | Pinata secret | `your_pinata_secret` |
| `IPFS_GATEWAY` | Gateway used to build URLs | `https://gateway.pinata.cloud/ipfs/` |

### `frontend/.env` (Vite)

Create `frontend/.env`:

| Key | Purpose | Example |
|---|---|---|
| `VITE_CONTRACT_ADDRESS` | Smart contract address used by UI | `0x...` |
| `VITE_CHAIN_ID` | Chain ID | `1337` |
| `VITE_IPFS_GATEWAY` | IPFS gateway for viewing files | `https://gateway.pinata.cloud/ipfs/` |

---

## Running the separate modules (optional / WIP)

### Blockchain module

- **Backend**: `blockchain part/backend/` (FastAPI)
  - Uses `.env` keys like `MONGODB_URL`, `DATABASE_NAME`, `GANACHE_URL`, `CONTRACT_ADDRESS`
- **Frontend**: `blockchain part/frontend/` (React CRA)
  - Uses `.env` keys like `REACT_APP_API_URL`, `REACT_APP_CONTRACT_ADDRESS`

### AI Summarizer / Chatbot module

Located under `ChatBot_Summarizer_part/` and contains FastAPI apps (entrypoints include):

- `ChatBot_Summarizer_part/backend/app/main.py`
- `ChatBot_Summarizer_part/chatbot_backend/app/main.py`

It expects environment keys like:

- `ALLOWED_ORIGINS` (CORS, comma-separated)
- Gemini / Groq API keys (kept in `ChatBot_Summarizer_part/.env`, **do not commit**)

---

## Docs

- `docs/INTEGRATION.md`: how modules are expected to plug together
- `docs/BLOCKCHAIN_API.md`: expected blockchain service contract
- `docs/CHATBOT_API.md`: expected chatbot/summarizer contract
- `docs/ROLES_AND_ACCESS.md`: role definitions & where to enforce access

---

## Security note (important)

If any real credentials/API keys were ever committed into any `.env` files, treat them as **compromised**:

- rotate/revoke the keys (Pinata, Gemini, Groq, database password)
- replace committed secrets with placeholder examples (or add `.env.example` files)
- ensure `.env` stays ignored via `.gitignore`
