# CliniHome AI — Platform Development Roadmap

This document outlines the planned future features, security improvements, and architectural milestones for CliniHome AI.

---

## 📅 Near-Term Milestone (Next 1-2 Months)

### 1. Leaflet / Google Maps Full Integration
- **Objective**: Replace the current CSS static map placeholder on the "Find Specialists" page with a fully interactive map using Leaflet.js or Google Maps Platform.
- **Details**: Bind actual latitude/longitude database parameters of doctors to maps pins and calculate distances dynamically based on browser GPS.

### 2. Client-Side Local Storage Encryption
- **Objective**: Encrypt all sensitive client-side health logs in `localStorage`.
- **Details**: Implement a lightweight encryption utility (e.g. using AES-256 via Web Crypto API) using a password-derived key so that health metrics, prescriptions, and chats are protected from local device exposure.

### 3. Real Appointment Booking Integrations
- **Objective**: Move beyond simulated consultant bookings.
- **Details**: Integrate slot calendar APIs (Google Calendar / Outlook) and add double-booking conflicts guards.

---

## 📅 Mid-Term Milestone (Next 3-6 Months)

### 1. Multimodal AI Diagnostics Enhancements
- **Objective**: Improve AI vision analysis for blood test reports and dermatology.
- **Details**:
  - Support multi-page PDF medical reports uploads.
  - Integrate visual overlays pointing out specific rashes or dry patches on analyzed skin photos.

### 2. Live Supabase Realtime Provider Consulting
- **Objective**: Allow active chat consultations between patients and doctor accounts.
- **Details**: Use Supabase Realtime channels to broadcast messages instantly when both user and doctor are logged in, eliminating the need to poll route handlers.

### 3. Patient Medical Data Export (GDPR compliant)
- **Objective**: Standardize data porting portability.
- **Details**: Allow patients to export their entire history as a structured PDF report or standardized medical XML format (HL7/FHIR compliant) to take to their offline providers.

---

## 📅 Long-Term Vision (6+ Months)

### 1. Smart Wearable Synchronizations
- **Objective**: Connect with Apple HealthKit and Google Fit.
- **Details**: Automatically sync daily steps, sleep quality, and active heart-rates to the tracker log dashboards.

### 2. Federated AI Health Coaching
- **Objective**: Run privacy-preserving AI coaching models locally on-device.
- **Details**: Leverage WebGPU or local WebAssembly runtime parameters to process health indicators without sending raw logs to third-party APIs.
