# CliniHome AI — Application Improvement Backlog (`improvement.md`)

This document lists the resolved bugs, user experience improvements, security enhancements, and refactoring efforts implemented to bring CliniHome AI to production and enterprise-grade readiness.

---

## 🔍 Resolved Shortcomings & Bugs (Phases 1 - 8)

### 1. Critical Runtime & Compile Fixes (Phase 1 & 2)
* **dashboard/page.tsx**: Fixed missing closing div tags for the main content grid and outer page containers that were causing Turbopack build failure.
* **types/doctor.ts**: Extended the `Doctor` interface with an optional `is_approved` flag to resolve TypeScript check failures on dynamic local storage merges.
* **timezone date offset**: Resolved calendar slot booking mismatch by formatting appointment date IDs using local timezone conversions (`YYYY-MM-DD`).
* **reminders/page.tsx**: Consolidated duplicate `triggerAlertNotification` functions into a single hook to fix reminder alarms.

### 2. Branding Standardisation (Phase 5)
* Standardized all naming throughout the application, prompts, logs, and database setup scripts to **CliniHome AI** (replacing references to "Vitalis" and "MediScan").
* Updated navbar brand elements, emergency alert simulations, help prompts, doctor directories, and chatbot labels.

### 3. Hinglish UI Chrome Translation & Skeletons (Phase 5)
* Professionalized all UI chrome components by translating Hinglish button labels, descriptors, placeholders, and error boundaries into clean, premium English.
* Added a global Next.js transition loading component (`app/loading.tsx`) to show a dual-spin CSS loading indicator when navigating between routes.

### 4. Security Hardening (Phase 6)
* **admin/page.tsx**: Replaced hard-coded `"admin123"` verify password comparisons with `process.env.NEXT_PUBLIC_ADMIN_SECRET` check and removed the plaintext passkey hint from placeholders.
* **API security**: Secured all endpoints (`/api/chat/bot`, `/api/chat/doctor`, `/api/doctor/assistant`, `/api/tracker/coach`, `/api/analyze/skin`, `/api/analyze/report`) with a centralized bearer token authorization check helper (`lib/api-auth.ts`). Updated frontend `fetch` headers to include active session email keys.

### 5. Local Storage Backup Recovery & SEO (Phase 7)
* **profile/page.tsx**: Added a full Backup & Recovery configuration panel. Users can export their local health parameters, logs, and reminders as a JSON file and upload it later to restore all state.
* **Dynamic browser page titles**: Added dynamic browser tab title updates using mount `useEffect` calls in all app routes to establish proper SEO indexing names.

### 6. Emergency Button Removal & Hinglish Chrome Elimination (Phase 8)
* **navbar.tsx**: Completely removed the "Emergency Call (112)" button from the header container and removed the `PhoneCall` icon dependency.
* **doctor-dashboard/page.tsx**: Corrected mobile responsive grid styling constraint by enforcing `display: flex !important` in mobile flex queries on `.chat-container-layout`. Translated patient empty selection state and mock data list queries from Hinglish to clean English. Standardized inline hex colors to theme-aware CSS variables. Added responsive focus styles to forms.

### 7. UX/UI Polish & Mobile Responsiveness
* **Aria-labels**: Added missing `aria-label` tags to interactive buttons, inputs, select fields, and action buttons in `app/page.tsx`, `app/login/page.tsx`, and `app/health-bot/page.tsx` for visual and structural accessibility compliance.
* **Responsive stats grid stacking**: Added a `@media (max-width: 480px)` breakpoint in `app/tracker/page.tsx` to stack stats cards vertically on narrow screens, preventing text overlap and layout compression.

### 8. Refactoring & Code Quality
* **Duplication removal**: Extracted duplicate sandbox auth and initial profile seeding logic in `app/login/page.tsx` into a single helper `loginToSandbox`, eliminating over 200 lines of copy-pasted code.
* **Strict typing**: Removed loose `any` declarations in `app/login/page.tsx`, `app/chat/page.tsx`, `app/reminders/page.tsx`, and `lib/user-profile.ts`, replacing them with strict type definitions (e.g. `{ id, email, role, name, isSandbox }` and `Record<string, any>[]`).

### 9. Production Readiness & Security
* **In-Memory Rate Limiting**: Added `checkRateLimit` IP-based tracking inside `lib/api-auth.ts` and integrated it across all 6 Gemini API endpoints to prevent request flooding and billing abuse.
* **File Upload validation**: Added file size and file format checks to `/scan` (max 5MB, image only) and `/report` (max 10MB, image or PDF only) pages before base64 submission.
* **Root Proxy Guards**: Setup standard root-level `proxy.ts` cookie authentication guards (replacing deprecated `middleware.ts`). Synchronized cookie storage on login and deletion on logout.
* **Security Headers**: Added standard HTTP headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Strict-Transport-Security`) in `next.config.ts`.
* **LocalStorage Disclaimer**: Placed a prominent privacy warning note in the settings panel about local storage container boundaries and shared device risks.

### 10. Documentation & DevOps
* **Vitest Runner**: Installed Vitest and configured a unit test suite verifying rate limiting correctness.
* **CI/CD Pipeline**: Designed a GitHub Actions pipeline validating compiles and unit testing steps.
* **Demo Asset Relocation**: Moved the testing image `skin_dryness_test.png` to `/public/demo/` and updated script/page paths.

---

## 🔍 Resolved Issues & Improvements (Phase 9 Completion)

1. **Avatar Initials & Name Formatting Bug**:
   - Files: `components/doctor-card.tsx` and `app/doctors/[id]/page.tsx`
   - Issue: Doctor initials extraction via `doctor.name.split(" ").slice(1)` failed if the doctor registered without a "Dr." prefix or had a single-word name, leaving the avatar blank or name labels as `"Dr. "`.
   - Fix: Implemented robust logic using regex to strip the greeting prefix, split correctly, and generate initials.

2. **Blocking Browser Alert Popups**:
   - Files: `app/tracker/music/page.tsx`, `app/report/page.tsx`, and `app/profile/page.tsx`
   - Issue: Browser `alert()` calls froze the main UI thread and looked unpolished.
   - Fix: Created an in-app non-blocking custom glassmorphic Toast notification component for clipboard copies, data erasures, and timer completions.

3. **Static Map Placeholder Visual Controls**:
   - File: `app/doctors/page.tsx`
   - Issue: The map simulation card was static.
   - Fix: Added a clinic distance slider filter to filter simulated doctors on the map canvas and projected stable coordinates on the simulated map.

---

## 🛠️ Verification & Compile Status
- **Vitest Unit Tests**: Passed (`8/8` checks succeeded).
- **Turbopack Build**: Successful compile (`npm run build` completed with `0` errors/warnings).
- **TypeScript Check**: Passed cleanly.
