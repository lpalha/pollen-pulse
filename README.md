# Pulse — Pollen Dashboard

Pulse is Pollen's internal operational dashboard. It pulls live data from Metabase and displays it as charts. Anyone on the team can view it — no coding required to read it, and adding new charts is straightforward once the initial setup is done.

**Live URL:** https://pulse-sigma-taupe.vercel.app

---

## What it does

Pulse connects to Pollen's Metabase database (where all your business data lives) and displays the results as charts. Right now it shows one chart — Swaps Weekly Volume Trend — but it's designed so that adding more charts is easy.

---

## How it's set up

### The data source — Metabase

Metabase is the tool where Pollen stores and queries its operational data. It lives at an internal URL and is protected by an API key.

When you open Pulse, here's what happens behind the scenes:
1. Your browser asks Pulse for a chart
2. Pulse (running on Vercel's servers) contacts Metabase using a secret API key
3. Metabase returns the raw data
4. Pulse formats it and draws the chart

The Metabase API key is never exposed to the browser — it only ever lives on the server. This means the dashboard is safe to share publicly.

### The app — Vercel

Pulse is deployed on Vercel, which is a hosting platform. Every time a code change is pushed to GitHub, Vercel automatically rebuilds and redeploys the app within about a minute. No manual deployment steps are needed.

**GitHub repo:** https://github.com/lpalha/pollen-pulse
**Vercel project:** https://vercel.com/pollen-energy/pulse

### Environment variables (secrets)

Three secret values are stored in Vercel's settings (never in the code):

| Variable | What it is |
|---|---|
| `METABASE_BASE_URL` | The address of the Metabase server |
| `METABASE_API_KEY` | The key that lets Pulse read data from Metabase |
| `ANTHROPIC_API_KEY` | The key for Claude AI (used when adding new charts via description) |

These are set once in Vercel and automatically available to every deployment. If a key ever needs to be rotated, update it in Vercel → Project Settings → Environment Variables, then redeploy.

---

## How charts work

Each chart on the dashboard maps to one saved **question** in Metabase. A Metabase question is a query — it's what produces the rows of data behind a chart.

Every chart needs four pieces of information:
- **Metabase question ID** — the number in the Metabase URL, e.g. `/question/64-swaps-weekly` → ID is `64`
- **Title** — what to display above the chart
- **X axis** — which column from the data goes on the horizontal axis (e.g. `Week`)
- **Y axis** — which column(s) go on the vertical axis (e.g. `Completed Swaps`)

### Current charts

| Chart | Metabase Question ID | X axis | Y axis |
|---|---|---|---|
| Swaps — Weekly Volume Trend | 64 | Week | Completed Swaps |

---

## How to add a new chart

### Step 1 — Create the query in Metabase

1. Open Metabase and write (or find) the question you want to visualise
2. Save it and note the number in the URL — e.g. `/question/91-revenue-by-week` → ID is `91`
3. Check what the column names are (exactly as they appear in the results table)

### Step 2 — Add it to Pulse

Open `app/page.tsx` in the GitHub repo and add a new `<ChartCard />` block inside the chart grid, like this:

```tsx
<ChartCard
  metabaseQuestionId={91}
  title="Revenue — Weekly Trend"
  xKey="Week"
  yKeys={["Revenue"]}
  color="#AACC00"
/>
```

That's it. Push the change to GitHub and Vercel deploys it automatically.

### Chart types currently supported
- `AreaChart` — a filled area chart, good for showing trends over time

More chart types (bar, line, donut) can be added to `ChartCard.tsx` in a future session.

---

## Local development (for developers)

If you need to run Pulse locally:

```bash
# Clone the repo
git clone https://github.com/lpalha/pollen-pulse.git
cd pollen-pulse

# Install dependencies
npm install --legacy-peer-deps

# Create a local secrets file (never commit this)
cp .env.local.example .env.local
# Fill in the values from Vercel → Project Settings → Environment Variables

# Run locally
npm run dev
# Open http://localhost:3000
```

### Key files

| File | What it does |
|---|---|
| `app/page.tsx` | The dashboard — this is where charts are added |
| `app/components/ChartCard.tsx` | The chart component — handles fetching, transforming, and rendering |
| `app/api/metabase/[id]/route.ts` | The server route that talks to Metabase (keeps the API key secret) |
| `public/fonts/Avantt-Regular.otf` | Pollen brand font |
| `.env.local` | Local secrets (gitignored — never committed) |

---

## Tech stack (plain English)

| Tool | What it is |
|---|---|
| Next.js | The framework the app is built on — handles routing, server logic, and the frontend |
| React | The library used to build UI components |
| Recharts | The charting library used to draw the charts |
| Tremor | UI component library (used for card styling) |
| Tailwind CSS | A utility library for styling |
| Vercel | Hosting — automatically deploys on every push to `main` |
| GitHub | Where the code lives — `lpalha/pollen-pulse` |
| Metabase | Pollen's data tool — Pulse reads from it via API |

---

## Handoff notes

- The app is intentionally simple. Adding charts is just adding a `<ChartCard />` line in `page.tsx`.
- Metabase is the source of truth for data — all queries live there. Pulse just displays them.
- The Anthropic API key is plumbed in for a future "describe a chart in plain English" feature — not yet active.
- A sidebar navigation is planned but not yet built — it will be added when there are enough distinct pages to warrant it.
