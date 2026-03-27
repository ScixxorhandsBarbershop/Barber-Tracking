# ✂ SCISSORHAND — Complete Setup Guide
*Beginner-friendly, step-by-step. No prior coding experience required.*

---

## What You're Building

A private, cloud-based barbershop tracking app that runs in any browser and installs as an app on your iPad, iPhone, or Mac. It tracks transactions, commission, tips, and sends you automated email reports.

**Cost: $0/month** (all free tiers)

---

## Prerequisites — Install These First

1. **Node.js** — Download from https://nodejs.org (choose "LTS" version)
2. **Git** — Download from https://git-scm.com
3. **A free GitHub account** — https://github.com
4. **A free Vercel account** — https://vercel.com (sign up with GitHub)
5. **A free Supabase account** — https://supabase.com
6. **A free Resend account** — https://resend.com

---

## STEP 1 — Set Up Supabase (Your Database)

### 1.1 Create a Project
1. Go to https://supabase.com and log in
2. Click **"New Project"**
3. Choose your organization
4. Fill in:
   - **Name:** `scissorhand`
   - **Database Password:** Choose a strong password and **save it somewhere**
   - **Region:** Choose closest to you (e.g., `US East` for Toronto)
5. Click **"Create new project"** and wait ~2 minutes

### 1.2 Get Your API Keys
1. In your project, click **"Settings"** (gear icon, left sidebar)
2. Click **"API"**
3. Copy and save these three values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
   - **service_role** key (another long string — keep this SECRET)

### 1.3 Run the Database Schema
1. In Supabase, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. Open the file `supabase/migrations/001_initial_schema.sql` from this project
4. Copy the entire contents and paste into the SQL editor
5. Click **"Run"** (green button)
6. You should see: *"Success. No rows returned"*

This creates all your tables and seeds 10 default barbers + 10 services.

### 1.4 Create Your Admin User
1. In Supabase, click **"Authentication"** (left sidebar)
2. Click **"Users"**
3. Click **"Add user"** → **"Create new user"**
4. Enter your email (e.g., `Scixxorhand.tm@gmail.com`) and a strong password
5. Click **"Create user"**

---

## STEP 2 — Set Up Resend (Email Reports)

1. Go to https://resend.com and create an account
2. Click **"API Keys"** in the sidebar
3. Click **"Create API Key"**
4. Name it `scissorhand` and click **"Add"**
5. **Copy the key immediately** — it starts with `re_` — you won't see it again

### 2.1 Verify a Sending Domain (or use sandbox)
- **Easiest option (sandbox):** Resend's free tier lets you send to your own email without a custom domain. No setup needed — just use your Gmail as the `to` address.
- **Custom domain (optional):** If you have a domain, add it in Resend → Domains. Follow their DNS instructions.
- For now, the `from` address in `src/lib/email.ts` can be `onboarding@resend.dev` (Resend's sandbox sender) — update this if you set up a custom domain.

---

## STEP 3 — Set Up the Code

### 3.1 Upload to GitHub
1. Go to https://github.com and log in
2. Click **"+"** → **"New repository"**
3. Name it `scissorhand`, set to **Private**, click **"Create repository"**
4. On your computer, open **Terminal** (Mac) or **Command Prompt** (Windows)
5. Navigate to the project folder:
   ```bash
   cd path/to/scissorhand
   ```
6. Run these commands one at a time:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/scissorhand.git
   git push -u origin main
   ```
   *(Replace `YOUR_USERNAME` with your actual GitHub username)*

---

## STEP 4 — Deploy to Vercel

### 4.1 Import Project
1. Go to https://vercel.com and log in with GitHub
2. Click **"Add New…"** → **"Project"**
3. Find your `scissorhand` repository and click **"Import"**
4. Framework should auto-detect as **Next.js**
5. **DO NOT click Deploy yet** — first add environment variables

### 4.2 Add Environment Variables
In the Vercel deploy screen, scroll down to **"Environment Variables"** and add each one:

| Variable Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key |
| `RESEND_API_KEY` | Your Resend API key (starts with `re_`) |
| `REPORT_EMAIL` | `Scixxorhand.tm@gmail.com` |
| `CRON_SECRET` | Any random string (e.g., `my-secret-cron-key-2024`) |

6. After adding all variables, click **"Deploy"**
7. Wait ~2 minutes for the build to complete
8. You'll get a URL like `https://scissorhand-abc123.vercel.app` — **this is your app!**

---

## STEP 5 — Test Your App

1. Open your Vercel URL in a browser
2. You'll be redirected to `/login`
3. Log in with the email/password you created in Supabase Step 1.4
4. You should see the Dashboard

### Test a Transaction
1. Click **"New Transaction"** in the sidebar
2. Select a service (e.g., "Haircut")
3. Select a barber (e.g., "Marcus")
4. Select payment method (e.g., "Cash")
5. Select a tip (e.g., 15%)
6. Click **"Save Transaction"**
7. ✅ You should see a confirmation screen

### Test the Dashboard
1. Click **"Dashboard"**
2. You should see your transaction reflected in Today's metrics

---

## STEP 6 — Set Up Cron Jobs (Automated Email Reports)

The `vercel.json` file already has the cron schedules configured. They activate automatically when deployed to Vercel.

**Schedules (UTC times):**
- Daily report: 8:00 PM EST = `0 20 * * *` *(Vercel uses UTC, so adjust if needed: 8PM EST = 1AM UTC next day = `0 1 * * *`)*
- Weekly report: Sunday 6:00 PM EST = `0 23 * * 0`  
- Monthly report: 1st of month = `0 13 1 * *`

### Fix Cron Timezone (Important for EST)
Open `vercel.json` and update to EST-adjusted UTC times:

```json
{
  "crons": [
    { "path": "/api/cron?type=daily",   "schedule": "0 0 * * *" },
    { "path": "/api/cron?type=weekly",  "schedule": "0 23 * * 0" },
    { "path": "/api/cron?type=monthly", "schedule": "0 13 1 * *" }
  ]
}
```

### Add Cron Auth to Vercel
The cron route is protected by your `CRON_SECRET`. Vercel automatically sends a `Authorization: Bearer <CRON_SECRET>` header to cron routes. Make sure `CRON_SECRET` is set in your Vercel environment variables (done in Step 4.2).

### Test Email Manually
1. Go to your app → **Settings** page
2. Click **"Send Now"** next to "Daily Report"
3. Check `Scixxorhand.tm@gmail.com` for the email

---

## STEP 7 — Install as an App (PWA)

### On iPhone / iPad:
1. Open your Vercel URL in **Safari**
2. Tap the **Share** button (box with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Name it "Scissorhand" and tap **"Add"**
5. The app now appears on your home screen like a native app

### On Mac:
1. Open your URL in **Chrome** or **Safari**
2. In Chrome: Click the install icon in the address bar (looks like a screen with arrow)
3. In Safari: File → Add to Dock
4. The app appears in your Dock

---

## STEP 8 — Add Your Custom Barber Names

Your barbers are pre-seeded with placeholder names. Update them:

1. Log into your app
2. Click **"Barbers"** in the sidebar
3. Click the ✏️ edit icon next to each barber
4. Update the name and commission percentages
5. Click ✓ to save

Or update directly in Supabase:
1. Go to Supabase → **Table Editor** → **barbers**
2. Click on any row to edit inline

---

## STEP 9 — Customize Services & Prices

1. In your app, click **"Services"**
2. Edit existing services or add new ones
3. Prices auto-fill when selecting a service during transaction entry

---

## Ongoing Usage

### Daily Workflow
1. Open the app on your iPad/iPhone
2. After each client, tap **"New Transaction"**
3. Service → Barber → Cash/Tap → Tip → Save
4. Takes ~10 seconds per transaction

### Viewing Reports
- **Dashboard** — today's snapshot, switch to weekly/monthly/yearly
- **Analytics** — charts + full barber breakdown
- **Transactions** — searchable full log
- **Email** — automated reports land in your inbox automatically

---

## Troubleshooting

### "Unauthorized" error on login
- Double-check your Supabase credentials in Vercel environment variables
- Make sure you created the admin user in Supabase Auth (Step 1.4)
- Redeploy after adding/changing env vars (Vercel → Deployments → Redeploy)

### Emails not sending
- Verify `RESEND_API_KEY` is correct
- In `src/lib/email.ts`, change `FROM_EMAIL` to `onboarding@resend.dev` for sandbox testing
- Check Resend dashboard for send logs

### Transactions not saving
- Check browser console (F12) for error messages
- Verify Supabase schema was run successfully (Table Editor should show tables)

### App not installing as PWA
- Must be accessed over HTTPS (Vercel handles this automatically)
- On iOS, must use Safari specifically

---

## Security Notes

- **Your app is admin-only.** The login page is the only entry point.
- **Service role key is secret.** Never share it or commit it to GitHub. It's only in Vercel env vars.
- **Row Level Security is enabled** on all Supabase tables.
- To add a second admin, create another user in Supabase Auth.

---

## Future: Scaling to SaaS

The codebase is structured for multi-tenancy. When ready to scale:

1. Add a `shop_id` column to all tables
2. Update RLS policies to filter by `shop_id`  
3. Add a `shops` table and subscription model
4. Add barber-level login with scoped access
5. Add Stripe for billing

The foundation is already in place.

---

*Built with Next.js 14 · Supabase · Vercel · Resend*
*Scissorhand v1.0 — Premium Barbershop Tracker*
