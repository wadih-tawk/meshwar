import request from 'supertest';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../app.js';
import { as, signUp, startDatabase, stopDatabase } from './setup-db.js';

let alice;
let bob;
let carol;
let bobPost;

function photo(width = 1600, height = 1200) {
  return sharp({ create: { width, height, channels: 3, background: '#35648c' } }).png().toBuffer();
}

async function makeFriends(a, b) {
  const sent = await as(a).post('/api/friends/requests', { userId: b.id });
  await as(b).post(`/api/friends/requests/${sent.body.requestId}/accept`);
}

beforeAll(async () => {
  await startDatabase();
  alice = await signUp('Alice', 'alice@test.com');
  bob = await signUp('Bob', 'bob@test.com');
  carol = await signUp('Carol', 'carol@test.com');
  await makeFriends(alice, bob);
}, 120000);

afterAll(async () => {
  await stopDatabase();
});

describe('creating posts', () => {
  it('posts a photo with a caption and serves it as a JPEG of at most 1080 px', async () => {
    const res = await as(bob).upload('/api/posts', { caption: 'Sunset in Batroun' }, await photo());
    expect(res.status).toBe(201);
    expect(res.body.caption).toBe('Sunset in Batroun');
    expect(res.body.author.name).toBe('Bob');
    expect(res.body.mine).toBe(true);
    const image = await request(app).get(res.body.imageUrl);
    expect(image.headers['content-type']).toBe('image/jpeg');
    const meta = await sharp(image.body).metadata();
    expect(meta.width).toBe(1080);
    expect(meta.height).toBe(810);
    bobPost = res.body;
  });

  it('needs a real photo and a short caption', async () => {
    expect((await as(bob).upload('/api/posts', { caption: 'no photo' })).status).toBe(400);
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>');
    expect((await as(bob).upload('/api/posts', {}, svg, 'x.png', 'image/png')).status).toBe(400);
    expect((await as(bob).upload('/api/posts', { caption: 'a'.repeat(501) }, await photo(50, 50))).status).toBe(400);
  });

  it('stores line breaks the same way whether the caption came from a form or JSON', async () => {
    const text = 'line one\r\n' + 'a'.repeat(491);
    const res = await as(carol).upload('/api/posts', { caption: text }, await photo(50, 50));
    expect(res.status).toBe(201);
    expect(res.body.caption).toBe('line one\n' + 'a'.repeat(491));
    await as(carol).delete(`/api/posts/${res.body.id}`);
  });

  it('keeps HTML in a caption as plain text', async () => {
    const res = await as(carol).upload('/api/posts', { caption: '<img src=x onerror=alert(1)>' }, await photo(50, 50));
    expect(res.status).toBe(201);
    expect(res.body.caption).toBe('<img src=x onerror=alert(1)>');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('attaches one of my own outings, but never somebody else’s', async () => {
    const outing = await as(alice).post('/api/outings', {
      title: 'Secret hike',
      activity: 'hike',
      place: { name: 'Bcharre', country: 'Lebanon', lat: 34.25, lon: 36.01 },
      date: '2030-06-01',
    });
    const stolen = await as(bob).upload('/api/posts', { outingId: outing.body._id }, await photo(50, 50));
    expect(stolen.status).toBe(404);
    expect(JSON.stringify(stolen.body)).not.toContain('Secret hike');
    const own = await as(alice).upload('/api/posts', { caption: 'Qadisha!', outingId: outing.body._id }, await photo(50, 50));
    expect(own.status).toBe(201);
    expect(own.body.outing).toEqual({ title: 'Secret hike', place: 'Bcharre', activity: 'hike' });
  });
});

describe('the feed', () => {
  it('shows me and my friends first, then everyone else', async () => {
    const feed = await as(alice).get('/api/posts/feed');
    expect(feed.body.friends.map(post => post.author.name).sort()).toEqual(['Alice', 'Bob']);
    expect(feed.body.others.map(post => post.author.name)).toEqual(['Carol']);
    const strangerFeed = await as(carol).get('/api/posts/feed');
    expect(strangerFeed.body.friends.map(post => post.author.name)).toEqual(['Carol']);
    expect(strangerFeed.body.others).toHaveLength(2);
  });
});

describe('only the author can change a post', () => {
  it('refuses edits and deletes from other users, and keeps the post as it was', async () => {
    expect((await as(alice).put(`/api/posts/${bobPost.id}`, { caption: 'hacked', hidden: true })).status).toBe(404);
    expect((await as(alice).delete(`/api/posts/${bobPost.id}`)).status).toBe(404);
    const post = await as(bob).get(`/api/posts/${bobPost.id}`);
    expect(post.body.caption).toBe('Sunset in Batroun');
    expect(post.body.hidden).toBe(false);
  });

  it('lets the author edit the caption and ignores other fields', async () => {
    const res = await as(bob).put(`/api/posts/${bobPost.id}`, { caption: 'Sunset in Batroun 🌅', hidden: false, author: alice.id, image: alice.id });
    expect(res.status).toBe(200);
    expect(res.body.caption).toBe('Sunset in Batroun 🌅');
    expect(res.body.author.name).toBe('Bob');
    expect((await request(app).get(res.body.imageUrl)).status).toBe(200);
  });

  it('hides a post from everybody except its author', async () => {
    expect((await as(bob).put(`/api/posts/${bobPost.id}`, { caption: 'Sunset', hidden: true })).body.hidden).toBe(true);
    expect((await as(alice).get(`/api/posts/${bobPost.id}`)).status).toBe(404);
    expect((await as(alice).get(`/api/posts/user/${bob.id}`)).body).toEqual([]);
    expect((await as(alice).get('/api/posts/feed')).body.friends.map(post => post.author.name)).toEqual(['Alice']);
    const mine = await as(bob).get(`/api/posts/user/${bob.id}`);
    expect(mine.body).toHaveLength(1);
    expect(mine.body[0].hidden).toBe(true);
    await as(bob).put(`/api/posts/${bobPost.id}`, { caption: 'Sunset', hidden: false });
    expect((await as(alice).get(`/api/posts/user/${bob.id}`)).body).toHaveLength(1);
  });

  it('deletes the post and its photo once, even when asked many times at once', async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => as(bob).delete(`/api/posts/${bobPost.id}`)));
    expect(results.map(res => res.status).sort()).toEqual([204, 404, 404, 404, 404]);
    expect((await request(app).get(bobPost.imageUrl)).status).toBe(404);
    expect((await as(bob).get(`/api/posts/${bobPost.id}`)).status).toBe(404);
  });

  it('rejects bad ids', async () => {
    expect((await as(bob).get('/api/posts/abc')).status).toBe(400);
    expect((await as(bob).get('/api/posts/user/abc')).status).toBe(400);
  });
});
