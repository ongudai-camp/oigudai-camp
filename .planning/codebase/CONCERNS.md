# Codebase Concerns

## Technical Debt
- **Data Fetching**: Some pages still use Server Components with direct Prisma calls. Transition to TanStack Query ongoing but incomplete for all admin pages.
- **next/image Adoption**: Only 2 usages of `next/image`; most pages use plain `<img>` tags with `eslint-disable-next-line @next/next/no-img-element`.
- **TypeScript Strictness**: Widespread `as any` typecasts and `eslint-disable-next-line @typescript-eslint/no-explicit-any` throughout the codebase.

## Security
- **AUTH_SECRET**: Still the default placeholder — needs rotation before production.
- **Rate Limiting**: Not implemented on any routes — auth endpoints (signin, register, SMS) are vulnerable to brute force.
- **3rd-Party Credentials**: Most OAuth (VK, Telegram, Yandex, Sber), service (OpenAI, SMS.ru, YooKassa, Resend) keys are placeholders.

## Infrastructure
- **Database**: Active on SQLite (`dev.db`). Supabase PostgreSQL code is ready but not yet activated.
- **Deployment**: No Dockerfile, vercel.json, or CI/CD configuration.
- **OG Image**: `/og-image.png` referenced in layout metadata but file does not exist in `public/`.

## Performance
- **Hydration Mismatches**: Known issue caused by browser extensions (HIX.AI). Mitigated via CSS suppression but not fully eliminated.
- **Image Optimization**: Most listing images use native `<img>` — no lazy loading, no responsive sizes, no WebP conversion.
