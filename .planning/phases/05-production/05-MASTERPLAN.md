# Phase 5: Production Launch — Masterplan

## Current State
- 29 modified files (i18n param migration + auth.ts refactor)
- Mid-sprint: auth enhancement for bcrypt password fallback in progress
- All Phase 1-4 completed

---

## Wave 1: Land Current Work & Quick Wins (1-2h)

### 1.1 Auth Enhancement (in-progress diff)
- **Files:** `src/lib/auth.ts`, `src/app/[locale]/auth/register/page.tsx`
- **Goal:** Phone auth tries SMS code first, falls back to bcrypt password
- **Status:** Code written, uncommitted

### 1.2 React Children Error Fix
- **Plan:** `.opencode/plans/fix-react-children-error.md`
- **Files:**
  - `src/components/layout/BottomNav.tsx` — filter visibleTabs before .map()
  - `src/components/admin/HotelWizard.tsx` — stable `_key` via useRef for rooms
  - `src/components/admin/TourWizard.tsx` — use `day.day` instead of `index`
  - `src/components/admin/LocationPicker.tsx` — use suggestion string as key
  - `src/components/admin/AdminLayout.tsx` + `AdminSidebarClient` — memoize menuItems

### 1.3 OG Image
- **Files:** `public/og-image.png` — create placeholder OG image
- **Verification:** layout.tsx already references `/og-image.png`

---

## Wave 2: Dashboard & Responsive Polish (3-4h)

### 2.1 Dashboard Stats Enhancement
- **Plan:** `.opencode/plans/dashboard-stats-enhancement.md`
- **Files:**
  - `StatsCards.tsx` — animated counter, per-card colors, clickable links, responsive grid
  - `dashboard/page.tsx` — responsive font sizes, admin grid
  - Admin list pages (hotels, tours, activities, bookings, users, packages) — responsive cards/tables
  - Wizards (HotelWizard, TourWizard, ActivityWizard) — responsive form grids

### 2.2 Booking Timeline UI
- **Files:** `src/app/[locale]/dashboard/bookings/[id]/page.tsx`
- **Goal:** Render booking status timeline (data exists in schema, UI pending)
- **Schema:** Booking has `status` transitions — render as step indicator

### 2.3 Admin Notification Delivery
- **Files:** Find admin notification stub, wire real delivery
- **Goal:** Admins get notified on new booking (email or in-app)

---

## Wave 3: Infrastructure & Security (4-5h)

### 3.1 Supabase Migration
- **Prerequisite:** Real Supabase credentials in `.env`
- **Steps:**
  1. Switch Prisma provider from `sqlite` to `postgresql`
  2. Update `DATABASE_URL` in `.env`
  3. Run `prisma migrate deploy`
  4. Verify data integrity
  5. Update seed script for Postgres

### 3.2 Rate Limiting
- **Files:** Auth routes (signin, register, SMS endpoints)
- **Approach:** Upstash Ratelimit or in-memory Map with TTL
- **Endpoints:**
  - `POST /api/auth/**`
  - SMS verification routes

### 3.3 Security Audit
- **Checklist:**
  - [ ] Rotate AUTH_SECRET from placeholder
  - [ ] Audit all env vars for placeholder values
  - [ ] SQL injection review (Prisma parameterized queries — low risk)
  - [ ] XSS review (React escape by default — verify `dangerouslySetInnerHTML` usage)
  - [ ] CSRF (Next.js built-in — verify SameSite cookies)
  - [ ] Rate limiting on auth routes (from 3.2)

---

## Wave 4: Performance & Polish (3-4h)

### 4.1 Lighthouse Audit
- Run Lighthouse (desktop + mobile)
- Document baseline scores
- Low-hanging fixes: image optimization, lazy loading

### 4.2 Image Optimization
- Replace `<img>` with `next/image` across listing pages
- Add `loading="lazy"`, responsive `sizes`, WebP conversion

### 4.3 TypeScript Cleanup
- Fix `as any` casts, `eslint-disable` comments
- Goal: `next build` produces 0 TS errors

### 4.4 Production Build Test
- `npm run build` — fix all errors
- Test production server locally

---

## Wave 5: Deploy (2-3h)

### 5.1 Deployment Config
- Vercel or custom server (Docker)
- Environment variable setup
- `vercel.json` or Dockerfile

### 5.2 CI/CD
- GitHub Actions for lint + build + test
- Auto-deploy on merge to main

---

## Dependency Graph

```
Wave 1         Wave 2         Wave 3         Wave 4         Wave 5
──────         ──────         ──────         ──────         ──────
Auth ─────► Dashboard    Supabase ─► Lighthouse ─► Deploy
ReactErr    BookingUI    RateLimit   ImageOpt
OG Img      NotifDelivery Security    TS Cleanup
                                      BuildTest
```

- Waves 1-2 can run in parallel
- Wave 3 blocks Wave 4 (no point perf-tuning SQLite)
- Wave 4 blocks Wave 5

---

## Files Changed Summary

| Wave | File | Change |
|------|------|--------|
| 1 | `src/lib/auth.ts` | bcrypt fallback for phone auth |
| 1 | `src/app/[locale]/auth/register/page.tsx` | Register flow adjustments |
| 1 | `src/components/layout/BottomNav.tsx` | Filter nulls in tabs.map |
| 1 | `src/components/admin/HotelWizard.tsx` | Stable _key for rooms via useRef |
| 1 | `src/components/admin/TourWizard.tsx` | day.day instead of index |
| 1 | `src/components/admin/LocationPicker.tsx` | String key instead of index |
| 1 | `src/components/admin/AdminLayout.tsx` | Memoize menuItems |
| 1 | `public/og-image.png` | Create placeholder |
| 2 | `src/components/admin/dashboard/StatsCards.tsx` | Animated counters, colors, links |
| 2 | Admin pages (6 files) | Responsive grids/tables |
| 2 | Wizard files (3 files) | Responsive form grids |
| 2 | `dashboard/bookings/[id]/page.tsx` | Timeline UI |
| 2 | Admin notification stub | Wire delivery |
| 3 | Prisma schema | Switch to postgresql |
| 3 | `.env` | Supabase DATABASE_URL |
| 3 | Auth/SMS API routes | Rate limiting |
| 4 | Various listing pages | next/image, lazy loading |
| 4 | Various TS files | Fix any/disable comments |
