import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, it, expect } from 'vitest';
import app from '../app.js';

const token = jwt.sign({ sub: 'u1' }, process.env.JWT_SECRET);

describe('/api/outings', () => {
  it('rejects a missing token', async () => {
    const res = await request(app).get('/api/outings');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Missing token');
  });

  it('rejects a tampered token', async () => {
    const res = await request(app)
      .get('/api/outings')
      .set('Authorization', `Bearer ${token}x`);
    expect(res.status).toBe(401);
  });

  it('rejects an empty title', async () => {
    const res = await request(app)
      .post('/api/outings')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: ' ' });
    expect(res.status).toBe(400);
  });

  it('rejects a date that is not a real day', async () => {
    const res = await request(app)
      .post('/api/outings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Hike',
        activity: 'hike',
        place: { name: 'Bcharre', country: 'Lebanon', lat: 34.25, lon: 36.01 },
        date: '2026-02-30',
      });
    expect(res.status).toBe(400);
  });
});

describe('/api/auth', () => {
  it('rejects a short password on signup', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'short' });
    expect(res.status).toBe(400);
  });

  it('rejects an operator in the login email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: { $ne: null }, password: 'x' });
    expect(res.status).toBe(400);
  });
});
