import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../app.js';
import { signUp, startDatabase, stopDatabase } from './setup-db.js';

let alice;
let bob;
let carol;
let dan;

function as(user) {
  return {
    get: path => request(app).get(path).set('Authorization', `Bearer ${user.token}`),
    post: (path, body) => request(app).post(path).set('Authorization', `Bearer ${user.token}`).send(body),
    delete: path => request(app).delete(path).set('Authorization', `Bearer ${user.token}`),
  };
}

beforeAll(async () => {
  await startDatabase();
  alice = await signUp('Alice', 'alice@test.com');
  bob = await signUp('Bob', 'bob@test.com');
  carol = await signUp('Carol', 'carol@test.com');
  dan = await signUp('Dan', 'dan@test.com');
}, 120000);

afterAll(async () => {
  await stopDatabase();
});

describe('friend requests', () => {
  let requestId;

  it('needs a token', async () => {
    expect((await request(app).get('/api/friends')).status).toBe(401);
  });

  it('sends a request to someone else', async () => {
    const res = await as(alice).post('/api/friends/requests', { userId: bob.id });
    expect(res.status).toBe(201);
    requestId = res.body.requestId;
    expect((await as(alice).get(`/api/friends/status/${bob.id}`)).body.status).toBe('sent');
    expect((await as(bob).get(`/api/friends/status/${alice.id}`)).body.status).toBe('received');
  });

  it('refuses a second request in either direction', async () => {
    expect((await as(alice).post('/api/friends/requests', { userId: bob.id })).status).toBe(409);
    expect((await as(bob).post('/api/friends/requests', { userId: alice.id })).status).toBe(409);
  });

  it('refuses bad targets', async () => {
    expect((await as(alice).post('/api/friends/requests', { userId: alice.id })).status).toBe(400);
    expect((await as(alice).post('/api/friends/requests', { userId: '0123456789abcdef01234567' })).status).toBe(404);
    expect((await as(alice).post('/api/friends/requests', { userId: { $ne: null } })).status).toBe(400);
    expect((await as(alice).post('/api/friends/requests', {})).status).toBe(400);
  });

  it('only the person who received the request can accept it', async () => {
    expect((await as(alice).post(`/api/friends/requests/${requestId}/accept`)).status).toBe(404);
    expect((await as(carol).post(`/api/friends/requests/${requestId}/accept`)).status).toBe(404);
    expect((await as(carol).delete(`/api/friends/requests/${requestId}`)).status).toBe(404);
    const res = await as(bob).post(`/api/friends/requests/${requestId}/accept`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('friends');
    expect((await as(bob).post(`/api/friends/requests/${requestId}/accept`)).status).toBe(404);
  });

  it('shows the friendship on both sides, and to nobody else', async () => {
    const mine = await as(alice).get('/api/friends');
    expect(mine.body.friends.map(friend => friend.name)).toEqual(['Bob']);
    expect(mine.body.friends[0].email).toBeUndefined();
    const theirs = await as(bob).get('/api/friends');
    expect(theirs.body.friends.map(friend => friend.name)).toEqual(['Alice']);
    const other = await as(carol).get('/api/friends');
    expect(other.body).toEqual({ friends: [], incoming: [], outgoing: [] });
  });

  it('lets only the two friends end the friendship', async () => {
    expect((await as(carol).delete(`/api/friends/${bob.id}`)).status).toBe(404);
    expect((await as(alice).delete(`/api/friends/${bob.id}`)).status).toBe(204);
    expect((await as(bob).get(`/api/friends/status/${alice.id}`)).body.status).toBe('none');
  });

  it('lets the sender cancel and the receiver decline, but not a stranger', async () => {
    const sent = await as(carol).post('/api/friends/requests', { userId: dan.id });
    expect((await as(alice).delete(`/api/friends/requests/${sent.body.requestId}`)).status).toBe(404);
    expect((await as(carol).delete(`/api/friends/requests/${sent.body.requestId}`)).status).toBe(204);
    const again = await as(carol).post('/api/friends/requests', { userId: dan.id });
    expect((await as(dan).delete(`/api/friends/requests/${again.body.requestId}`)).status).toBe(204);
    expect((await as(dan).get('/api/friends')).body.incoming).toEqual([]);
  });

  it('rejects bad ids', async () => {
    expect((await as(alice).post('/api/friends/requests/abc/accept')).status).toBe(400);
    expect((await as(alice).get('/api/friends/status/abc')).status).toBe(400);
  });
});

describe('race conditions', () => {
  it('creates only one request when the same request is sent 10 times at once', async () => {
    const results = await Promise.all(Array.from({ length: 10 }, () => as(dan).post('/api/friends/requests', { userId: alice.id })));
    const codes = results.map(res => res.status).sort();
    expect(codes.filter(code => code === 201)).toHaveLength(1);
    expect(codes.filter(code => code === 409)).toHaveLength(9);
  });

  it('creates only one request when two people add each other at the same moment', async () => {
    const results = await Promise.all([as(bob).post('/api/friends/requests', { userId: carol.id }), as(carol).post('/api/friends/requests', { userId: bob.id })]);
    expect(results.map(res => res.status).sort()).toEqual([201, 409]);
  });
});
