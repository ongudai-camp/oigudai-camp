# Ongudai Camp - Project Memo

## Date: 2026-05-05

### Issues Found and Fixed

#### 1. Image Path Issues
**Problem**: Images not loading (404 errors) because paths in `page.tsx` were incorrect.
- Code used: `/images/hotel1.jpg`, `/images/tour1.jpg`
- Actual paths: `/images/hotels/hotel1.jpg`, `/images/tours/tour1.jpg`

**Solution**: Updated `src/app/page.tsx` to use correct image paths.

#### 2. Missing `sizes` Prop for Next.js Image with `fill`
**Problem**: Warning in browser console:
> Image with src "/images/..." has "fill" but is missing "sizes" prop.

**Solution**: Added `sizes` prop to all Image components using `fill`:
```tsx
sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
```

#### 3. Hydration Mismatch Warning
**Problem**: Browser extension (likely HIX.AI) modifying HTML before React loads.
- Extension adds `hix-version` and `hix-id` attributes to `<body>`
- This causes React hydration mismatch warning

**Solution**: This is a client-side issue from browser extensions. Can be ignored or filter out in production.

#### 4. UI/UX Improvements (SaaS UI Master Applied)
**Changes made to `globals.css`**:
- ✅ Changed base background from `#ffffff` to `#f8fafc` (slate-50) per 4-Layer Color System
- ✅ Added `cursor: pointer` to all interactive elements (buttons, cards)
- ✅ Improved card shadows (ultra-faint borders instead of harsh shadows)
- ✅ Added subtle `transform: translateY(-2px)` on card hover for smooth interaction
- ✅ Set proper font-family with Inter as primary
- ✅ Added CSS rule to handle extension-induced hydration issues

### Traveler Theme Analysis
- **Original**: WordPress theme (PHP-based) with many templates
- **Key Templates**: `template-home-modern.php`, `template-hotel-search.php`
- **Assets**: Extensive use of custom fonts (FontAwesome, icomoon, weather icons)
- **Migration**: Converting to Next.js with modern UI/UX

### Design System (SaaS UI Master)
- **Project Type**: Travel booking platform
- **Style**: Modern, adventure-focused
- **Stack**: Next.js with Tailwind CSS
- **Key Improvements Needed**:
  - ✅ Use 4-Layer Color System (avoid pure white backgrounds)
  - ✅ Add SVG icons (Heroicons/Lucide) instead of emojis
  - ✅ Implement proper hover states with transitions
  - ✅ Add `cursor-pointer` to interactive elements
  - ⏳ Navigation consolidation (Account Popover for admin/user links)
  - ⏳ Table row actions in ellipsis menu
  - ⏳ Dark mode contrast (double distance rule)
  - ⏳ **Remotion Integration**: Programmatic video generators for hotels/tours and high-end animated UI elements.

### Next Steps
1. ~~Apply SaaS UI Master design system~~ (partially done)
2. ~~Fix remaining image paths in other pages~~ (done for page.tsx)
3. Improve hero section with better background image handling
4. Add loading states for images
5. Implement proper error boundaries
6. Add SVG icon system (Lucide/Heroicons)
7. Consolidate navigation (Account Popover)
8. Test dark mode with proper contrast ratios
9. **Setup Remotion**: Create foundational video templates for property showcases and interactive marketing elements.
10. **Implement TanStack Query**: Refactor data fetching for better caching and sync across the application.

### Server
- **Port**: 3001 (3000 was occupied)
- **Command**: `npx next dev -p 3001`
- **Status**: Running successfully after fixes

### Congratulations Page (2026-05-11)
- **Added**: `/auth/register/congratulations` page after successful registration
- **Translations**: Added `congratulations` section to ru.json, en.json, kk.json
- **Redirect**: Registration now redirects to congratulations page instead of signin

### Middleware → Proxy (2026-05-11)
- **Renamed**: `src/middleware.ts` → `src/proxy.ts` (Next.js 16 deprecated middleware file convention)
- **Cleared**: `.next` cache to resolve stale module references

### Git History
- `1bdd24a` - Initial commit with fixes (image paths, sizes prop, MEMO)
- `3cfe261` - UI/UX improvements (globals.css updates per SaaS UI Master)
- `f6bf8c0` - Fix hydration error from browser extensions
- `775a103` - Add social login buttons (VK, Telegram, Yandex) to signin page

### Social Login Implementation
- **Signin Page**: Updated with VK, Telegram, Yandex buttons (SVG icons)
- **OAuth Callbacks**: Created `/api/auth/callback/{vk,telegram,yandex}/route.ts`
- **Env Variables**: Added VK_CLIENT_ID, TELEGRAM_BOT_ID, YANDEX_CLIENT_ID
- **Status**: Buttons visible, need real OAuth app credentials for full functionality

### Navbar Improvements (Latest)
- **Sticky Position**: Added `sticky top-0 z-50` for persistent navigation
- **Glass Effect**: Added `backdrop-blur-md bg-white/90` for modern look
- **Better Shadows**: Replaced `shadow-sm` with `shadow-sm border-b border-gray-100`
- **Transitions**: Added `transition-all duration-300` for smooth effects
- **SaaS UI**: All interactive elements have `cursor-pointer`, proper hover states

### Admin Dashboard (Latest)
- **AdminLayout Component**: Created unified sidebar layout for all admin pages
- **Improved Stats Cards**: 5 cards (hotels, tours, activities, bookings, users) with icons
- **HotelWizard**: Step-by-step hotel creation (Info → Rooms → Gallery → Review)
- **Booking Management**: Full booking system with filters, pagination, status badges
- **Updated Pages**: Hotels, Tours, Activities pages with SaaS UI Master styling
- **Server Actions**: Created `createHotelAction` in `src/app/actions/hotel.ts`
- **API Routes**: Added `/api/admin/bookings` for booking management

### Design System Applied
- **Shadows**: `shadow-lg hover:shadow-xl transition-shadow duration-300`
- **Cards**: `rounded-xl` (not rounded-lg)
- **Tables**: `divide-y divide-gray-100`, proper hover states
- **Buttons**: `cursor-pointer transition-colors duration-200`
- **Badges**: `rounded-full` for status badges
- **Background**: Consistent `#f8fafc` (slate-50) across admin pages

### Wizards for Content Creation
- **HotelWizard**: 4 steps (Info → Rooms → Gallery → Review)
- **TourWizard**: 4 steps (Info → Details → Gallery → Review)
- **ActivityWizard**: 4 steps (Info → Details → Gallery → Review)

### Categories System
- **Storage**: Using `PostMeta` model with key "category"
- **Activity Categories**: excursion, rafting, hiking, horseback, fishing, skiing, other
- **API**: `/api/admin/categories` for managing categories

### Completed Features
- ✅ **AdminLayout**: Unified sidebar for all admin pages
- ✅ **Dashboard**: Stats cards with icons (hotels, tours, activities, bookings, users)
- ✅ **HotelWizard**: 4-step hotel creation (Info → Rooms → Gallery → Review)
- ✅ **TourWizard**: 4-step tour creation (Info → Details → Gallery → Review)
- ✅ **ActivityWizard**: 4-step activity creation (Info → Details → Gallery → Review)
- ✅ **Booking Management**: Full system with filters, pagination, status badges
- ✅ **Users Management**: Role-based filtering, pagination
- ✅ **Categories API**: `/api/admin/categories` for managing categories
- ✅ **SaaS UI Master**: All pages follow design system (shadows, transitions, cursor-pointer)

### Phone Authentication & User Dashboard
- ✅ **Phone Registration**: Step-by-step with SMS verification
- ✅ **Phone Signin**: SMS code verification for login
- ✅ **Prisma Schema Updated**: Added `phone`, `phoneVerified` fields to User model
- ✅ **SMS API**: `/api/auth/send-sms` and `/api/auth/verify-sms` routes
- ✅ **Professional Dashboard**: Stats cards, recent bookings, sidebar navigation
- ✅ **Chat System**: Full chat support with ChatInterface component
- ✅ **Chat API**: `/api/chat` GET/POST routes for messaging
- ✅ **User Chat**: `/dashboard/chat` page for users to contact support
- ✅ **Admin Chat**: `/admin/chat` page for admins to reply to users

### Localization (i18n) & Privacy
- ✅ **next-intl**: Installed with 3 locales (ru, en, tr)
- ✅ **Folder Structure**: Moved all pages to `/app/[locale]/` structure
- ✅ **Language Switcher**: `LocaleSwitcher` component in Navbar
- ✅ **Translation Files**: `messages/ru.json`, `en.json`, `tr.json`
- ✅ **Geolocation**: Auto-detect language via `Accept-Language` header + cookie
- ✅ **Privacy Policy**: `/[locale]/privacy-policy` page (RU law compliant)
- ✅ **Registration/Login**: Now requires privacy policy acceptance

### Phase 4 Completed (2026-05-11)
- ✅ **TanStack Query Refactor**: Admin bookings page (`admin/bookings/page.tsx`) — converted from server component with Prisma to client component with `useQuery`/`useMutation`
  - Interactive status/payment status selects per row
  - Loading/error/empty states
  - Auto-refetch on mutation via `invalidateQueries`
- ✅ **Delete Actions**: Created `<DeleteButton>` component with two-step confirmation dialog
  - Integrated into hotels/tours/activities listing pages
  - Calls existing DELETE API endpoints (`/api/admin/{type}/[id]`)
- ✅ **Real SMS Integration**: SMS.ru provider in `src/lib/sms.ts`
  - Falls back to `console.log` in dev (when `SMS_RU_API_KEY` is placeholder)
  - Updates `send-sms/route.ts` to send via SMS.ru API
  - Env var: `SMS_RU_API_KEY`

### Current Status
- **Build**: ✅ Successful (no TypeScript errors)
- **Server**: http://localhost:3001 (needs restart with locale support)
- **Locales**: /ru, /en, /tr prefixes working
- **Pages Migrated**: Home, About, Hotels, Tours, Activities, Auth, Dashboard, Admin, Privacy Policy

### Supabase Migration — Guide

1. Create project at https://supabase.com
2. Go to Project Settings → Database → Connection string (URI format)
3. Copy `postgresql://postgres:xxxx@db.xxxx.supabase.co:5432/postgres`
4. Update `DATABASE_URL` in `.env`
5. Run migration:
   ```bash
   npx prisma migrate dev --name supabase_init
   ```
6. Seed data:
   ```bash
   npx prisma db seed
   ```
7. Verify:
   ```bash
   npx next build
   ```

**Migration file already generated**: `prisma/migrations/20260511_supabase_init/migration.sql`
**Lock file updated**: `migration_lock.toml` → `provider = "postgresql"`

> Note: If you keep using SQLite for local dev, swap the `DATABASE_URL` comments in `.env`.

### Next Steps
1. **Integrate AI bot** for chat support (OpenAI/Gemini API)
2. **Add category filter** to listing pages
3. **Implement frontend booking** system (user-facing)
4. **Test SMS verification** with real SMS service (Twilio, SMS.ru)
5. **Add booking calendar** view for users
6. **Create notification** system (email, push)
7. **Performance/Lighthouse** audit (Phase 5)
8. **Supabase migration** (Phase 5 — ready)
9. **Security audit** (Phase 5)
