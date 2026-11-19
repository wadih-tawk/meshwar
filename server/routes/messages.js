import express from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message.js';
import { personView, postView } from '../views.js';

const router = express.Router();

function messageView(message, me) {
  const post = message.post;
  const canSeePost = post && post.author && (!post.hidden || String(post.author._id) === String(me));
  return {
    id: message._id,
    direction: String(message.to._id) === String(me) ? 'received' : 'sent',
    from: personView(message.from),
    to: personView(message.to),
    note: message.note,
    post: canSeePost ? postView(post, me) : null,
    createdAt: message.createdAt,
  };
}

function withPeopleAndPost(query) {
  return query
    .populate('from', 'name avatarId')
    .populate('to', 'name avatarId')
    .populate({ path: 'post', populate: { path: 'author', select: 'name avatarId' } });
}

function mine(userId) {
  return { $or: [{ from: userId }, { to: userId }] };
}

router.get('/', async (req, res) => {
  const messages = await withPeopleAndPost(Message.find(mine(req.userId)).sort({ createdAt: -1 }).limit(50));
  res.json(messages.filter(message => message.from && message.to).map(message => messageView(message, req.userId)));
});

router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  const message = await withPeopleAndPost(Message.findOne({ _id: req.params.id, ...mine(req.userId) }));
  if (!message || !message.from || !message.to) return res.status(404).json({ error: 'Message not found' });
  res.json(messageView(message, req.userId));
});

export default router;
