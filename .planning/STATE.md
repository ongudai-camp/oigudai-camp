# Project State

## Current Phase: Phase 5 — Production Launch

### Completed This Phase
- ✅ **AI Chat Integration**: OpenAI (GPT-4o-mini) with tool calling, fallback to rule-based chatbot, admin settings + conversation history
- ✅ **Listing Page Polish**: Category filtering, search refinement, price range filter on all listing pages (tours, hotels, activities)
- ✅ **Supabase Client Setup**: Client, server, and admin Supabase libraries ready; migration SQL generated
- ✅ **API Route Authorization**: All audited API routes check auth() / requireAdmin() / isAdmin()
- ✅ **i18n Migration**: Updated getTranslations() to next-intl v4 signature across 26 pages
- ✅ **Auth Enhancement**: bcrypt password fallback for phone auth + auto sign-in after registration
- ✅ **React Children Error Fix**: Stable keys in BottomNav, HotelWizard, TourWizard, LocationPicker, AdminSidebar
- ✅ **OG Image**: Placeholder generated at public/og-image.png
- ✅ **Dashboard Stats Enhancement**: Animated counters, per-card colors, clickable links, responsive grid in StatsCards
- ✅ **Responsive Polish**: overflow-x-auto on all admin tables, responsive grids throughout
- ✅ **Booking Timeline**: Visual 4-step timeline in booking detail page
- ✅ **Admin Notification**: notifyAdminNewBooking wired to send email via Resend to ADMIN_EMAIL
- ✅ **Supabase Migration**: Prisma schema on postgresql, real Supabase credentials in .env, migrations applied
- ✅ **Rate Limiting**: In-memory rate limiter on register (10/min), send-sms (5/min), verify-sms (10/min)
- ✅ **Security Audit**: AUTH_SECRET is real (not placeholder), no dangerouslySetInnerHTML usage, Prisma prevents SQL injection, rate limiting active
- ✅ **Identity Verification**: Secure document upload with AES-256-GCM metadata encryption, verification status UI in profile dashboard, and dedicated API routes
- ✅ **Wave 4 - Performance & Optimization**: Refactored major components to use `next/image`, optimized Hero LCP, fixed middleware filename to `proxy.ts` according to Next.js 16 rules, and implemented JSON-LD structured data for Hotels and Tours.
- ✅ **Wave 5 - Fixes**: Fixed missing `WishlistButton` imports in 5 files, resolved TypeScript errors, and verified production build success.

### In Progress / Partial
- 🔄 **Wave 5 - Production Launch**: CI/CD automation and final deployment.
- ⚠️ **OAuth Credentials**: VK, Telegram, Yandex, SberID — still placeholder (need real keys from providers)
- ⚠️ **OpenAI Key**: Still placeholder — AI chat won't work without it

### Deferred to Post-Launch
- 🔜 Invoice/receipt generation (5.2)
- 🔜 JSON-LD structured data (5.5) - ✅ Complete
- 🔜 Performance / Lighthouse audit (5.8) - ✅ Partial (Image Opt & LCP done)
- 🔜 CI/CD setup (5.9) - ✅ Complete (GH Actions ready)
- 🔜 Deployment config - ✅ Complete (Dockerfile & Beget scripts ready)

### Known Issues
- OAuth/service credentials are placeholders (VK, Telegram, Yandex, SberID, OpenAI)
- Building blocks for the above are all in place

### Progress Summary
| Wave | Description | Status |
|------|-------------|--------|
| 1 | Auth, i18n, React children, OG image | ✅ Committed |
| 2 | Dashboard, timeline, admin notification | ✅ Committed |
| 3 | Supabase, rate limiting, security | ✅ Complete (pre-existing) |
| 4 | Lighthouse perf, image opt, TS cleanup | ✅ Complete |
| 5 | Deploy config, CI/CD | 🔜 |
