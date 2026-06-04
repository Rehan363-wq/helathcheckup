# HealFlow AI — Application Improvement Backlog (`improvement.md`)

This document lists the resolved bugs, user experience improvements, security enhancements, and refactoring efforts implemented to bring HealFlow AI to production and enterprise-grade readiness.

---

## 🔍 Resolved Shortcomings & Bugs (Phases 1 - 7)

### 1. Critical Runtime & Compile Fixes (Phase 1 & 2)
* **dashboard/page.tsx**: Resolved the `useMemo` reference error by hoisting its import to the top of the page imports.
* **onboarding/page.tsx**: Fixed a compilation type error where block-scoped variables `sessionStr` and `userId` were referenced before declaration inside the doctor directory synchronization logic.
* **types/doctor.ts**: Extended the `Doctor` interface with an optional `is_approved` flag to resolve TypeScript check failures on dynamic local storage merges.
* **timezone date offset**: Resolved calendar slot booking mismatch by formatting appointment date IDs using local timezone conversions (`YYYY-MM-DD`).
* **reminders/page.tsx**: Consolidated duplicate `triggerAlertNotification` functions into a single hook to fix reminder alarms.

### 2. Branding Standardisation (Phase 5.1)
* Standardized all naming throughout the application, prompts, logs, and database setup scripts to **HealFlow AI** (replacing references to "Vitalis" and "MediScan").
* Updated navbar brand elements, emergency alert simulations, help prompts, doctor directories, and chatbot labels.

### 3. Hinglish UI Chrome Translation & Skeletons (Phase 5.2 & 5.3)
* Professionalized all UI chrome components by translating Hinglish button labels, descriptors, placeholders, and error boundaries into clean, premium English:
  - Translated alarm prompt buttons (`"Done, Khali Maine!"` → `"Done, I took it!"`) and labels.
  - Translated skin analyzer guidelines and disclaimer text.
  - Translated report parser warnings.
  - Translated onboarding headers, descriptions, custom chip forms, and placeholders.
  - Translated not found and runtime error boundary fallbacks.
* Added a global Next.js transition loading component (`app/loading.tsx`) to show a dual-spin CSS loading indicator when navigating between routes.

### 4. Security Hardening (Phase 6)
* **admin/page.tsx**: Replaced hard-coded `"admin123"` verify password comparisons with `process.env.NEXT_PUBLIC_ADMIN_SECRET` check and removed the plaintext passkey hint from placeholders.
* **API security**: Secured all endpoints (`/api/chat/bot`, `/api/chat/doctor`, `/api/doctor/assistant`, `/api/tracker/coach`, `/api/analyze/skin`, `/api/analyze/report`) with a centralized bearer token authorization check helper (`lib/api-auth.ts`). Updated frontend `fetch` headers to include active session email keys.

### 5. Local Storage Backup Recovery & SEO (Phase 7)
* **profile/page.tsx**: Added a full Backup & Recovery configuration panel. Users can export their local health parameters, logs, and reminders as a JSON file and upload it later to restore all state.
* **Dynamic browser page titles**: Added dynamic browser tab title updates using mount `useEffect` calls in all app routes to establish proper SEO indexing names.
* **Dark mode tables**: Replaced hardcoded white background values on report explainers with alpha variables to prevent bright flashes in dark mode.

---

## 🛠️ Verification & Compile Status
- **Turbopack Build**: Successful compile (`npm run build` completed with `0` errors/warnings).
- **TypeScript Check**: Passed cleanly.
