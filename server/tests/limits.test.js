import request from 'supertest';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../app.js';
import { as, signUp, startDatabase, stopDatabase } from './setup-db.js';

let alice;
let bob;
let carol;

function login(email, password) {
  return request(app).post('/api/auth/login').send({ email, password });
}

beforeAll(async () => {
  await startDatabase();
  alice = await signUp('Alice', 'alice@test.com');
  bob = await signUp('Bob', 'bob@test.com');
  carol = await signUp('Carol', 'carol@test.com');
}, 120000);

afterAll(async () => {
  await stopDatabase();
});

describe('uploads from one network', () => {
  it('allows 60 per hour in total, even when spread over several accounts', async () => {
    const tiny = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#fff' } }).png().toBuffer();
    for (const user of [alice, bob]) {
      for (let i = 0; i < 30; i += 1) {
        expect((await as(user).upload('/api/posts', {}, tiny)).status).toBe(201);
      }
    }
    const blocked = await as(carol).upload('/api/posts', {}, tiny);
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toMatch(/this network/);
  });
});

describe('logging in', () => {
  it('blocks one account after 5 wrong passwords without locking out the rest of the network', async () => {
    for (let i = 0; i < 5; i += 1) {
      expect((await login('alice@test.com', 'wrong-password')).status).toBe(401);
    }
    expect((await login('alice@test.com', 'password123')).status).toBe(429);
    expect((await login(' ALICE@test.com ', 'wrong-password')).status).toBe(429);
    expect((await login('bob@test.com', 'password123')).status).toBe(200);
  });

  it('caps the failed logins of a whole network, to slow down guessing many accounts', async () => {
    const codes = [];
    for (let i = 0; i < 60 && !codes.includes(429); i += 1) {
      codes.push((await login(`guess${i}@test.com`, 'wrong-password')).status);
    }
    expect(codes.at(-1)).toBe(429);
    expect((await login('bob@test.com', 'password123')).status).toBe(429);
  });
});

describe('signing up', () => {
  it('allows 20 new accounts per hour from one network (3 were made above)', async () => {
    const codes = [];
    for (let i = 0; i < 17; i += 1) {
      codes.push((await request(app).post('/api/auth/signup').send({ name: `User ${i}`, email: `user${i}@test.com`, password: 'password123' })).status);
    }
    expect(codes.every(code => code === 201)).toBe(true);
    const blocked = await request(app).post('/api/auth/signup').send({ name: 'One more', email: 'more@test.com', password: 'password123' });
    expect(blocked.status).toBe(429);
  });
});
