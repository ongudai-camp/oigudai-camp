# Plan: Dashboard Stats Enhancement & Responsive Adaptation

## 1. Clarification: Booking Stats Cards (Block 1)

The first HTML block (📋 Всего бронирований / ✅ Подтверждено / ⏳ Ожидают / ₽ Потрачено) is at `src/app/[locale]/dashboard/page.tsx:192-222`. It shows the **logged-in user's personal booking stats**. This is already in the client-facing dashboard (`/dashboard`), NOT in the admin panel (`/admin`).

The user dashboard page is a hybrid page — for **regular users** it shows their personal stats + quick actions; for **admin users** it additionally shows a "Система управления" section with `StatsCards`, `DashboardCharts`, `RecentBookings`. The booking stats cards are correctly placed for clients.

**No changes needed** — this is the client's personal stats section.

---

## 2. Interactive StatsCards with Animated Counters

**File:** `src/components/admin/dashboard/StatsCards.tsx`

### What needs to change:

**a) Add animated number transitions**
- Import `useEffect`, `useRef`, `useState`
- Add a custom `AnimatedCounter` component that interpolates from previous value to new value over ~600ms
- When TanStack Query refetches and a value changes, the counter animates up/down
- Use `requestAnimationFrame` for smooth animation (no extra deps)

**b) Use per-card colors instead of hardcoded `text-sky-600`**
- Currently line 56: `className={\`text-3xl font-bold text-sky-600\`}` ignores the `color` prop
- Fix: map `stat.color` to actual Tailwind color classes (e.g., `sky` → `text-sky-600`, `blue` → `text-blue-600`)

**c) Make cards clickable → navigate to admin sections**
- Wrap each card with a `Link` to its respective admin page:
  - 🏨 Отели → `/admin/hotels`
  - 🗺️ Туры → `/admin/tours`
  - 🎯 Активности → `/admin/activities`
  - 📋 Бронирования → `/admin/bookings`
  - 👥 Пользователи → `/admin/users`

**d) Responsive grid adaptation**
- Current: `grid-cols-1 md:grid-cols-5` — 5 columns on desktop, 1 on mobile
- Change to `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5` — 2 cols on small mobile, 3 on tablet, 5 on desktop

---

## 3. Responsive Adaptation: All Internal Pages & Components

### 3a. Admin Layout (`src/components/admin/AdminLayout.tsx`)
- **Current issue:** Sidebar is `hidden lg:block` — on mobile there's no sidebar at all, only a floating nav
- **Fix needed:** The layout already has `flex` with sidebar + main. Mobile uses `BottomNav.tsx`. The layout is actually OK — the sidebar hides on mobile via `hidden lg:block`. Add a mobile top bar with hamburger to access the admin sidebar via sheet.

### 3b. Admin Pages — Table/Grid Responsiveness

Files that need responsive passes:
- `admin/bookings/page.tsx` — booking table/tablet view
- `admin/hotels/page.tsx` — hotel list cards
- `admin/tours/page.tsx` — tours list
- `admin/activities/page.tsx` — activities list
- `admin/users/page.tsx` — user list
- `admin/packages/page.tsx` — package cards grid (`grid-cols-1 md:grid-cols-3`)

**Pattern fixes:**
- Tables: wrap in `overflow-x-auto`, reduce font/padding on mobile
- Cards grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` patterns
- Ensure all `p-*` padding has responsive variants

### 3c. Dashboard Page (`src/app/[locale]/dashboard/page.tsx`)

**Admin section (lines 225-258):**
- "Система управления" cards grid: change `mb-8` grid to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-5`
- The `DashboardCharts` component already uses `grid-cols-1 lg:grid-cols-2` — good

**Personal stats (lines 192-222):**
- Already `grid-cols-2 md:grid-cols-4` — good
- But font sizes (`text-3xl`) might be too large on mobile → use `text-2xl md:text-3xl`

**Recent bookings table (lines 296-357):**
- Currently desktop layout with booking cards
- On mobile: reduce padding, stack vertically

### 3d. Auth Pages
- `auth/signin/page.tsx`, `auth/register/page.tsx` — check mobile layouts

### 3e. Wizard Components
- `HotelWizard.tsx`, `TourWizard.tsx`, `ActivityWizard.tsx` — multi-step forms
- Ensure progress steps, form fields, and preview work on mobile
- `grid-cols-2 md:grid-cols-4` for room fields → `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`

---

## 4. Summary of Files to Change

| # | File | Changes |
|---|------|---------|
| 1 | `src/components/admin/dashboard/StatsCards.tsx` | Animated counter, per-card colors, clickable links, responsive grid |
| 2 | `src/app/[locale]/dashboard/page.tsx` | Responsive font sizes, responsive admin section grid |
| 3 | `src/app/[locale]/admin/bookings/page.tsx` | Responsive table/list |
| 4 | `src/app/[locale]/admin/hotels/page.tsx` | Responsive card grid |
| 5 | `src/app/[locale]/admin/tours/page.tsx` | Responsive card grid |
| 6 | `src/app/[locale]/admin/activities/page.tsx` | Responsive card grid |
| 7 | `src/app/[locale]/admin/users/page.tsx` | Responsive table/list |
| 8 | `src/app/[locale]/admin/packages/page.tsx` | Responsive card grid (`grid-cols-1 md:grid-cols-3`) |
| 9 | `src/components/admin/HotelWizard.tsx` | Responsive form grids |
| 10 | `src/components/admin/TourWizard.tsx` | Responsive form grids |
| 11 | `src/components/admin/ActivityWizard.tsx` | Responsive form grids |

---

## 5. Questions

1. StatsCards animated counter — should it use a CSS animation library or a lightweight custom hook? (Custom `requestAnimationFrame` approach is simplest, zero-deps.)
2. For admin list pages (hotels/tours/activities/bookings/users) — convert tables to card layout on mobile, or just make tables scrollable?
3. Should the "Система управления" section include a skeleton/animated "pulse" when data refreshes? (Currently shows old data until new arrives.)
