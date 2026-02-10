# CLAUDE.md

## Project Overview

AI Detail Page Automation System (AI 상세페이지 자동화 시스템) — a dual-stack platform for browsing AI image generation prompts and generating e-commerce product detail pages. The frontend is a Next.js gallery app; the backend tooling is Python scripts for scraping and translating prompt data.

## Repository Structure

```
ai-detail-page/
├── web/                        # Next.js frontend application
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── layout.tsx      # Root layout (Korean locale, dark mode)
│   │   │   ├── page.tsx        # Home — prompt gallery with search/filter
│   │   │   ├── globals.css     # Tailwind CSS global styles
│   │   │   ├── generator/      # /generator — detail page generator UI
│   │   │   └── prompt/[id]/    # /prompt/:id — prompt detail page
│   │   ├── components/         # React UI components
│   │   ├── lib/                # Utility modules (prompts.ts, firebase.ts)
│   │   ├── types/              # TypeScript interfaces (prompt.ts)
│   │   └── data/               # prompts.json (~1600 prompts)
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── eslint.config.mjs
│   └── postcss.config.mjs
├── data/                       # Raw/intermediate JSON data files
├── scripts/                    # Python data processing utilities
├── 상세페이지.py                # Main Python script (scraping + translation)
├── requirements.txt            # Python dependencies
└── prompts_ko.json             # Korean translation data
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI | React | 19.2.3 |
| Language | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS | 4.x |
| Backend Service | Firebase (Firestore, Storage) | 12.8.0 |
| Data Processing | Python 3 | — |
| AI Translation | Google Gemini API | — |

## Common Commands

All frontend commands run from the `web/` directory:

```bash
cd web

# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint (ESLint with Next.js + TypeScript rules)
npm run lint
```

Python data scripts run from the repository root:

```bash
pip install -r requirements.txt
python 상세페이지.py
```

## Architecture & Key Patterns

### App Router (Next.js 13+)

- Pages live in `web/src/app/` using file-system routing
- Dynamic routes: `web/src/app/prompt/[id]/page.tsx`
- Root layout sets `lang="ko"`, dark mode class, and Noto Sans KR font

### Data Flow

- All prompt data is loaded from a static JSON file (`web/src/data/prompts.json`)
- Data functions in `web/src/lib/prompts.ts` provide filtering, search, and random selection
- No runtime API calls for prompt data — everything is bundled at build time
- Firebase is configured (`web/src/lib/firebase.ts`) but not yet active; planned for future migration

### State Management

- React hooks only (`useState`, `useMemo`) — no external state library
- All pages using client state are marked `"use client"`
- Props-based component communication

### Styling

- Tailwind CSS v4 utility classes throughout
- Dark mode via `dark:` prefix (hardcoded `className="dark"` on `<html>`)
- Primary color: blue (`#0066ff` / blue-600)
- Font: Noto Sans KR with weights 400/500/600/700
- Responsive: mobile-first, grid columns scale from 2 to 5

### Components (`web/src/components/`)

| Component | Purpose |
|-----------|---------|
| `PromptCard.tsx` | Image card with category badge, hover effects |
| `PromptGrid.tsx` | Responsive grid with loading skeleton |
| `CategoryFilter.tsx` | Horizontal category button bar with counts |
| `SearchBar.tsx` | Real-time search input with clear button |
| `ImageUploader.tsx` | Drag-and-drop file upload (max 5 images) |
| `PromptSelector.tsx` | Modal prompt picker with search/filter |

### Type Definitions (`web/src/types/prompt.ts`)

Key interfaces:
- `Prompt` — multilingual prompt data (CN/KO/EN titles, prompts, tags)
- `Category` — category metadata with Korean/English names
- `CATEGORIES` constant — 8 fixed categories: portrait, product, food, fashion, landscape, graphic, character, vehicle

## Code Conventions

- **Language**: TypeScript with strict mode enabled
- **Path aliases**: `@/*` maps to `./src/*` (e.g., `import { Prompt } from "@/types/prompt"`)
- **Comments**: Korean comments for business logic, English for technical docs
- **Imports**: Named imports preferred; absolute paths via `@/` alias
- **Components**: Functional components with arrow functions or `export default function`
- **Formatting**: ESLint with `eslint-config-next/core-web-vitals` and TypeScript rules
- **No testing framework** currently configured

## Environment Variables

Firebase configuration (required for future features, not active yet):

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Prompt gallery — search, category filter, grid |
| `/prompt/[id]` | Prompt detail — image, prompts, tags, related |
| `/generator` | Detail page generator — select prompt, upload images, enter product info |

## Data Pipeline (Python)

1. `상세페이지.py` scrapes prompts from OpenNana API with concurrent requests
2. Gemini API translates Chinese prompts to Korean
3. Output files: `data/prompts_raw.json` -> `data/prompts_categorized.json` -> `web/src/data/prompts.json`

## Known TODOs

- Generator page has placeholder AI generation logic (needs real API integration)
- Firebase integration is scaffolded but not connected
- No test suite — testing framework needs to be added
- Deployment target is likely Vercel (`.vercel` in .gitignore) but not configured
