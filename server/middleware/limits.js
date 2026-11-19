import rateLimit from 'express-rate-limit';

export function userLimiter(minutes, limit, what) {
  return rateLimit({
    windowMs: minutes * 60_000,
    limit,
    keyGenerator: req => req.userId,
    message: { error: `Too many ${what}. Try again in ${minutes} minutes.` },
  });
}
