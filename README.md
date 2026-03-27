# ✂ Scissorhand

**Premium Barbershop Performance + Financial Tracker**

A private, cloud-based web app for tracking transactions, barber commissions, tips, and automated reporting. Built as a PWA — installable on iPad, iPhone, and Mac.

## Features

- ⚡ **Fast transaction input** — service → barber → cash/tap → tip → done in 10 seconds
- 🧮 **Automatic HST calculation** — 13% on tap payments, none on cash
- 💈 **Per-barber commission tracking** — separate cash and tap rates
- 📊 **Live dashboard** — daily / weekly / monthly / yearly metrics
- 🏆 **Leaderboard** — barber rankings by revenue, clients, tips
- 📧 **Automated email reports** — daily 8PM, weekly Sunday, monthly 1st
- 📱 **PWA** — installs as native app on iPad/iPhone/Mac
- 🔒 **Admin-only** — secure login, no barber access

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (React, TypeScript) |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | Vercel (free tier) |
| Email | Resend |
| Cron Jobs | Vercel Cron |

## Quick Start

See **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** for complete step-by-step instructions.

## Project Structure

```
scissorhand/
├── src/
│   ├── app/
│   │   ├── (app)/              # Protected app routes
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── new/            # New transaction
│   │   │   ├── analytics/      # Charts & leaderboard
│   │   │   ├── transactions/   # Full transaction log
│   │   │   ├── barbers/        # Barber management
│   │   │   ├── services/       # Service management
│   │   │   └── settings/       # App settings
│   │   ├── api/
│   │   │   ├── transactions/   # CRUD + calculations
│   │   │   ├── services/       # CRUD
│   │   │   ├── barbers/        # CRUD
│   │   │   ├── reports/        # Metrics aggregation
│   │   │   └── cron/           # Email report triggers
│   │   └── login/              # Auth page
│   ├── lib/
│   │   ├── calculations.ts     # HST + commission logic
│   │   ├── reports.ts          # Data aggregation
│   │   ├── email.ts            # Resend email templates
│   │   ├── dates.ts            # Date range helpers
│   │   └── supabase.ts         # DB clients
│   ├── types/index.ts          # TypeScript types
│   └── middleware.ts           # Auth guard
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service worker
├── vercel.json                 # Cron schedules
└── SETUP_GUIDE.md
```

## Tax Rules

| Payment | HST Applied | Commission Base |
|---|---|---|
| Cash | ❌ No | Base price only |
| Tap / Card | ✅ 13% | Base price only |

Tips are always 100% to the barber and tracked separately.

## License

Private — not for redistribution.
