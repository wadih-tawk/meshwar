import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import authRouter from './routes/auth.js';
import outingsRouter from './routes/outings.js';
import usersRouter from './routes/users.js';
import imagesRouter from './routes/images.js';
import friendsRouter from './routes/friends.js';
import postsRouter from './routes/posts.js';
import commentsRouter from './routes/comments.js';
import messagesRouter from './routes/messages.js';
import storiesRouter from './routes/stories.js';
import { requireAuth } from './middleware/requireAuth.js';
import { ipLimiter, loginLimiter } from './middleware/limits.js';

const app = express();

mongoose.set('sanitizeFilter', true);



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
  if (err.name === 'MulterError') {
    const tooBig = err.code === 'LIMIT_FILE_SIZE';
    return res.status(tooBig ? 413 : 400).json({ error: tooBig ? 'Photos must be 5 MB or smaller' : 'Send one photo in the "photo" field' });
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

app.use('/api/images', ipLimiter(15, 2000, 'image requests'), imagesRouter);

app.use('/api', ipLimiter(15, 300, 'requests'));
app.use('/api/auth/login', ipLimiter(15, 50, 'failed logins from this network', true), loginLimiter());

app.use('/api/auth', authRouter);
app.use('/api/outings', requireAuth, outingsRouter);
app.use('/api/users', requireAuth, usersRouter);
app.use('/api/friends', requireAuth, friendsRouter);
app.use('/api/posts', requireAuth, postsRouter);
app.use('/api/posts', requireAuth, commentsRouter);
app.use('/api/messages', requireAuth, messagesRouter);
app.use('/api/stories', requireAuth, storiesRouter);

app.use(notFound);
app.use(handleErrors);

export default app;
