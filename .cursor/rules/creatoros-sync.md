# CreatorOS Dual-Platform Synchronization Rules

## Architecture Overview

CreatorOS runs on TWO platforms that MUST stay synchronized:
1. **Next.js Web App** (`/dashboard/`) - Browser-based dashboard
2. **Tauri Desktop App** (`/creatoros-app/`) - Native macOS application

## Critical Synchronization Requirements

### 1. UI/UX Parity
Both applications use the **same macOS-native design system**:
- Colors: Use CSS variables from `--bg-*`, `--accent`, `--text-*`
- Typography: SF Pro / -apple-system font stack
- Components: Glass cards, stat cards, metric cards, tab bars
- Spacing: Consistent padding (12px, 16px, 20px)
- Border radius: 6px (buttons), 10px (cards), 12px (sections)

### 2. Shared Data Layer
All data is stored in `/tools/output/` and `/shared/data/`:
- `youtube_analytics.json` - Channel stats and videos
- `content_calendar.json` - 30-day content plan
- `viral_*.json` - Viral content suggestions
- `ideas_*.json` - Generated ideas
- `scripts_*.json` - Generated scripts

### 3. API Endpoints (Next.js)
```
/api/youtube  → Serves youtube_analytics.json
/api/calendar → Serves content_calendar.json
/api/viral    → Serves viral content data
```

### 4. Tauri Commands (Desktop)
```rust
run_idea_generator()
run_script_generator()
run_description_generator()
run_viral_content()
run_youtube_analytics()
run_content_calendar()
load_json_data()
save_json_data()
```

## When Making Changes

### Adding a New Page
1. Create in Next.js: `/dashboard/src/app/[page]/page.tsx`
2. Create in Tauri: Add `<div id="page-[name]">` in `index.html`
3. Add navigation in both:
   - Next.js: Update `Sidebar.tsx`
   - Tauri: Add `<button class="nav-item">` in `index.html`
4. Add to both nav arrays

### Adding a New Feature
1. Create Python tool in `/tools/`
2. Add Tauri command in `lib.rs`
3. Add Next.js API route in `/dashboard/src/app/api/`
4. Update UI in both apps

### Styling Changes
1. Update CSS variables in BOTH:
   - Next.js: `/dashboard/src/app/globals.css`
   - Tauri: `/creatoros-app/src/styles.css`
2. Keep color values identical
3. Use same class naming conventions

## File Mapping

| Next.js | Tauri |
|---------|-------|
| `globals.css` | `styles.css` |
| `Sidebar.tsx` | `index.html` (sidebar section) |
| `Header.tsx` | `index.html` (header section) |
| `page.tsx` | `index.html` (page sections) |
| `layout.tsx` | `index.html` (app wrapper) |
| API routes | `lib.rs` commands |

## Testing Checklist

Before completing any task:
- [ ] Changes work in Next.js (`npm run dev`)
- [ ] Changes work in Tauri (`cargo tauri dev`)
- [ ] Data syncs between both apps
- [ ] UI looks identical in both apps
- [ ] No console errors in either app

## Color Reference (macOS System Colors)

```css
--accent: #007AFF;      /* Blue */
--green: #32D74B;       /* Green */
--orange: #FF9F0A;      /* Orange */
--red: #FF453A;         /* Red */
--purple: #BF5AF2;      /* Purple */
--teal: #64D2FF;        /* Teal */
--pink: #FF375F;        /* Pink */
--indigo: #5E5CE6;      /* Indigo */
--cyan: #5AC8FA;        /* Cyan */
```

## Component Mapping

| Component | Next.js Class | Tauri Class |
|-----------|---------------|-------------|
| Card | `glass-card` | `stat-card`, `section-card` |
| Button Primary | `btn-primary` | `primary-btn` |
| Button Secondary | `btn-secondary` | `secondary-btn` |
| Input | `input-macos` | `tool-section input` |
| Tab | `tab-btn` | `tab-btn` |
| Progress | `progress-bar` | `stat-progress` |
