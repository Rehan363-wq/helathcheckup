# HealFlow AI — Application Improvement Backlog (`improvement.md`)

This document lists the resolved bugs, user experience improvements, security enhancements, and refactoring efforts implemented to bring HealFlow AI to production and enterprise-grade readiness.

---

## 🔍 Resolved Shortcomings & Bugs (Phases 1 - 8)

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
  - Translated alarm prompt buttons (`"Done, Khali Maine!"` ➡️ `"Done, I took it!"`) and labels.
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

### 6. Emergency Button Removal & Hinglish Chrome Elimination (Phase 8)
* **navbar.tsx**: Completely removed the "Emergency Call (112)" button from the header container and removed the `PhoneCall` icon dependency.
* **doctor-dashboard/page.tsx**: Corrected mobile responsive grid styling constraint by enforcing `display: flex !important` in mobile flex queries on `.chat-container-layout`. Translated patient empty selection state and mock data list queries from Hinglish to clean English. Standardized inline hex colors to theme-aware CSS variables. Added responsive focus styles to forms.
* **Hinglish Chrome Scrubbing**: Replaced all remaining raw Hindi/Hinglish greeting messages, error messages, and starter prompts in `/chat`, `/health-bot`, `/tracker/chat`, `/profile`, `/tracker/history` and standard catch-block route handlers with professional English.

---

## 🔍 Active Issues & New Discoveries (Phase 9)

### 1. Doctor Dashboard Layout Clipping on Mobile Viewports
* **Issue**: The Doctor Profile Card above the chat feed takes up too much vertical space on mobile screens, pushing the active consultation chat container and input box out of the viewport.
* **Solution**: Hide the Doctor Profile Card on mobile viewports when a patient is selected (`className="doctor-profile-card mobile-hidden"`), providing maximum vertical height to the active messaging window.

### 2. Chatbot Language Quality Defaults
* **Issue**: The AI Health Bot triager responds in Hinglish by default even if the user profile preference is not set to Hinglish.
* **Solution**: Update the system instructions in `HEALTH_CHATBOT_PROMPT` and `buildSmartHealthBotPrompt` to read the user's `language_preference` dynamically, defaulting to professional English if unspecified or set to `english`.

---

## 🔍 Active Issues & New Discoveries (Phase 10)

### 1. AI Health Coach Language Support
* **Issue**: The AI Health Coach chatbot is hardcoded to Hinglish in `HEALTH_COACH_SYSTEM_PROMPT` and always appends Hinglish daily score alerts, ignoring the user's `language_preference`.
* **Solution**: Refactor `HEALTH_COACH_SYSTEM_PROMPT` into a dynamic prompt builder `buildHealthCoachSystemPrompt(languagePreference)` that dynamically outputs instructions for English, Hindi, or Hinglish, and align tracker chat score labels.

### 2. AI Doctor Chat Language Support
* **Issue**: The simulated AI doctor chat (`app/api/chat/doctor/route.ts`) hardcodes Hinglish responses, disregarding the patient's language preference.
* **Solution**: Retrieve the patient's `language_preference` in the POST handler and pass it dynamically into the doctor's chat prompt.

### 3. Diagnostic Image Analysis Language Support (Skin & Reports)
* **Issue**: Both Skin analysis and Medical Report analysis prompts (`SKIN_ANALYSIS_PROMPT` and `REPORT_ANALYSIS_PROMPT`) are hardcoded to mix Hindi and English (Hinglish), neglecting patients who prefer pure English or pure Hindi.
* **Solution**: Dynamically generate these prompts using builders `buildSkinAnalysisPrompt(languagePreference)` and `buildReportAnalysisPrompt(languagePreference)` and pass client language preference through POST handlers.

### 4. Residual Hinglish Chrome and Labels
* **Issue**: A few minor Hinglish labels remain in app views:
  - `app/report/page.tsx` contains `"✅ Sab Normal"` as the label for normal report urgency.
  - `app/tracker/chat/page.tsx` hardcodes Hinglish `"📊 Aaj ka Health Score: "` in the coach UI.
* **Solution**: Translate `"Sab Normal"` to `"All Normal"` and make the daily score labels multi-lingual based on language preference.

---

## 🛠️ Verification & Compile Status
- **Turbopack Build**: Successful compile (`npm run build` completed with `0` errors/warnings).
- **TypeScript Check**: Passed cleanly.
