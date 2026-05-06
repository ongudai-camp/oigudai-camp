# Codebase Concerns

## Technical Debt
- **Middleware vs Proxy**: Next.js 16 deprecated middleware.ts. We have moved to src/proxy.ts to support root-level redirects.
- **Data Fetching**: Current admin pages use Server Components with direct Prisma calls. Transition to TanStack Query is required.
- **Image Uploads**: Wizards current use text fields for image paths. Real multi-image upload is missing.

## Performance
- **Hydration Mismatches**: Known issue caused by browser extensions (HIX.AI).
- **Re-renders**: Admin tables need optimization.

## Security
- **Auth Secret**: Needs rotation.
- **Phone Auth**: Pending real API integration.
