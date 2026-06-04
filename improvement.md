# Vitalis Health Systems — Application Improvement Backlog (`improvement.md`)

This document lists the new bugs, visual issues, and inconsistencies identified across the Vitalis Health Systems application pages, along with planned solutions.

---

## 🔍 Identified Shortcomings & Bugs (Run 2)

### 1. Sandbox Name & Profile Syncing Mismatch
* **Issue:** Quick sandbox logins bypass the onboarding wizard if a previous session completed onboarding. However, the local storage profiles (`healflow-patient-profile`, `healflow-health-profile`) are not synchronized with the active sandbox credentials, causing greetings to mix (e.g., `Demo PatientAman Sharma`) and the triage bot context to address the patient as "Aman" while the dashboard says "Demo Patient".
* **Fix:** When a user logs in via Sandbox (Patient or Doctor), automatically initialize and synchronize their profile in local storage matching the sandbox credentials so name states are always aligned.

### 2. Appointment Booking Date Timezone Offset Bug
* **Issue:** On `/doctors/[id]/page.tsx`, booking a slot like "Thu 4 Jun" late at night registers the appointment date as "2026-06-03" on the dashboard. This is caused by using `toISOString()` (UTC timezone) for date IDs while using local timezone functions (`getDate()`, `getDay()`) for day/month names.
* **Fix:** Change `availableDates` generation to calculate date IDs in the local timezone (`YYYY-MM-DD`).

### 3. Hinglish Copywriting & Clean UI Polish
* **Issue:** The main buttons and headers on `/scan`, `/report`, and `/health-bot` mix Hindi and English text in UI placeholders (e.g. `"Photo upload karo — AI batayega"`).
* **Fix:** Refine UI placeholders to have professional English headings with dual-language subtitles/explanations below them to enhance the Apple-like minimalist aesthetic.

### 4. Supabase DB Schema Approval Fallbacks
* **Issue:** The server logs warning messages about missing `is_approved` column in `profiles` table.
* **Fix:** Ensure the database schema triggers and migration sql contain clean definitions for `is_approved`.

---

## 🛠️ Execution Checklist
- [ ] Implement local storage profile syncing during Sandbox Quick Login inside `app/login/page.tsx`.
- [ ] Fix timezone date calculation in `availableDates` inside `app/doctors/[id]/page.tsx`.
- [ ] Professionalize UI strings and copywriting on `/scan`, `/report`, and `/health-bot`.
- [ ] Verify build correctness and E2E browser behavior.
