import jwt from 'jsonwebtoken';
import request from 'supertest';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../app.js';
import { as, signUp, startDatabase, stopDatabase } from './setup-db.js';

let alice;
let bob;
let mallory;
const ids = {};

function photo() {
  return sharp({ create: { width: 60, height: 60, channels: 3, background: '#24573f' } }).png().toBuffer();
}

beforeAll(async () => {
  await startDatabase();
  alice = await signUp('Alice', 'alice@test.com');
  bob = await signUp('Bob', 'bob@test.com');
  mallory = await signUp('Mallory', 'mallory@test.com');

  const friendship = await as(alice).post('/api/friends/requests', { userId: bob.id });
  await as(bob).post(`/api/friends/requests/${friendship.body.requestId}/accept`);
  const carol = await signUp('Carol', 'carol@test.com');
  ids.requestToAlice = (await as(carol).post('/api/friends/requests', { userId: alice.id })).body.requestId;

  const outing = await as(alice).post('/api/outings', {
    title: 'Private hike',
    activity: 'hike',
    place: { name: 'Bcharre', country: 'Lebanon', lat: 34.25, lon: 36.01 },
    date: '2030-06-01',
  });
  ids.outing = outing.body._id;
  ids.post = (await as(alice).upload('/api/posts', { caption: 'Original caption' }, await photo())).body.id;
  ids.hiddenPost = (await as(alice).upload('/api/posts', { caption: 'Secret' }, await photo())).body.id;
  await as(alice).put(`/api/posts/${ids.hiddenPost}`, { caption: 'Secret', hidden: true });
  ids.comment = (await as(alice).post(`/api/posts/${ids.post}/comments`, { text: 'My own comment' })).body.comment.id;
  ids.story = (await as(alice).upload('/api/stories', { caption: 'Today' }, await photo())).body.id;
  await as(alice).post(`/api/posts/${ids.post}/share`, { friendId: bob.id, note: 'Only for Bob' });
  ids.message = (await as(bob).get('/api/messages')).body[0].id;
}, 120000);

afterAll(async () => {
  await stopDatabase();
});

describe('IDOR matrix: Mallory tries every owner-only action on Alice’s data', () => {
  const attacks = [
    ['read Alice’s outing', () => as(mallory).get(`/api/outings/${ids.outing}`)],
    ['edit Alice’s outing', () => as(mallory).put(`/api/outings/${ids.outing}`, { title: 'Hacked', activity: 'hike', place: { name: 'X', lat: 1, lon: 1 }, date: '2030-01-01' })],
    ['delete Alice’s outing', () => as(mallory).delete(`/api/outings/${ids.outing}`)],
    ['attach Alice’s outing to her own post', async () => as(mallory).upload('/api/posts', { outingId: ids.outing }, await photo())],
    ['edit or hide Alice’s post', () => as(mallory).put(`/api/posts/${ids.post}`, { caption: 'Hacked', hidden: true })],
    ['delete Alice’s post', () => as(mallory).delete(`/api/posts/${ids.post}`)],
    ['read Alice’s hidden post', () => as(mallory).get(`/api/posts/${ids.hiddenPost}`)],
    ['like Alice’s hidden post', () => as(mallory).put(`/api/posts/${ids.hiddenPost}/like`)],
    ['read comments of Alice’s hidden post', () => as(mallory).get(`/api/posts/${ids.hiddenPost}/comments`)],
    ['comment on Alice’s hidden post', () => as(mallory).post(`/api/posts/${ids.hiddenPost}/comments`, { text: 'hi' })],
    ['share Alice’s hidden post', () => as(mallory).post(`/api/posts/${ids.hiddenPost}/share`, { friendId: alice.id })],
    ['delete Alice’s comment', () => as(mallory).delete(`/api/posts/${ids.post}/comments/${ids.comment}`)],
    ['share a post with someone who is not her friend', () => as(mallory).post(`/api/posts/${ids.post}/share`, { friendId: alice.id })],
    ['read the message Alice sent Bob', () => as(mallory).get(`/api/messages/${ids.message}`)],
    ['delete Alice’s story', () => as(mallory).delete(`/api/stories/${ids.story}`)],
    ['accept a friend request sent to Alice', () => as(mallory).post(`/api/friends/requests/${ids.requestToAlice}/accept`)],
    ['decline a friend request sent to Alice', () => as(mallory).delete(`/api/friends/requests/${ids.requestToAlice}`)],
    ['end the friendship of Alice and Bob', () => as(mallory).delete(`/api/friends/${bob.id}`)],
    ['edit Alice’s profile', () => as(mallory).put(`/api/users/${alice.id}`, { name: 'Hacked', bio: '' })],
    ['remove Alice’s profile photo', () => as(mallory).delete(`/api/users/${alice.id}/avatar`)],
  ];

  it.each(attacks)('cannot %s', async (name, attack) => {
    const res = await attack();
    expect([403, 404]).toContain(res.status);
  });

  it('left all of Alice’s data exactly as it was', async () => {
    expect((await as(alice).get(`/api/outings/${ids.outing}`)).body.title).toBe('Private hike');
    const post = await as(alice).get(`/api/posts/${ids.post}`);
    expect(post.body.caption).toBe('Original caption');
    expect(post.body.hidden).toBe(false);
    expect(post.body.likeCount).toBe(0);
    expect((await as(alice).get(`/api/posts/${ids.hiddenPost}`)).body.commentCount).toBe(0);
    expect((await as(alice).get(`/api/posts/${ids.post}/comments`)).body.map(comment => comment.text)).toEqual(['My own comment']);
    expect((await as(alice).get(`/api/stories/user/${alice.id}`)).body).toHaveLength(1);
    expect((await as(alice).get('/api/friends')).body.incoming).toHaveLength(1);
    expect((await as(alice).get(`/api/friends/status/${bob.id}`)).body.status).toBe('friends');
    expect((await as(alice).get('/api/users/me')).body.name).toBe('Alice');
  });
});

describe('logging in is required everywhere, and tokens cannot be forged', () => {
  const routes = [
    ['get', '/api/outings'],
    ['get', '/api/users/me'],
    ['get', '/api/users?q=al'],
    ['get', '/api/friends'],
    ['get', '/api/posts/feed'],
    ['post', '/api/posts'],
    ['get', '/api/messages'],
    ['get', '/api/stories/friends'],
    ['post', '/api/stories'],
  ];

  const badTokens = {
    'no token': null,
    'a token signed with another secret': () => jwt.sign({ sub: alice.id }, 'not-the-secret'),
    'an unsigned token (alg none)': () => jwt.sign({ sub: alice.id }, null, { algorithm: 'none' }),
    'an expired token': () => jwt.sign({ sub: alice.id, exp: Math.floor(Date.now() / 1000) - 60 }, process.env.JWT_SECRET),
  };

  Object.entries(badTokens).forEach(([label, makeToken]) => {
    it.each(routes)(`refuses %s %s with ${label}`, async (method, path) => {
      let req = request(app)[method](path);
      if (makeToken) {
        req = req.set('Authorization', `Bearer ${makeToken()}`);
      }
      expect((await req).status).toBe(401);
    });
  });
});

describe('nothing private leaks', () => {
  it('never sends another user’s email or any password hash', async () => {
    const responses = await Promise.all([
      as(mallory).get(`/api/users/${alice.id}`),
      as(mallory).get('/api/users?q=al'),
      as(bob).get('/api/friends'),
      as(bob).get('/api/posts/feed'),
      as(mallory).get(`/api/posts/user/${alice.id}`),
      as(mallory).get(`/api/posts/${ids.post}/comments`),
      as(bob).get('/api/messages'),
      as(bob).get('/api/stories/friends'),
    ]);
    responses.forEach(res => {
      const text = JSON.stringify(res.body);
      expect(text).not.toContain('alice@test.com');
      expect(text).not.toMatch(/passwordHash|\$2[aby]\$/);
    });
  });

  it('answers a wrong password and an unknown email the same way', async () => {
    const wrong = await request(app).post('/api/auth/login').send({ email: 'alice@test.com', password: 'wrong-password' });
    const unknown = await request(app).post('/api/auth/login').send({ email: 'nobody@test.com', password: 'wrong-password' });
    expect(wrong.status).toBe(401);
    expect(unknown.body).toEqual(wrong.body);
  });
});
