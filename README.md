# PantryFit — Complete Setup Guide

Everything you need is in this zip.
Follow the steps below and your app will be live on the web today.

---

## YOUR LIVE APP URL (once set up)
https://YOUR_GITHUB_USERNAME.github.io/pantryfit

Anyone can open this on their phone and use it immediately.
No App Store. No download. Works like an app when added to home screen.

---

## FILES IN THIS ZIP

| File | What it is |
|------|-----------|
| `forge.html` | FORGE — your control panel |
| `pantryfit-v10.html` | The PantryFit app (becomes index.html) |
| `deploy.js` | Automatic builder script |
| `phases.json` | All 9 build phases pre-written |
| `progress.json` | Tracks what has been built |
| `.github/workflows/build.yml` | Tells GitHub when to run |

---

## STEP 1 — Create GitHub account (5 min)

1. Go to **github.com**
2. Click **Sign up**
3. Use your email, create a password, pick a username
4. Verify your email

---

## STEP 2 — Create your repo (2 min)

1. Click **+** top right → **New repository**
2. Name: `pantryfit`
3. Set to **Public** (required for free GitHub Pages hosting)
4. Leave everything else blank
5. Click **Create repository**

---

## STEP 3 — Upload your files (5 min)

**On a laptop — easiest way:**
1. Unzip this file
2. Open Terminal (Mac) or Command Prompt (Windows)
3. Run these commands (replace YOUR_USERNAME):
```
cd pantryfit-final
git init
git add -A
git commit -m "PantryFit setup"
git remote add origin https://github.com/YOUR_USERNAME/pantryfit.git
git push -u origin main
```

**On iPhone only:**
1. Download **Working Copy** from App Store (free)
2. Clone your empty repo
3. Drag all files in
4. Commit and push

---

## STEP 4 — Add secrets (5 min)

1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** for each:

**SUPABASE_URL**
```
https://iszksikttmdqgcwpuply.supabase.co
```

**SUPABASE_SERVICE_KEY**
- Go to supabase.com → sign in → pantryfit project
- Settings → API → copy the **service_role** key
- Paste it as the value

---

## STEP 5 — Enable GitHub Pages (2 min)

1. Go to your repo → **Settings** → **Pages** (left sidebar)
2. Under **Source** select **Deploy from a branch**
3. Branch: **gh-pages** / folder: **/ (root)**
4. Click **Save**

---

## STEP 6 — Enable and run Actions (2 min)

1. Click the **Actions** tab in your repo
2. Click **I understand my workflows, enable them**
3. Click **PantryFit Builder** → **Run workflow** → **Run workflow**
4. Wait 3 minutes — green tick = done

---

## STEP 7 — Your app is live

Go to: **https://YOUR_USERNAME.github.io/pantryfit**

Share this link with anyone. They open it in their browser.
On iPhone they can tap **Share → Add to Home Screen** and it installs like an app.
On Android they tap **Menu → Add to Home Screen**.

---

## STEP 8 — Set up FORGE (3 min)

1. Open **forge.html** in Chrome
2. Tap ⚙️ Settings
3. Paste your Claude API key (from console.anthropic.com)
4. Paste your Supabase anon key (from Supabase → Settings → API → anon public)
5. Done — tap Chat and ask Claude anything

---

## WHAT HAPPENS AUTOMATICALLY

Every 6 hours GitHub runs the builder and deploys the next phase.
Each run also republishes your live app with any updates.

Every hour Supabase runs the learning engine, checks expiry dates,
manages grocery lists and sends notifications — without your phone.

---

## YOUR LIVE APP TIMELINE

| Today | Upload files, enable Actions, app is live |
| +6 hours | Phase 1 deployed (database confirmed) |
| +12 hours | Phase 2 (app wired to real login) |
| +18 hours | Phase 3 (Stripe payments) |
| +24 hours | Phase 4 (50 more recipes) |
| +30 hours | Phase 5 (smart ingredient matching) |
| +36 hours | Phase 6 (React Native — future) |
| +42 hours | Phase 7 (admin dashboard) |
| +48 hours | Phase 8 (FORGE upgrade) |
| +54 hours | Phase 9 (PWA install banner) |

By this time tomorrow everything is deployed and your app is fully live.

---

## COSTS

| Service | Cost |
|---------|------|
| GitHub + GitHub Pages | Free |
| Supabase | Free (up to ~1,000 users) |
| Claude API (FORGE) | ~£5-15/month |
| **Total** | **~£5-15/month** |

---

## QUESTIONS?

Open forge.html → Chat → ask Claude anything in plain English.
