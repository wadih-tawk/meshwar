import express from 'express';
import mongoose from 'mongoose';
import Friendship, { pairKey } from '../models/Friendship.js';
import User from '../models/User.js';
import { validate, FriendRequestInput } from '../middleware/validate.js';
import { userLimiter } from '../middleware/limits.js';
import { personView } from '../views.js';

const router = express.Router();

const requestLimiter = userLimiter(60, 30, 'friend requests');

function checkId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  next();
}

router.get('/', async (req, res) => {
  const me = req.userId;
  const links = await Friendship.find({ $or: [{ requester: me }, { recipient: me }] })
    .populate('requester', 'name avatarId')
    .populate('recipient', 'name avatarId')
    .sort({ updatedAt: -1 });
  const result = { friends: [], incoming: [], outgoing: [] };
  links.forEach(link => {
    if (!link.requester || !link.recipient) return;
    const iSent = String(link.requester._id) === String(me);
    const other = iSent ? link.recipient : link.requester;
    const item = { requestId: link._id, ...personView(other) };
    if (link.status === 'accepted') result.friends.push(item);
    else if (iSent) result.outgoing.push(item);
    else result.incoming.push(item);
  });
  res.json(result);
});

router.get('/status/:id', checkId, async (req, res) => {
  const link = await Friendship.findOne({ pair: pairKey(req.userId, req.params.id) });
  if (!link) return res.json({ status: 'none' });
  if (link.status === 'accepted') return res.json({ status: 'friends', requestId: link._id });
  const iSent = String(link.requester) === String(req.userId);
  res.json({ status: iSent ? 'sent' : 'received', requestId: link._id });
});

router.post('/requests', requestLimiter, validate(FriendRequestInput), async (req, res) => {
  const { userId } = req.body;
  if (userId === String(req.userId)) {
    return res.status(400).json({ error: 'You cannot add yourself' });
  }
  if (!(await User.exists({ _id: userId }))) {
    return res.status(404).json({ error: 'User not found' });
  }
  try {
    const link = await Friendship.create({ pair: pairKey(req.userId, userId), requester: req.userId, recipient: userId });
    res.status(201).json({ status: 'sent', requestId: link._id });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'You already sent a request, received one, or are already friends' });
    }
    throw err;
  }
});

router.post('/requests/:id/accept', checkId, async (req, res) => {
  const filter = { _id: req.params.id, recipient: req.userId, status: 'pending' };
  const link = await Friendship.findOneAndUpdate(filter, { status: 'accepted' }, { returnDocument: 'after' });
  if (!link) return res.status(404).json({ error: 'Friend request not found' });
  res.json({ status: 'friends', requestId: link._id });
});

router.delete('/requests/:id', checkId, async (req, res) => {
  const me = req.userId;
  const filter = { _id: req.params.id, status: 'pending', $or: [{ requester: me }, { recipient: me }] };
  const link = await Friendship.findOneAndDelete(filter);
  if (!link) return res.status(404).json({ error: 'Friend request not found' });
  res.status(204).end();
});

router.delete('/:id', checkId, async (req, res) => {
  const link = await Friendship.findOneAndDelete({ pair: pairKey(req.userId, req.params.id), status: 'accepted' });
  if (!link) return res.status(404).json({ error: 'You are not friends' });
  res.status(204).end();
});

export default router;
