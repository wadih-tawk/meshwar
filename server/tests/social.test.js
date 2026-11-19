import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import Comment from '../models/Comment.js';
import { as, signUp, startDatabase, stopDatabase } from './setup-db.js';

let alice;
let bob;
let carol;
let post;
let hiddenPost;

async function photo() {
  return sharp({ create: { width: 40, height: 40, channels: 3, background: '#c17f4a' } }).png().toBuffer();
}

beforeAll(async () => {
  await startDatabase();
  alice = await signUp('Alice', 'alice@test.com');
  bob = await signUp('Bob', 'bob@test.com');
  carol = await signUp('Carol', 'carol@test.com');
  const sent = await as(alice).post('/api/friends/requests', { userId: bob.id });
  await as(bob).post(`/api/friends/requests/${sent.body.requestId}/accept`);
  post = (await as(bob).upload('/api/posts', { caption: 'Cedars' }, await photo())).body;
  hiddenPost = (await as(bob).upload('/api/posts', { caption: 'Private' }, await photo())).body;
  await as(bob).put(`/api/posts/${hiddenPost.id}`, { caption: 'Private', hidden: true });
}, 120000);

afterAll(async () => {
  await stopDatabase();
});

describe('likes', () => {
  it('counts one like per person, even when sent 10 times at once', async () => {
    const results = await Promise.all(Array.from({ length: 10 }, () => as(alice).put(`/api/posts/${post.id}/like`)));
    expect(results.every(res => res.status === 200)).toBe(true);
    await as(carol).put(`/api/posts/${post.id}/like`);
    const seen = await as(alice).get(`/api/posts/${post.id}`);
    expect(seen.body.likeCount).toBe(2);
    expect(seen.body.likedByMe).toBe(true);
    expect((await as(bob).get(`/api/posts/${post.id}`)).body.likedByMe).toBe(false);
  });

  it('removes only my own like', async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => as(alice).delete(`/api/posts/${post.id}/like`)));
    expect(results[0].body).toEqual({ likeCount: 1, likedByMe: false });
    expect((await as(carol).get(`/api/posts/${post.id}`)).body.likedByMe).toBe(true);
  });

  it('cannot like a hidden post of someone else', async () => {
    expect((await as(alice).put(`/api/posts/${hiddenPost.id}/like`)).status).toBe(404);
  });
});

describe('comments', () => {
  let aliceComment;

  it('adds a comment as myself, whatever author the request claims', async () => {
    const res = await as(alice).post(`/api/posts/${post.id}/comments`, { text: 'Nice <script>alert(1)</script>', author: carol.id, postAuthor: alice.id });
    expect(res.status).toBe(201);
    expect(res.body.comment.author.name).toBe('Alice');
    expect(res.body.comment.text).toBe('Nice <script>alert(1)</script>');
    expect(res.body.commentCount).toBe(1);
    aliceComment = res.body.comment;
  });

  it('refuses empty, too long, or non-text comments', async () => {
    expect((await as(alice).post(`/api/posts/${post.id}/comments`, { text: '   ' })).status).toBe(400);
    expect((await as(alice).post(`/api/posts/${post.id}/comments`, { text: 'a'.repeat(301) })).status).toBe(400);
    expect((await as(alice).post(`/api/posts/${post.id}/comments`, { text: { $gt: '' } })).status).toBe(400);
  });

  it('cannot read or write comments on a hidden post of someone else', async () => {
    expect((await as(alice).get(`/api/posts/${hiddenPost.id}/comments`)).status).toBe(404);
    expect((await as(alice).post(`/api/posts/${hiddenPost.id}/comments`, { text: 'hi' })).status).toBe(404);
  });

  it('lets only the comment author or the post author delete a comment', async () => {
    const carolComment = (await as(carol).post(`/api/posts/${post.id}/comments`, { text: 'Carol was here' })).body.comment;
    expect((await as(carol).delete(`/api/posts/${post.id}/comments/${aliceComment.id}`)).status).toBe(404);
    expect((await as(alice).delete(`/api/posts/${post.id}/comments/${carolComment.id}`)).status).toBe(404);
    const list = await as(carol).get(`/api/posts/${post.id}/comments`);
    expect(list.body.map(comment => [comment.author.name, comment.canDelete])).toEqual([
      ['Alice', false],
      ['Carol', true],
    ]);
    expect((await as(bob).delete(`/api/posts/${post.id}/comments/${carolComment.id}`)).body.commentCount).toBe(1);
  });

  it('counts a comment once when it is deleted many times at once', async () => {
    const results = await Promise.all(Array.from({ length: 5 }, () => as(alice).delete(`/api/posts/${post.id}/comments/${aliceComment.id}`)));
    expect(results.map(res => res.status).sort()).toEqual([200, 404, 404, 404, 404]);
    expect((await as(alice).get(`/api/posts/${post.id}`)).body.commentCount).toBe(0);
  });

  it('cannot delete a comment through another post id', async () => {
    const other = (await as(alice).upload('/api/posts', {}, await photo())).body;
    const comment = (await as(carol).post(`/api/posts/${post.id}/comments`, { text: 'hello' })).body.comment;
    expect((await as(alice).delete(`/api/posts/${other.id}/comments/${comment.id}`)).status).toBe(404);
  });

  it('slows down people who comment too fast', async () => {
    const spammer = await signUp('Spammer', 'spam@test.com');
    const codes = [];
    for (let i = 0; i < 21; i += 1) {
      codes.push((await as(spammer).post(`/api/posts/${post.id}/comments`, { text: `spam ${i}` })).status);
    }
    expect(codes.filter(code => code === 201)).toHaveLength(20);
    expect(codes.at(-1)).toBe(429);
    expect((await as(alice).post(`/api/posts/${post.id}/comments`, { text: 'still fine' })).status).toBe(201);
  });
});

describe('sharing with a friend', () => {
  let messageId;

  it('only shares with friends, and never a hidden post', async () => {
    expect((await as(alice).post(`/api/posts/${post.id}/share`, { friendId: carol.id })).status).toBe(403);
    expect((await as(alice).post(`/api/posts/${post.id}/share`, { friendId: alice.id })).status).toBe(403);
    expect((await as(bob).post(`/api/posts/${hiddenPost.id}/share`, { friendId: alice.id })).status).toBe(404);
  });

  it('sends a private message that only the sender and the receiver can read', async () => {
    const res = await as(alice).post(`/api/posts/${post.id}/share`, { friendId: bob.id, note: 'Look <b>this</b>' });
    expect(res.status).toBe(201);
    expect(res.body.shareCount).toBe(1);
    const inbox = await as(bob).get('/api/messages');
    expect(inbox.body).toHaveLength(1);
    expect(inbox.body[0].direction).toBe('received');
    expect(inbox.body[0].from.name).toBe('Alice');
    expect(inbox.body[0].note).toBe('Look <b>this</b>');
    expect(inbox.body[0].post.caption).toBe('Cedars');
    messageId = inbox.body[0].id;
    expect((await as(alice).get(`/api/messages/${messageId}`)).body.direction).toBe('sent');
    expect((await as(carol).get(`/api/messages/${messageId}`)).status).toBe(404);
    expect((await as(carol).get('/api/messages')).body).toEqual([]);
  });

  it('hides the post inside a message once its author hides it', async () => {
    await as(bob).put(`/api/posts/${post.id}`, { caption: 'Cedars', hidden: true });
    expect((await as(alice).get(`/api/messages/${messageId}`)).body.post).toBe(null);
    expect((await as(bob).get(`/api/messages/${messageId}`)).body.post.hidden).toBe(true);
    await as(bob).put(`/api/posts/${post.id}`, { caption: 'Cedars', hidden: false });
  });

  it('removes the comments of a deleted post', async () => {
    expect(await Comment.countDocuments({ post: post.id })).toBeGreaterThan(0);
    expect((await as(bob).delete(`/api/posts/${post.id}`)).status).toBe(204);
    expect(await Comment.countDocuments({ post: post.id })).toBe(0);
    expect((await as(bob).get(`/api/posts/${post.id}/comments`)).status).toBe(404);
    expect((await as(bob).get(`/api/messages/${messageId}`)).body.post).toBe(null);
  });
});
