import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth.js';
import outingsRouter from './routes/outings.js';
import { requireAuth } from './middleware/requireAuth.js';

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 300,
  message: { error: 'Too many requests, try again later' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 5,
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts, try again in 15 minutes' },
});

function logger(req, res, next) {
  const time = new Date().toLocaleTimeString();
  console.log(`${time} ${req.ip} ${req.method} ${req.path}`);
  next();
}

function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

function handleErrors(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON in request body' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large' });
  }
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  if (err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkError') {
    console.error('Database unreachable:', err.message);
    return res.status(503).json({ error: 'The database is not reachable right now. Try again in a moment.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

if (process.env.TRUST_PROXY) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY));
}
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(logger);
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', loginLimiter);

app.use('/api/auth', authRouter);
app.use('/api/outings', requireAuth, outingsRouter);

app.use(notFound);
app.use(handleErrors);

export default app;
