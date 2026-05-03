# CreatorOS - Claude Development Rules

## Project Overview

CreatorOS is a dual-platform AI content creation system:
- **Next.js Web App**: `/dashboard/` - React-based web dashboard
- **Tauri Desktop App**: `/creatoros-app/` - Native macOS application

Both apps MUST remain synchronized in UI, data, and functionality.

## Golden Rule

**Every change to one platform MUST be reflected in the other.**

## Architecture

### Data Flow
```
Python Tools (/tools/)
    ↓
JSON Output (/tools/output/)
    ↓
┌─────────────────┬─────────────────┐
│   Next.js API   │   Tauri Rust    │
│   (/api/*)      │   (lib.rs)      │
└─────────────────┴─────────────────┘
    ↓                   ↓
┌─────────────────┬─────────────────┐
│   React UI      │   HTML/JS UI    │
│   (*.tsx)       │   (index.html)  │
└─────────────────┴─────────────────┘
```

### Shared Resources
- `/tools/` - Python CLI tools
- `/tools/output/` - Generated JSON data
- `/shared/types/` - TypeScript interfaces
- `/shared/api/` - Shared API client

## Development Guidelines

### 1. Adding New Features

When adding a new feature:

1. **Create Python Tool** (if needed)
   ```bash
   /tools/new_feature.py
   ```

2. **Add Tauri Command**
   ```rust
   // /creatoros-app/src-tauri/src/lib.rs
   #[tauri::command]
   fn run_new_feature() -> ToolResult { ... }
   ```

3. **Add Next.js API Route**
   ```typescript
   // /dashboard/src/app/api/new-feature/route.ts
   export async function GET() { ... }
   ```

4. **Update Both UIs**
   - Next.js: Create/update page component
   - Tauri: Add HTML section and JS handler

### 2. Styling Rules

Use the macOS design system consistently:

```css
/* Background Colors */
--bg-window: #1e1e1e;
--bg-sidebar: rgba(30, 30, 30, 0.85);
--bg-content: #252525;
--bg-card: #2d2d2d;
--bg-hover: #3a3a3a;
--bg-input: #1a1a1a;

/* Accent Colors */
--accent: #007AFF;
--red: #FF453A;
--green: #32D74B;
--purple: #BF5AF2;
--orange: #FF9F0A;

/* Text Colors */
--text-primary: rgba(255, 255, 255, 0.95);
--text-secondary: rgba(255, 255, 255, 0.55);
--text-tertiary: rgba(255, 255, 255, 0.35);
```

### 3. Component Patterns

| Pattern | Next.js | Tauri |
|---------|---------|-------|
| Page Header | `<header className="mb-7">` | `<header class="page-header">` |
| Stat Card | `<div className="stat-card">` | `<div class="stat-card">` |
| Tool Section | `<div className="tool-section">` | `<div class="tool-section">` |
| Primary Button | `<button className="btn-primary">` | `<button class="primary-btn">` |
| Tab Bar | `<div className="tab-bar">` | `<div class="tab-bar">` |

### 4. Navigation Structure

Both apps must have identical navigation:
1. Dashboard
2. Goals & Roadmap
3. YouTube Studio
4. Idea Generator
5. Script Generator
6. Description Generator
7. --- (divider) ---
8. Analytics
9. Library
10. Settings

## Pre-Commit Checklist

Before completing any task, verify:

- [ ] Feature works in Next.js (`cd dashboard && npm run dev`)
- [ ] Feature works in Tauri (`cd creatoros-app && cargo tauri dev`)
- [ ] UI matches between both platforms
- [ ] Data syncs correctly
- [ ] No TypeScript/Rust compilation errors
- [ ] No console errors in browser/app

## File Reference

### Next.js Key Files
- `/dashboard/src/app/globals.css` - Global styles
- `/dashboard/src/components/Sidebar.tsx` - Navigation
- `/dashboard/src/components/Header.tsx` - Top bar
- `/dashboard/src/app/page.tsx` - Dashboard
- `/dashboard/src/app/*/page.tsx` - Other pages

### Tauri Key Files
- `/creatoros-app/src/styles.css` - All styles
- `/creatoros-app/src/index.html` - All UI
- `/creatoros-app/src/main.js` - All logic
- `/creatoros-app/src-tauri/src/lib.rs` - Rust backend

## Common Tasks

### Update a Page
1. Edit Next.js: `/dashboard/src/app/[page]/page.tsx`
2. Edit Tauri: Find `<div id="page-[name]">` in `index.html`
3. Ensure both have same content structure

### Add API Integration
1. Create Python tool in `/tools/`
2. Add Tauri command in `lib.rs`
3. Add Next.js API route
4. Update both UIs to use the data

### Fix Styling
1. Update CSS in both `globals.css` and `styles.css`
2. Use identical color values
3. Test in both apps
