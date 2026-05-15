const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
}): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const entry = rateMap.get(opts.key);

  if (!entry || entry.resetAt < now) {
    rateMap.set(opts.key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, remaining: opts.limit - 1, resetInMs: opts.windowMs };
  }

  if (entry.count >= opts.limit) {
    return { allowed: false, remaining: 0, resetInMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, remaining: opts.limit - entry.count, resetInMs: entry.resetAt - now };
}
