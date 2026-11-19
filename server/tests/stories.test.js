import request from 'supertest';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../app.js';
import Story from '../models/Story.js';
import Image from '../models/Image.js';
import { as, signUp, startDatabase, stopDatabase } from './setup-db.js';

let alice;
let bob;
let carol;
let story;

function photo() {
  return sharp({ create: { width: 900, height: 1600, channels: 3, background: '#5d7a31' } }).jpeg().toBuffer();
}

beforeAll(async () => {
  await startDatabase();
  alice = await signUp('Alice', 'alice@test.com');
  bob = await signUp('Bob', 'bob@test.com');
  carol = await signUp('Carol', 'carol@test.com');
  const sent = await as(alice).post('/api/friends/requests', { userId: bob.id });
  await as(bob).post(`/api/friends/requests/${sent.body.requestId}/accept`);
}, 120000);

afterAll(async () => {
  await stopDatabase();
});

describe('stories', () => {
  it('lets the database delete stories and their photos by itself after 24 hours', async () => {
    await Story.init();
    await Image.init();
    const storyIndex = (await Story.collection.indexes()).find(index => index.key.expiresAt);
    const imageIndex = (await Image.collection.indexes()).find(index => index.key.expiresAt);
    expect(storyIndex.expireAfterSeconds).toBe(0);
    expect(imageIndex.expireAfterSeconds).toBe(0);
  });

  it('posts a story that expires in 24 hours', async () => {
    const res = await as(bob).upload('/api/stories', { caption: 'Morning in Ehden' }, await photo(), 'story.jpg', 'image/jpeg');
    expect(res.status).toBe(201);
    const hours = (new Date(res.body.expiresAt) - Date.now()) / 3600000;
    expect(hours).toBeGreaterThan(23.9);
    expect(hours).toBeLessThanOrEqual(24);
    const image = await request(app).get(res.body.imageUrl);
    expect(image.status).toBe(200);
    expect((await sharp(image.body).metadata()).height).toBe(1080);
    story = res.body;
  });

  it('refuses non-photos and long captions', async () => {
    const html = Buffer.from('<html><script>alert(1)</script></html>');
    expect((await as(bob).upload('/api/stories', {}, html, 'story.jpg', 'image/jpeg')).status).toBe(400);
    expect((await as(bob).upload('/api/stories', { caption: 'a'.repeat(101) }, await photo(), 'story.jpg', 'image/jpeg')).status).toBe(400);
    expect((await as(bob).upload('/api/stories', { caption: 'no photo' })).status).toBe(400);
  });

  it('shows friends with stories in the story bar, and a ring on the profile', async () => {
    const bar = await as(alice).get('/api/stories/friends');
    expect(bar.body.map(person => [person.name, person.count])).toEqual([['Bob', 1]]);
    expect((await as(carol).get('/api/stories/friends')).body).toEqual([]);
    expect((await as(carol).get(`/api/users/${bob.id}`)).body.hasStory).toBe(true);
    expect((await as(carol).get(`/api/users/${alice.id}`)).body.hasStory).toBe(false);
    const list = await as(carol).get(`/api/stories/user/${bob.id}`);
    expect(list.body.map(item => [item.caption, item.mine])).toEqual([['Morning in Ehden', false]]);
  });

  it('hides a story as soon as it expires, even before the database removes it', async () => {
    const old = await as(bob).upload('/api/stories', { caption: 'yesterday' }, await photo(), 'old.jpg', 'image/jpeg');
    await Story.updateOne({ _id: old.body.id }, { expiresAt: new Date(Date.now() - 1000) });
    const list = await as(alice).get(`/api/stories/user/${bob.id}`);
    expect(list.body.map(item => item.caption)).toEqual(['Morning in Ehden']);
    expect((await as(alice).get('/api/stories/friends')).body[0].count).toBe(1);
  });

  it('lets only the author delete a story, and deletes its photo too', async () => {
    expect((await as(alice).delete(`/api/stories/${story.id}`)).status).toBe(404);
    expect((await as(bob).delete(`/api/stories/${story.id}`)).status).toBe(204);
    expect((await request(app).get(story.imageUrl)).status).toBe(404);
    expect((await as(bob).delete(`/api/stories/${story.id}`)).status).toBe(404);
    expect((await as(carol).get(`/api/users/${bob.id}`)).body.hasStory).toBe(false);
  });
});
