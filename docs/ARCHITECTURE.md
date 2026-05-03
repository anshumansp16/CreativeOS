# CreatorOS - Dual Platform Architecture

## Overview

CreatorOS is a unified AI content creation system that runs on two synchronized platforms:

1. **Next.js Web App** (`/dashboard/`) - Browser-based dashboard
2. **Tauri Desktop App** (`/creatoros-app/`) - Native macOS application

Both platforms share the same:
- UI/UX design (macOS native style)
- Data sources (JSON files in `/tools/output/`)
- Python tools for content generation
- Navigation structure and pages

## Quick Start

### Run Next.js Web App
```bash
cd dashboard
npm run dev
# Open http://localhost:3000
```

### Run Tauri Desktop App
```bash
cd creatoros-app
cargo tauri dev
```

## Architecture

```
/creative
├── dashboard/                 # Next.js Web App
│   ├── src/
│   │   ├── app/              # Pages (App Router)
│   │   │   ├── page.tsx      # Dashboard
│   │   │   ├── goals/        # Goals & Roadmap
│   │   │   ├── youtube/      # YouTube Studio
│   │   │   ├── ideas/        # Idea Generator
│   │   │   ├── scripts/      # Script Generator
│   │   │   ├── descriptions/ # Description Generator
│   │   │   ├── analytics/    # Analytics (Coming Soon)
│   │   │   ├── library/      # Library (Coming Soon)
│   │   │   ├── settings/     # Settings
│   │   │   └── api/          # API Routes
│   │   ├── components/       # Shared Components
│   │   └── globals.css       # Global Styles
│   └── package.json
│
├── creatoros-app/            # Tauri Desktop App
│   ├── src/
│   │   ├── index.html        # All UI (single page)
│   │   ├── styles.css        # All Styles
│   │   └── main.js           # All Logic
│   └── src-tauri/
│       └── src/lib.rs        # Rust Backend
│
├── tools/                    # Python CLI Tools
│   ├── idea_generator.py
│   ├── script_generator.py
│   ├── description_generator.py
│   ├── viral_content.py
│   ├── youtube_analytics.py
│   ├── content_calendar.py
│   └── output/               # Generated JSON Data
│
├── shared/                   # Shared Resources
│   ├── types/                # TypeScript Interfaces
│   ├── api/                  # Shared API Client
│   └── data/                 # Shared Data Storage
│
├── .cursor/rules/            # Cursor AI Rules
│   └── creatoros-sync.md
│
└── .claude/                  # Claude AI Rules
    └── rules.md
```

## Design System

Both apps use the macOS native design system:

### Colors
```css
--bg-window: #1e1e1e;
--bg-sidebar: rgba(30, 30, 30, 0.85);
--bg-content: #252525;
--bg-card: #2d2d2d;
--accent: #007AFF;
--red: #FF453A;
--green: #32D74B;
--purple: #BF5AF2;
--orange: #FF9F0A;
```

### Typography
- Font: SF Pro / -apple-system
- Sizes: 10px (caption), 12px (small), 13px (body), 14px (subtitle), 26px (title)

### Components
- Glass cards with blur backdrop
- Rounded corners (6px buttons, 10-12px cards)
- Subtle borders (rgba(255,255,255,0.1))
- Hover states with transform and shadow

## Data Flow

```
User Action
    ↓
┌─────────────────────────────────────┐
│  Next.js API Route  │  Tauri Cmd   │
│  (/api/*)           │  (lib.rs)    │
└─────────────────────────────────────┘
    ↓
Python Tool (/tools/*.py)
    ↓
JSON Output (/tools/output/*.json)
    ↓
┌─────────────────────────────────────┐
│  React Component    │  HTML/JS UI  │
│  (*.tsx)            │  (index.html)│
└─────────────────────────────────────┘
```

## Pages

| Page | Description | Status |
|------|-------------|--------|
| Dashboard | Overview with stats, quick actions, top videos | ✅ Complete |
| Goals & Roadmap | Business goals, metrics, growth stages | ✅ Complete |
| YouTube Studio | Channel stats, videos, viral content, calendar | ✅ Complete |
| Idea Generator | AI-powered video idea generation | ✅ Complete |
| Script Generator | Full Hindi/Hinglish script generation | ✅ Complete |
| Description Generator | SEO-optimized descriptions | ✅ Complete |
| Analytics | Content performance tracking | 🚧 Coming Soon |
| Library | Content storage and management | 🚧 Coming Soon |
| Settings | API keys and preferences | ✅ Complete |

## Synchronization Rules

1. **Every UI change must be applied to both apps**
2. **Use identical color values and spacing**
3. **Keep navigation structure identical**
4. **Share data through JSON files**
5. **Test in both apps before completing**

## Development Guidelines

See:
- `.cursor/rules/creatoros-sync.md` - Cursor AI rules
- `.claude/rules.md` - Claude AI rules

These files ensure AI assistants maintain synchronization between platforms.
