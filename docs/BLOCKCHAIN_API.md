# Blockchain Module – Expected API (Contract)

This document defines the **expected interface** for the blockchain storage module so integration can be done in parallel. Member 1 implements this; integration uses it.

---

## Service Location

- **Path:** `backend/services/blockchain/`
- **Used by:** Backend document upload/list/fetch flows (controllers, document service).

---

## Expected Functions / Behaviour

| Function / behaviour | Purpose | Notes |
|----------------------|--------|--------|
| **uploadDocument(fileBuffer, metadata?)** | Store document off-chain/on-chain; return a unique **hash** (or CID). | Hash is stored in MongoDB by the main backend. |
| **getByHash(hash)** | Retrieve document content (or URL) by hash. | Return buffer or stream or signed URL as agreed. |

Exact signatures (e.g. `uploadDocument(buffer, { patientId, type })`) can be agreed in this doc or in code comments in `backend/services/blockchain/`.

---

## Data Stored in MongoDB (by integration layer)

- Hash returned from blockchain service.
- Metadata: patient/user reference, document type, upload time, etc. (see `shared/schemas` for consistent shape).

---

## Notes

- Environment variables (RPC, keys, storage endpoints) should be documented in `.env.example` and kept in `backend/config` or this doc.
- Any blockchain-specific models can live under `backend/models/blockchain/` if needed; core document metadata remains in the main Document model keyed by hash.
