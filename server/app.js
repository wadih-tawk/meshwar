import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import outingsRouter from './routes/outings.js';
import { requireAuth } from './middleware/requireAuth.js';

const app = express();

function logger(req, res, next) {
  const time = new Date().toLocaleTimeString();
  console.log(`${time} ${req.method} ${req.path}`);
  next();
}

function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

function handleErrors(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON in request body' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(logger);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api/outings', requireAuth, outingsRouter);

app.use(notFound);
app.use(handleErrors);

export default app;
