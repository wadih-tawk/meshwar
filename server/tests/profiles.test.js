import crypto from 'node:crypto';
import request from 'supertest';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../app.js';
import Image from '../models/Image.js';
import { signUp, startDatabase, stopDatabase } from './setup-db.js';

let alice;
let bob;

async function png() {
  return sharp({ create: { width: 600, height: 400, channels: 3, background: '#2e6b4a' } }).png().toBuffer();
}

async function jpegWithPhpComment() {
  const jpeg = await sharp({ create: { width: 300, height: 300, channels: 3, background: '#8a5a36' } }).jpeg().toBuffer();
  const php = Buffer.from('<?php system($_GET["cmd"]); ?>');
  const length = php.length + 2;
  const comment = Buffer.concat([Buffer.from([0xff, 0xfe, length >> 8, length & 0xff]), php]);
  return Buffer.concat([jpeg.subarray(0, 2), comment, jpeg.subarray(2)]);
}

function upload(token, buffer, filename, contentType) {
  return request(app).put('/api/users/me/avatar').set('Authorization', `Bearer ${token}`).attach('photo', buffer, { filename, contentType });
}

beforeAll(async () => {
  await startDatabase();
  alice = await signUp('Alice', 'alice@test.com');
  bob = await signUp('Bob', 'bob@test.com');
}, 120000);

afterAll(async () => {
  await stopDatabase();
});

describe('profiles', () => {
  it('needs a token', async () => {
    expect((await request(app).get('/api/users/me')).status).toBe(401);
  });

  it('shows my own email, but not the email of other users', async () => {
    const me = await request(app).get('/api/users/me').set('Authorization', `Bearer ${alice.token}`);
    expect(me.body.email).toBe('alice@test.com');
    const other = await request(app).get(`/api/users/${bob.id}`).set('Authorization', `Bearer ${alice.token}`);
    expect(other.status).toBe(200);
    expect(other.body.name).toBe('Bob');
    expect(other.body.email).toBeUndefined();
  });

  it('lets me change my own name and bio, and ignores other fields', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ name: 'Alice K', bio: 'I love hikes <b>and</b> beaches', email: 'hacker@test.com', passwordHash: 'x', avatarId: bob.id });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Alice K');
    expect(res.body.bio).toBe('I love hikes <b>and</b> beaches');
    expect(res.body.email).toBe('alice@test.com');
    expect(res.body.passwordHash).toBeUndefined();
    expect(res.body.avatarUrl).toBe(null);
  });

  it('refuses names with invisible or direction-changing characters', async () => {
    for (const name of ['alice\u202e', 'al\u200bice', 'bob\u0085']) {
      const res = await request(app).put('/api/users/me').set('Authorization', `Bearer ${alice.token}`).send({ name, bio: '' });
      expect(res.status, JSON.stringify(name)).toBe(400);
    }
  });

  it('refuses HTML in a name and a bio longer than 300 characters', async () => {
    const bad = await request(app).put('/api/users/me').set('Authorization', `Bearer ${alice.token}`).send({ name: '<script>alert(1)</script>', bio: '' });
    expect(bad.status).toBe(400);
    const long = await request(app).put('/api/users/me').set('Authorization', `Bearer ${alice.token}`).send({ name: 'Alice', bio: 'a'.repeat(301) });
    expect(long.status).toBe(400);
  });

  it('has no route to edit another user', async () => {
    const res = await request(app).put(`/api/users/${bob.id}`).set('Authorization', `Bearer ${alice.token}`).send({ name: 'Hacked', bio: '' });
    expect(res.status).toBe(404);
    const avatar = await request(app).delete(`/api/users/${bob.id}/avatar`).set('Authorization', `Bearer ${alice.token}`);
    expect(avatar.status).toBe(404);
  });

  it('searches names safely, treating special characters as text', async () => {
    const found = await request(app).get('/api/users?q=bo').set('Authorization', `Bearer ${alice.token}`);
    expect(found.body.map(user => user.name)).toContain('Bob');
    const regex = await request(app).get('/api/users?q=.*').set('Authorization', `Bearer ${alice.token}`);
    expect(regex.status).toBe(200);
    expect(regex.body).toEqual([]);
    expect((await request(app).get('/api/users?q=a').set('Authorization', `Bearer ${alice.token}`)).status).toBe(400);
  });
});

describe('photo uploads', () => {
  it('accepts a real photo and serves it back as a small JPEG with safe headers', async () => {
    const res = await upload(bob.token, await png(), 'me.png', 'image/png');
    expect(res.status).toBe(200);
    expect(res.body.avatarUrl).toMatch(/^\/api\/images\/[a-f0-9]{24}\?expires=\d+&sig=[a-f0-9]{64}$/);
    const image = await request(app).get(res.body.avatarUrl);
    expect(image.status).toBe(200);
    expect(image.headers['content-type']).toBe('image/jpeg');
    expect(image.headers['x-content-type-options']).toBe('nosniff');
    expect(image.body.subarray(0, 2)).toEqual(Buffer.from([0xff, 0xd8]));
    const meta = await sharp(image.body).metadata();
    expect(meta.width).toBe(400);
    expect(meta.height).toBe(400);
  });

  it('removes PHP code hidden inside a real JPEG', async () => {
    const evil = await jpegWithPhpComment();
    expect(evil.includes('<?php')).toBe(true);
    const res = await upload(bob.token, evil, 'holiday.jpg', 'image/jpeg');
    expect(res.status).toBe(200);
    const image = await request(app).get(res.body.avatarUrl);
    expect(image.body.includes('<?php')).toBe(false);
  });

  it('refuses files that are not real photos, whatever their name or type says', async () => {
    const php = Buffer.from('<?php system($_GET["cmd"]); ?>');
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><circle r="10"/></svg>');
    const gif = await sharp({ create: { width: 20, height: 20, channels: 3, background: '#000' } }).gif().toBuffer();
    const cases = [
      [php, 'shell.jpg', 'image/jpeg'],
      [await png(), 'shell.php', 'image/jpeg'],
      [await png(), 'photo.png', 'application/x-php'],
      [php, 'photo.php.jpg', 'image/jpeg'],
      [svg, 'drawing.svg', 'image/svg+xml'],
      [svg, 'drawing.png', 'image/png'],
      [gif, 'moving.png', 'image/png'],
    ];
    for (const [buffer, filename, contentType] of cases) {
      const res = await upload(bob.token, buffer, filename, contentType);
      expect(res.status, `${filename} as ${contentType}`).toBe(400);
    }
  });

  it('answers a broken upload with 400, not a server error', async () => {
    const cut = await request(app)
      .put('/api/users/me/avatar')
      .set('Authorization', `Bearer ${bob.token}`)
      .set('Content-Type', 'multipart/form-data; boundary=XYZ')
      .send('--XYZ\r\nContent-Disposition: form-data; name="photo"; filename="a.png"\r\nContent-Type: image/png\r\n\r\nabc');
    expect(cut.status).toBe(400);
    const noBoundary = await request(app).put('/api/users/me/avatar').set('Authorization', `Bearer ${bob.token}`).set('Content-Type', 'multipart/form-data').send('x');
    expect(noBoundary.status).toBe(400);
  });

  it('stops a user who already keeps 100 photos', async () => {
    const hoarder = await signUp('Hoarder', 'hoarder@test.com');
    const photos = Array.from({ length: 100 }, () => ({ ownerId: hoarder.id, purpose: 'post', data: Buffer.from('x') }));
    await Image.insertMany(photos);
    const res = await upload(hoarder.token, await png(), 'one-more.png', 'image/png');
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/100 photos/);
  });

  it('refuses photos bigger than 5 MB', async () => {
    const res = await upload(bob.token, Buffer.alloc(5 * 1024 * 1024 + 1), 'big.jpg', 'image/jpeg');
    expect(res.status).toBe(413);
  });

  it('never stores or echoes the file name', async () => {
    const res = await upload(bob.token, await png(), '"><img src=x onerror=alert(1)>.png', 'image/png');
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain('onerror');
  });

  it('refuses image links that were changed, swapped or have expired', async () => {
    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${bob.token}`);
    const url = new URL(res.body.avatarUrl, 'http://test');
    const id = url.pathname.split('/').pop();
    const sig = url.searchParams.get('sig');
    const expires = url.searchParams.get('expires');
    const changedSig = `${sig.slice(0, -1)}${sig.endsWith('0') ? '1' : '0'}`;
    expect((await request(app).get(`/api/images/${id}?expires=${expires}&sig=${changedSig}`)).status).toBe(403);
    expect((await request(app).get(`/api/images/${alice.id}?expires=${expires}&sig=${sig}`)).status).toBe(403);
    expect((await request(app).get(`/api/images/${id}`)).status).toBe(403);
    const past = String(Math.floor(Date.now() / 1000) - 60);
    const oldSig = crypto.createHmac('sha256', process.env.JWT_SECRET).update(`image:${id}.${past}`).digest('hex');
    expect((await request(app).get(`/api/images/${id}?expires=${past}&sig=${oldSig}`)).status).toBe(403);
  });

  it('keeps only the latest profile photo', async () => {
    const first = await upload(alice.token, await png(), 'a.png', 'image/png');
    const second = await upload(alice.token, await png(), 'b.png', 'image/png');
    expect((await request(app).get(first.body.avatarUrl)).status).toBe(404);
    expect((await request(app).get(second.body.avatarUrl)).status).toBe(200);
  });
});
