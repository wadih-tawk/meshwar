import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

function message(what, minutes) {
  return { error: `Too many ${what}. Try again in ${minutes} minutes.` };
}

function emailOf(req) {
  return typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
}

export function userLimiter(minutes, limit, what) {
  return rateLimit({
    windowMs: minutes * 60_000,
    limit,
    keyGenerator: req => req.userId,
    message: message(what, minutes),
  });
}

export function ipLimiter(minutes, limit, what, options = {}) {
  return rateLimit({
    windowMs: minutes * 60_000,
    limit,
    message: message(what, minutes),
    ...options,
  });
}

export function loginLimiters() {
  return [
    ipLimiter(15, 20, 'failed logins from this network', { skipSuccessfulRequests: true }),
    rateLimit({
      windowMs: 15 * 60_000,
      limit: 5,
      skipSuccessfulRequests: true,
      keyGenerator: req => `${ipKeyGenerator(req.ip)}|${emailOf(req)}`,
      message: message('failed logins for this account', 15),
    }),
    rateLimit({
      windowMs: 60 * 60_000,
      limit: 20,
      skipSuccessfulRequests: true,
      keyGenerator: req => `account|${emailOf(req)}`,
      message: message('failed logins for this account', 60),
    }),
  ];
}
