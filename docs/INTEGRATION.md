# MediVault – Integration Guide

This document describes how the **blockchain** and **chatbot** modules plug into the main MERN stack so the team can integrate and extend features without conflicts.

---

## Overview

- **Blockchain (Member 1):** Stores medical documents on-chain (or IPFS/storage); returns a hash. The backend stores this hash and metadata in MongoDB.
- **Chatbot (Member 2):** Gemini-based summarizer and chatbot for doctors to query patient reports.
- **MERN + Integration:** Backend API, frontend, and wiring of blockchain + chatbot into routes and UI.

---

## Document Flow (Blockchain + MongoDB)

1. **Upload:** Client → Backend `documents` API → `services/blockchain` (upload file, get hash) → Save hash + metadata in MongoDB via `models` (e.g. Document).
2. **List / Get metadata:** Backend reads from MongoDB only.
3. **Get file content (if needed):** Backend loads hash from MongoDB → `services/blockchain` (get by hash) → return file or URL to client.

Controllers in `backend/controllers/documents` (or similar) should call `backend/services/blockchain` and persist results via shared models. See `docs/BLOCKCHAIN_API.md` for the expected service interface.

---

## Chatbot Flow

1. **Summarize / Chat:** Client (e.g. doctor dashboard) → Backend chatbot route → `backend/services/chatbot` (Gemini) → response back to client.
2. Backend may pass patient/report context (e.g. document IDs or hashes) so the chatbot can reference the right data. See `docs/CHATBOT_API.md` for the expected interface.

---

## Shared Contracts

- **Schemas:** Use `shared/schemas` for document and user shapes so blockchain, chatbot, and API all agree on payloads.
- **Constants:** Use `shared/constants` for roles, statuses, and API path constants across backend and frontend.

---

## Adding New Features

Add new domains as new folders under `backend/services/` and corresponding routes under `backend/routes/` and `app/api/` (if using Next.js API routes). Frontend features live under `frontend/src/components/` and `app/dashboard/<role>/` as needed.
