import express from 'express';
import cors from 'cors';

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
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(logger);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use(notFound);
app.use(handleErrors);

export default app;
