# MediScan AI — Tech Stack Document

**Project:** MediScan AI  
**Version:** 1.0  
**Date:** June 2026

---

## 🏗️ Architecture Overview

```
User Browser
     │
     ▼
┌─────────────────┐
│   Next.js 15    │  ← Frontend + Backend (App Router)
│   TypeScript    │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
┌───────┐  ┌──────────┐
│Claude │  │ Supabase │  ← Auth + DB + Storage
│  API  │  │          │
└───────┘  └──────────┘
    │
    ▼
┌───────────┐
│Google Maps│  ← Doctor Finder
│    API    │
└───────────┘
```

---

## 1. 🖥️ Frontend

### Next.js 15 (App Router)
```
Why Next.js?
✅ Server Components — API keys safe rahenge (client pe expose nahi honge)
✅ API Routes — Supabase aur Claude calls server side honge
✅ Image Optimization — Medical photos fast load hongi
✅ File based routing — Simple aur clean structure
✅ Built-in TypeScript support
```

### TypeScript
```
Why TypeScript?
✅ Medical data ke liye strict types zaroori hain
✅ API response types define kar sakte hain
✅ Bugs pehle pakad aate hain
✅ Code readability badh jaati hai
```

### Tailwind CSS v4
```
Why Tailwind?
✅ Fast UI banana — hackathon ke liye perfect
✅ Responsive by default
✅ No separate CSS files manage karne nahi padte
```

### shadcn/ui
```
Why shadcn?
✅ Ready-made accessible components
✅ Tailwind ke saath kaam karta hai
✅ Upload zones, cards, badges — sab milta hai
✅ Copy-paste — install nahi karna
```

---

## 2. 🗄️ Backend — Supabase

### Supabase Auth
```
Kya karega:
- User signup/login (Email + Google OAuth)
- Session management
- Row Level Security (RLS) — sirf apna data dikhe

Tables jo protect honge:
- scan_results     → sirf apne scans dekho
- report_analysis  → sirf apni reports dekho
- saved_doctors    → sirf apne saved doctors dekho
```

### Supabase Database (PostgreSQL)
```sql
-- Users ki scan history
Table: scan_results
  id            UUID PRIMARY KEY
  user_id       UUID REFERENCES auth.users
  image_url     TEXT
  ai_result     JSONB        -- Claude ka response
  severity      TEXT         -- low / medium / high
  condition     TEXT
  created_at    TIMESTAMP

-- Report analysis history  
Table: report_analysis
  id            UUID PRIMARY KEY
  user_id       UUID REFERENCES auth.users
  report_url    TEXT
  ai_summary    JSONB        -- Claude ka explanation
  created_at    TIMESTAMP

-- Doctor listings
Table: doctors
  id            UUID PRIMARY KEY
  name          TEXT
  specialization TEXT
  location      POINT        -- lat/lng
  area          TEXT
  city          TEXT
  fees          INTEGER
  rating        DECIMAL
  phone         TEXT
  verified      BOOLEAN
  created_at    TIMESTAMP
```

### Supabase Storage
```
Buckets:
  /skin-scans     → User ki skin photos (private)
  /reports        → User ki medical reports (private)

Rules:
  - Max file size: 10MB
  - Allowed types: image/jpeg, image/png, image/webp, application/pdf
  - Access: Only owner can read/write
```

---

## 3. 🤖 AI — Claude API (Anthropic)

### Model
```
Model: claude-sonnet-4-20250514
Max Tokens: 1500
```

### API Routes (Next.js Server Side)

#### Route 1 — Skin Analysis
```
POST /api/analyze/skin
Input:  { imageBase64: string, mimeType: string }
Output: {
  condition: string,
  confidence: number,
  severity: "low" | "medium" | "high",
  description: string,
  recommendation: string,
  disclaimer: string
}
```

#### Route 2 — Report Analysis
```
POST /api/analyze/report
Input:  { reportText: string } or { imageBase64: string }
Output: {
  parameters: [
    {
      name: string,
      value: string,
      normalRange: string,
      status: "normal" | "low" | "high",
      explanation: string
    }
  ],
  summary: string,
  urgency: "normal" | "consult" | "urgent"
}
```

---

## 4. 🗺️ Maps — Google Maps API

```
APIs Used:
  ✅ Maps JavaScript API    → Map display
  ✅ Places API             → Nearby doctors search
  ✅ Geolocation API        → User location

Library:
  @googlemaps/react-wrapper  → React mein easy integration
```

---

## 5. 📦 Full Package List

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "@googlemaps/react-wrapper": "^1.x",
    "@anthropic-ai/sdk": "^0.x",
    "pdf-parse": "^1.x",
    "lucide-react": "^0.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "^19.x",
    "@types/node": "^20.x",
    "tailwindcss": "^4.x",
    "eslint": "^9.x"
  }
}
```

---

## 6. 📁 Folder Structure

```
mediscan/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx          ← User history
│   ├── scan/
│   │   └── page.tsx          ← Skin analyzer
│   ├── report/
│   │   └── page.tsx          ← Report explainer
│   ├── doctors/
│   │   └── page.tsx          ← Doctor finder
│   ├── api/
│   │   ├── analyze/
│   │   │   ├── skin/
│   │   │   │   └── route.ts  ← Claude skin API
│   │   │   └── report/
│   │   │       └── route.ts  ← Claude report API
│   │   └── doctors/
│   │       └── route.ts      ← Google Places API
│   ├── layout.tsx
│   └── page.tsx              ← Landing page
│
├── components/
│   ├── ui/                   ← shadcn components
│   ├── upload-zone.tsx       ← Drag & drop upload
│   ├── result-card.tsx       ← AI result display
│   ├── doctor-card.tsx       ← Doctor info card
│   ├── severity-badge.tsx    ← Low/Medium/High badge
│   └── navbar.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts         ← Browser client
│   │   └── server.ts         ← Server client
│   ├── claude.ts             ← Claude API helper
│   ├── maps.ts               ← Google Maps helper
│   └── utils.ts
│
├── types/
│   ├── scan.ts               ← Scan result types
│   ├── report.ts             ← Report analysis types
│   └── doctor.ts             ← Doctor types
│
├── .env.local                ← API keys (NEVER commit)
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 7. 🔐 Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Server only

# Anthropic Claude
ANTHROPIC_API_KEY=your_anthropic_api_key          # Server only

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key    # Public ok hai
```

---

## 8. 🔒 Security Rules

```
✅ Claude API key — sirf server side (API routes mein)
✅ Supabase service key — sirf server side
✅ Google Maps key — domain restrict karo production mein
✅ Supabase RLS — har table pe ON karo
✅ File upload — type aur size validate karo
✅ User data — encrypted at rest (Supabase default)
```

---

## 9. 🚀 Deployment

```
Platform:    Vercel (Next.js ke liye best)
Database:    Supabase Cloud (free tier kaafi hai)
Storage:     Supabase Storage (free tier: 1GB)

Deploy Steps:
1. GitHub pe push karo
2. Vercel pe import karo
3. Environment variables add karo
4. Deploy ✅
```

---

## 10. ⏱️ Setup Time Estimate

```
Task                              Time
──────────────────────────────────────
Next.js + TS project setup        15 min
Tailwind + shadcn setup           15 min
Supabase project + tables         30 min
Supabase Auth setup               20 min
Claude API route setup            20 min
Google Maps setup                 20 min
──────────────────────────────────────
TOTAL SETUP                       ~2 hours
```

---

## 11. 💡 Hackathon Tips

```
✅ Pehle .env.local setup karo — baad mein bhoologe
✅ Supabase tables pehle bana lo — schema clear hoga
✅ Claude API route pehle test karo Postman/Thunder se
✅ shadcn components copy karo — mat banao from scratch
✅ Mobile responsive check karo — judges phone pe dekhte hain
✅ Loading states zaroori hain — AI slow hoti hai
✅ Error messages friendly rakho
```

---

*TechStack v1.0 — MediScan AI Hackathon Build*