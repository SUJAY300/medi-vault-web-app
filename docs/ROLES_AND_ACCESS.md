# Roles and Access

High-level roles in MediVault and where they are reflected in the codebase.

---

## Roles

| Role | Description | Dashboard / entry |
|------|-------------|-------------------|
| **Admin** | System administration, manage doctors/nurses/patients, uploads, files. | `app/dashboard/admin/` |
| **Doctor** | View/query patient reports, use chatbot/summarizer, upload documents. | `app/dashboard/doctor/` |
| **Nurse** | Assigned patient care, files, chatbot as per product rules. | `app/dashboard/nurse/` |
| **Patient** | Own records, view documents (as allowed), settings. | `app/dashboard/patient/` |
| **Student** (intern) | Cases and chatbot for learning; access scoped to allowed data. | `app/dashboard/student/` |

---

## Where to Enforce

- **Backend:** Middleware and route handlers should check role (e.g. from session/JWT) before calling blockchain or chatbot services and before returning sensitive data.
- **Frontend:** Route guards and dashboard layout should redirect or hide sections based on role.
- **Login / auth:** Planned for a later phase; once implemented, attach role to the session and use it in the above.

---

## Updating This Doc

When adding a new role or changing permissions, update this file and any constants in `shared/constants` (e.g. role enums).
