# Roadmap Tracker · $1K → $150K

Evidence-based income roadmap tracker with recalibrated targets, dual-track (tutoring + AI agency) approach, weekly planner, and optional AI advisor.

## Quick Start (Local)

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Deploy to Vercel (Free)

1. Push this repo to GitHub:
   ```bash
   git init
   git add .
   git commit -m "roadmap tracker v4"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/roadmap-tracker.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → "Add New Project" → Import your GitHub repo → Click **Deploy**

3. Your app is live at `https://roadmap-tracker.vercel.app` (or your custom domain)

## AI Features (Optional)

The AI Advisor and AI Auto-Assign features require an Anthropic API key.

1. Get a key at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Click the ⚙️ button in the app's nav bar
3. Paste your key → Save

The key is stored in your browser's `localStorage` only. It is never sent anywhere except directly to Anthropic's API.

**Note:** The Anthropic API requires CORS headers for browser requests. The `anthropic-dangerous-direct-browser-access` header is included, which Anthropic allows for personal/development use. For production, consider setting up a small API proxy (e.g., a Vercel serverless function).

## Data Storage

All data (income logs, task completion, journal entries, planner cards) is stored in your browser's `localStorage`. This means:

- Data persists across sessions in the same browser
- Data does NOT sync across devices
- Clearing browser data will erase your progress

## Tech Stack

- React 18 + Vite
- Recharts (income charts)
- Anthropic Claude API (optional AI features)
- No backend required — fully client-side
