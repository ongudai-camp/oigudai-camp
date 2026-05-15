# Project State

## Current Phase: Phase 5 — Production Launch

### Completed This Phase
- ✅ **AI Chat Integration**: OpenAI (GPT-4o-mini) with tool calling, fallback to rule-based chatbot, admin settings + conversation history
- ✅ **Listing Page Polish**: Category filtering, search refinement, price range filter on all listing pages (tours, hotels, activities)
- ✅ **Supabase Client Setup**: Client, server, and admin Supabase libraries ready; migration SQL generated
- ✅ **API Route Authorization**: All audited API routes check auth() / requireAdmin() / isAdmin()

### In Progress / Partial
- ⚠️ **Auth Enhancement**: bcrypt password fallback for phone auth (code written, uncommitted)
- ⚠️ **User Booking Dashboard**: List + cancel flows done; timeline UI needs rendering (data exists in schema)
- ⚠️ **Notification System**: Resend-based email for booking confirmation + status change done; admin notification is stub-only
- ⚠️ **SEO & Metadata**: generateMetadata, sitemap, robots.txt done; OG image file missing
- ⚠️ **Security Audit**: AUTH_SECRET still placeholder, no rate limiting, most 3rd-party keys placeholder
- ⚠️ **Supabase Migration**: Client code ready, but SQLite still active — need to switch Prisma provider + DATABASE_URL
- ⚠️ **Dashboard Stats Enhancement**: Planned but not started
- ⚠️ **React Children Error Fix**: Planned but not started
- ⚠️ **Responsive Polish**: Admin pages and wizards need responsive passes

### Deferred to Post-Launch
- 🔜 Invoice/receipt generation (5.2)
- 🔜 JSON-LD structured data (5.5)
- 🔜 Performance / Lighthouse audit (5.8)
- 🔜 CI/CD setup (5.9)
- 🔜 Deployment config

### Known Issues
- Most OAuth/service credentials are placeholders (VK, Telegram, Yandex, OpenAI, SMS.ru, YooKassa, Resend)
- AUTH_SECRET is default placeholder
- No rate limiting on auth routes
- Building blocks for the above are all in place

### Masterplan
- See `.planning/phases/05-production/05-MASTERPLAN.md` for detailed 5-wave execution plan
