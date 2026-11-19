import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

function message(what, minutes) {
  return { error: `Too many ${what}. Try again in ${minutes} minutes.` };
}

export function userLimiter(minutes, limit, what) {
  return rateLimit({
    windowMs: minutes * 60_000,
    limit,
    keyGenerator: req => req.userId,
    message: message(what, minutes),
  });
}

export function ipLimiter(minutes, limit, what, onlyFailures = false) {
  return rateLimit({
    windowMs: minutes * 60_000,
    limit,
    skipSuccessfulRequests: onlyFailures,
    message: message(what, minutes),
  });
}

export function loginLimiter() {
  return rateLimit({
    windowMs: 15 * 60_000,
    limit: 5,
    skipSuccessfulRequests: true,
    keyGenerator: req => {
      const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
      return `${ipKeyGenerator(req.ip)}|${email}`;
    },
    message: message('login attempts for this account', 15),
  });
}
