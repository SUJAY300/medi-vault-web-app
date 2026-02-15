# Chatbot Module – Expected API (Contract)

This document defines the **expected interface** for the Gemini-based summarizer and chatbot so integration can be done in parallel. Member 2 implements this; integration uses it.

---

## Service Location

- **Path:** `backend/services/chatbot/`
- **Used by:** Backend chatbot/summarizer routes; doctor (and other role) dashboards.

---

## Expected Behaviour

| Function / endpoint | Purpose | Notes |
|--------------------|--------|--------|
| **Summarize report(s)** | Given document hash(es) or text, return a short summary. | Used to show doctors a quick overview of patient reports. |
| **Chat / query** | User message + optional context (e.g. patient ID, report hashes) → model response. | Used for “query patient reports” UX; context should be scoped by permissions. |

Exact function names (e.g. `summarizeReport(content)`, `chat(message, context)`) and request/response shapes can be agreed here or in code in `backend/services/chatbot/`.

---

## Integration Points

- **Routes:** e.g. `POST /api/chatbot/summarize`, `POST /api/chatbot/chat` (or under `app/api/` if using Next.js API routes).
- **Auth:** Only allowed roles (e.g. doctor, admin) should call these; enforce in middleware before calling the chatbot service.
- **Context:** Backend should resolve which documents/reports the user is allowed to reference and pass only those to the chatbot service.

---

## Environment

- Gemini API key and any model config should be in `.env` and loaded via `backend/config`; do not commit secrets.
