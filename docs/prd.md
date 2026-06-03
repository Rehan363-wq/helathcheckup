# MediScan AI — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** June 2026  
**Author:** Hackathon Team  
**Status:** MVP Build

---

## 1. Problem Statement

India mein healthcare access ek bada crisis hai:

- 65% population rural ya semi-urban hai jahan specialist doctors tak pahunchna mushkil hai
- Ek average Indian **3-4 ghante** wait karta hai sirf OPD mein
- Log Google pe symptoms search karte hain aur **galat self-diagnose** kar lete hain
- Blood reports aate hain — **koi samjhata nahi** kya matlab hai unka
- Skin problems, wounds ko log **ignore karte hain** kyunki doctor tak jaana expensive aur time-consuming hai

**Core Insight:** Log doctor ke paas **tab jaate hain jab bimari bahut badh jaati hai** — kyunki pehle unhe pata hi nahi hota kitna serious hai.

---

## 2. Solution — MediScan AI

> **"Apni photo lo, report upload karo — MediScan batayega kya karna hai aur kahan jaana hai."**

MediScan ek AI-powered web application hai jo:

1. **Skin/wound photo** analyze karke possible condition batata hai
2. **Medical reports (PDF/image)** ko simple Hindi/English mein explain karta hai
3. **Nearby verified doctors** dikhata hai user ke area mein
4. **Doctor connect** karta hai — profile, fees, availability ke saath

**Ye doctor replace nahi karta — ye user ko sahi doctor tak FASTER pahunchata hai.**

---

## 3. Target Users

| User Type | Description |
|---|---|
| **Primary** | 18-45 age, smartphone user, Tier 2/3 city |
| **Secondary** | Senior citizens jinhe reports samajh nahi aate |
| **Tertiary** | Doctors jo digital presence banana chahte hain |

---

## 4. Core Features (MVP)

### Feature 1 — 📸 AI Skin/Wound Analyzer

**What it does:**
- User apni skin problem, rash, wound ki photo upload karta hai
- AI image analyze karke possible conditions suggest karta hai
- Severity level batata hai — Low / Medium / High
- Next step batata hai — "Ghar pe treat karo" ya "Doctor dikhao"

**User Flow:**
```
Upload Photo → AI Processing (5-10 sec) → Result Screen
→ Possible Condition + Confidence %
→ Severity Badge (Green/Yellow/Red)
→ Home Remedies (agar low severity)
→ "Find Doctor Near Me" button (agar medium/high)
```

**Important Disclaimer:**
Har result ke saath clearly likha hoga:
> "Ye AI analysis hai, professional medical advice nahi. Serious symptoms mein turant doctor se milein."

---

### Feature 2 — 📄 Medical Report Explainer

**What it does:**
- User blood test, CBC, sugar report, X-ray report PDF/image upload karta hai
- AI report ko scan karta hai
- Har parameter ko **simple language** mein explain karta hai
- Batata hai — kya normal hai, kya abnormal hai, aur kyun
- Overall summary deta hai

**User Flow:**
```
Upload Report (PDF/Image) → AI Parsing → Explained Report
→ Parameter wise breakdown
→ Normal Range vs Your Value
→ What it means in simple words
→ "Share with Doctor" button
```

**Example Output:**
```
Haemoglobin: 9.2 g/dL
Normal: 12-16 g/dL
⚠️ Aapka haemoglobin kam hai — iska matlab anemia ho sakta hai.
Iron-rich foods khao aur doctor se milna zaruri hai.
```

---

### Feature 3 — 📍 Nearby Doctor Finder

**What it does:**
- User ka location lete hain (browser geolocation)
- Nearest verified doctors dikhata hai map + list view mein
- Doctor ka naam, specialization, fees, rating, distance dikhata hai
- "Get Directions" Google Maps pe le jaata hai

**User Flow:**
```
Allow Location → Fetch Nearby Doctors → List + Map View
→ Filter by: Specialization | Fees | Rating
→ Doctor Card: Name, Degree, Fees, Distance, Rating
→ "Get Directions" → Opens Google Maps
```

---

## 5. Tech Stack

### Frontend
```
Framework:     React.js (Vite)
Styling:       Tailwind CSS
Routing:       React Router v6
State:         useState / useContext
Icons:         Lucide React
```

### AI & APIs
```
AI Model:      Claude API (claude-sonnet-4-20250514)
  - Image analysis (base64 image input)
  - PDF/text report analysis
  - Response in Hindi + English

Maps:          Google Maps JavaScript API
  - Geolocation
  - Nearby Places (doctors, hospitals)
  - Directions

Report Parse:  PDF.js (client-side PDF to text/image)
```

### Hosting (Demo ke liye)
```
Frontend:      Vercel (free, instant deploy)
No Backend needed for MVP (all API calls from frontend)
```

---

## 6. API Integration Details

### Claude API — Image Analysis Prompt
```
System: You are a medical AI assistant. Analyze the uploaded skin/wound 
image and provide: 1) Possible condition name, 2) Confidence %, 
3) Severity (Low/Medium/High), 4) Recommended action. 
Always add disclaimer. Respond in simple Hindi and English.

User: [Base64 Image]
```

### Claude API — Report Analysis Prompt
```
System: You are a medical report explainer. Read this medical report 
and explain each parameter in simple Hindi/English. 
Format: Parameter | Your Value | Normal Range | What it means.
Add overall health summary at end.

User: [Report Text/Image]
```

### Google Maps API
```javascript
// Nearby doctors search
placesService.nearbySearch({
  location: userLatLng,
  radius: 5000,
  type: 'doctor',
  keyword: specialization // optional filter
})
```

---

## 7. Screen Breakdown

```
1. Landing Page
   ├── Hero Section — Tagline + CTA
   ├── 3 Feature Cards
   └── How it Works (3 steps)

2. Skin Analyzer Page
   ├── Upload Zone (drag & drop / click)
   ├── Loading State (AI analyzing...)
   └── Result Card
       ├── Condition Name + Confidence
       ├── Severity Badge
       ├── Description
       ├── Recommended Action
       └── Find Doctor Button

3. Report Explainer Page
   ├── Upload Zone (PDF or Image)
   ├── Loading State
   └── Explained Report
       ├── Parameter Table
       └── Summary Card

4. Doctor Finder Page
   ├── Location Permission Banner
   ├── Filter Bar (specialization, fees)
   ├── Map View (Google Maps embed)
   └── Doctor List Cards
       ├── Name + Degree
       ├── Specialization
       ├── Distance + Rating
       ├── Consultation Fee
       └── Get Directions Button
```

---

## 8. User Journey (End-to-End)

```
Ravi ko 3 din se rash hai
          ↓
MediScan khola
          ↓
Photo upload ki
          ↓
AI ne bataya: "Possible Fungal Infection, Severity: Medium"
          ↓
"Find Doctor Near Me" click kiya
          ↓
3 km door Dr. Sharma — Dermatologist, ₹300 fees
          ↓
Directions le ke gaya
          ↓
Report laya → Report Explainer mein upload ki
          ↓
Samajh aaya kya chal raha hai
          ↓
Ravi ka time aur paisa dono bache ✅
```

---

## 9. Business Model

### Layer 1 — Users (B2C)
| Plan | Price | Features |
|---|---|---|
| Free | ₹0 | 3 scans/month, 3 report analysis |
| Pro | ₹99/month | Unlimited scans + reports |

### Layer 2 — Doctors (B2B)
| Plan | Price | Features |
|---|---|---|
| Basic Listing | Free | Name + Location |
| Verified Badge | ₹999/month | Top placement + verified tick |
| Appointment Booking | 15% commission | Per booking |

### Layer 3 — Enterprise
- Hospitals, Insurance companies ko white-label API
- ₹50,000 - ₹5,00,000/month

---

## 10. MVP Scope — Hackathon Build

### ✅ BANAO (Must Have)
- [ ] Landing Page
- [ ] Skin Photo Upload + Claude AI Analysis
- [ ] Report Upload + Claude AI Explanation
- [ ] Nearby Doctor Finder (Google Maps)
- [ ] Doctor List with basic info

### 🔄 OPTIONAL (Agar time bache)
- [ ] Filter by specialization
- [ ] Doctor detail page
- [ ] Share report feature

### ❌ SKIP KARO (Post-hackathon)
- [ ] User login/signup
- [ ] Actual appointment booking
- [ ] Payment integration
- [ ] Doctor dashboard

---

## 11. Build Priority & Time Estimate

```
Task                          Time
─────────────────────────────────────
Project setup + Tailwind      30 min
Landing Page                  45 min
Skin Analyzer (Upload + API)  90 min
Report Explainer (Upload+API) 60 min
Doctor Finder (Maps API)      60 min
Polish + Demo prep            45 min
─────────────────────────────────────
TOTAL                         ~6 hours
```

---

## 12. Pitch Structure (3 min)

```
0:00 - 0:30  →  Problem (emotional hook — Ravi ki story)
0:30 - 1:00  →  Solution intro — "MediScan kya hai"
1:00 - 2:00  →  Live Demo (3 features)
2:00 - 2:30  →  Business Model
2:30 - 3:00  →  Team + Ask
```

**One Liner:**
> "MediScan AI — apni photo lo, report bhejo, sahi doctor tak pahuncho — ek minute mein."

**Key Pitch Line:**
> "Hum doctor replace nahi kar rahe — hum ensure kar rahe hain ki aap SAHI doctor tak FASTER pahuncho, BETTER information ke saath."

---

## 13. Success Metrics (Post-Launch)

| Metric | 3 Month Target |
|---|---|
| Monthly Active Users | 10,000 |
| Scans per day | 500 |
| Doctor listings | 1,000 |
| User rating | 4.2+ stars |

---

## 14. Risks & Mitigation

| Risk | Mitigation |
|---|---|
| AI galat diagnosis de | Strong disclaimer, "consult doctor" always shown |
| Google Maps API cost | Free tier kaafi hai MVP ke liye |
| User data privacy | No data stored on server, all client-side processing |
| Medical liability | We are an information tool, not diagnostic tool |

---

*PRD Version 1.0 — Hackathon MVP Build*  
*MediScan AI — Apna Doctor, Apni Zeb Mein*