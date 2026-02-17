# ScoreStream Settlement Layer Dashboard

## Overview
Dark-themed Next.js dashboard querying the ScoreStream API for amateur sports scores, displaying confidence grades and settlement readiness for future blockchain publishing (Phase 2).

## Tech Stack
- Next.js 15 (App Router), TypeScript, Tailwind CSS
- No database — all data fetched live from ScoreStream API
- Deployed on Vercel (`scorestream-dashboard.vercel.app`)
- GitHub: `brikmaster/scorestream-dashboard` (auto-deploys on push to main)

## Project Structure
```
src/
├── app/
│   ├── page.tsx              # Main dashboard (client component, orchestrates everything)
│   ├── layout.tsx            # Dark theme layout with Geist Mono font
│   ├── globals.css           # Tailwind + dark scrollbar/date picker styles
│   └── api/games/route.ts    # API proxy to ScoreStream (hides API key)
├── components/
│   ├── SearchForm.tsx        # State/date/sport/squad filters
│   ├── GamesTable.tsx        # Sortable table with all game data
│   ├── ConfidenceBar.tsx     # Color-coded 0-100 bar
│   ├── ConfidenceStats.tsx   # Summary stats + distribution chart
│   ├── GameDetailModal.tsx   # Score submissions detail view
│   └── SettlementBadge.tsx   # Verified/Provisional/Unverified/No Data pill
└── lib/
    ├── types.ts              # Game, Team, Squad, GameScore types + settlement tiers
    └── scorestream.ts        # US states, sports, squads, date helpers, team map builder
```

## Development
```bash
npm install
npm run dev        # http://localhost:3000
npm run build
```

## Environment Variables
- `SCORESTREAM_API_KEY` — required, set in `.env.local` locally and in Vercel dashboard for production

## ScoreStream API — CRITICAL NOTES
The API is **JSON-RPC over POST**, NOT REST:
- **URL**: `POST https://scorestream.com/api/`
- **Body**: `{"jsonrpc":"2.0","method":"games.search","params":{...},"id":1}`
- Method name goes in the JSON body `method` field, NOT in the URL path
- The spec/docs say `GET /api/games.search` but that returns 404
- Array params (`organizationIds`, `sportNames`, `squadIds`) are native JSON arrays in the body, not JSON-encoded strings

### Key API Field Gotchas
- Game date field is `startDateTime` (not `dateTime`)
- DateTime format is `"2026-02-15 20:00:48"` (space-separated) — must replace space with `T` for JS `new Date()` parsing
- `gameSegmentId: 19999` = Final, `10010` = scheduled/in-progress
- `confidenceGrade: 2` = no score data (not a real confidence score)
- `sourceConfidenceLevel: 80` = baseline; `confidenceGrade` is the derived/adjusted value

### Settlement Tiers
- **Verified** (green): confidence ≥ 80
- **Provisional** (amber): confidence 50-79
- **Unverified** (red): confidence < 50
- **No Data** (gray): confidence = 2 or null

## Deployment
- `vercel --prod` to deploy manually
- Push to `main` branch auto-deploys via Vercel GitHub integration
- Use `printf` (not `echo`) when piping env vars to `vercel env add`
