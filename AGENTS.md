<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Next.js 16 Specifics

- **Middleware is named `proxy.ts`**, NOT `middleware.ts`. Next.js 16 deprecated the `middleware.ts` convention in favor of `proxy.ts`. Using `middleware.ts` emits a deprecation warning.
- Export signature: `export default async function proxy(request: NextRequest)` with `export const config = { matcher: [...] }` block at bottom of file.
- Matcher must exclude `_next`, static files, and API routes to avoid unnecessary middleware execution.
- Middleware file lives in `src/` root (not `src/app/`).
<!-- END:nextjs-agent-rules -->
