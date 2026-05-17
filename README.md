<div align="center">
  <img src="public/atomquest-logo.png" alt="AtomQuest Portal" width="180"/>

  # AtomQuest Portal
  **In-House Goal Setting & Tracking Portal — AtomQuest Hackathon 1.0**

  [![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://atomquest-portal-seven.vercel.app)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
  [![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com)
</div>

---

## 🚀 Live Demo

**[atomquest-portal-seven.vercel.app](https://atomquest-portal-seven.vercel.app)**

| Role     | Email               | Password   |
|----------|---------------------|------------|
| Employee | employee@demo.com   | Demo@1234  |
| Manager  | manager@demo.com    | Demo@1234  |
| Admin    | admin@demo.com      | Demo@1234  |

> Click the **Employee / Manager / Admin** buttons on the login page to auto-fill credentials.

---

## 📋 Features

### ✅ Must-Have
- Goal creation with weightage validation
- Manager approval workflow
- Goal lock after approval
- Shared goals (weightage-only editable by collaborators)
- Quarterly check-ins with window enforcement
- Progress score computation across all 4 UoM types
- Admin goal unlock

### 📊 Governance
- CSV achievement report export
- Completion dashboard
- Full audit trail
- Cycle management (open / close quarters)

### 🎁 Bonus
- Email notifications via Resend API
- Escalation module with log
- Analytics charts — QoQ trends, dept breakdown, thrust area, manager effectiveness
- Achievement sync for shared goals

---

## 🛠️ Tech Stack

| Layer            | Technology                                              |
|------------------|---------------------------------------------------------|
| Frontend         | Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui, Recharts |
| Backend / Auth   | Supabase (PostgreSQL, Row Level Security, JWT Auth)     |
| Email            | Resend API via Next.js API routes                       |
| Hosting          | Vercel (auto-deploy on push to `main`)                  |

---

## 🏗️ Architecture

```
Users (Employee / Manager / Admin)
        │ HTTPS
        ▼
   Vercel (Next.js 14)
   ├── App Router + Server Components
   ├── Middleware — Auth guard, Role-based redirect
   └── UI — Tailwind CSS, shadcn/ui, Recharts
        │ Supabase JS SDK
        ▼
   Supabase
   ├── PostgreSQL — profiles, goals, checkins, audit_logs, cycle_settings
   ├── JWT Auth + Email/Password
   └── Row Level Security
       ├── Employee: own goals only
       ├── Manager: team goals
       └── Admin: all data
        │
        ▼
   Resend — Email Notifications
   Goal submitted → Manager | Approved/Rejected → Employee
```

---

## 🧭 Demo Journey

**Step 1 — Employee**
Login → Create goals (weightage validation) → Submit for approval

**Step 2 — Manager**
Login → Review team goals → Edit inline → Approve or Reject → Add check-in comments

**Step 3 — Admin**
Login → View analytics → Export CSV → Check audit log → Manage cycle settings → Unlock goals

---

## 🔧 Local Setup

```bash
git clone https://github.com/Rudra-25-12/AtomQuest-Portal.git
cd AtomQuest-Portal
npm install
```

Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗺️ Planned Enhancements

- SSO via Azure AD / Entra ID with org hierarchy sync
- Escalation rule engine with SLA tracking and Teams cards
- Advanced analytics — dept heatmaps, manager ratings, Export PDF
- AI Assist — goal suggestions, anomaly alerts, NL summaries (Claude API)

---

Built by **Rudra Pratap Singh** for AtomQuest Hackathon 1.0
