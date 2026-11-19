import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Image from '../models/Image.js';
import Story, { stillActive } from '../models/Story.js';
import { validate, ProfileInput } from '../middleware/validate.js';
import { uploadLimiter, uploadPhoto } from '../middleware/upload.js';
import { imageUrl, toSafeJpeg } from '../images/photos.js';

const router = express.Router();

function checkId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  next();
}

function publicProfile(user) {
  return { id: user._id, name: user.name, bio: user.bio, avatarUrl: imageUrl(user.avatarId), joinedAt: user.createdAt };
}

function privateProfile(user) {
  return { ...publicProfile(user), email: user.email };
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/me', async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(privateProfile(user));
});

router.put('/me', validate(ProfileInput), async (req, res) => {
  const { name, bio } = req.body;
  const options = { returnDocument: 'after', runValidators: true };
  const user = await User.findByIdAndUpdate(req.userId, { name, bio }, options);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(privateProfile(user));
});

router.put('/me/avatar', uploadLimiter, uploadPhoto, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Choose a photo to upload' });
  const { data, info } = await toSafeJpeg(req.file.buffer, 400, 'cover');
  const image = await Image.create({ ownerId: req.userId, purpose: 'avatar', data, width: info.width, height: info.height, size: info.size });
  const before = await User.findByIdAndUpdate(req.userId, { avatarId: image._id }, { returnDocument: 'before' });
  if (before && before.avatarId) {
    await Image.deleteOne({ _id: before.avatarId, ownerId: req.userId });
  }
  const user = await User.findById(req.userId);
  res.json(privateProfile(user));
});

router.delete('/me/avatar', async (req, res) => {
  const before = await User.findByIdAndUpdate(req.userId, { avatarId: null }, { returnDocument: 'before' });
  if (before && before.avatarId) {
    await Image.deleteOne({ _id: before.avatarId, ownerId: req.userId });
  }
  res.status(204).end();
});

router.get('/', async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (query.length < 2 || query.length > 50) {
    return res.status(400).json({ error: 'Search with 2 to 50 characters' });
  }
  const filter = { name: mongoose.trusted({ $regex: escapeRegex(query), $options: 'i' }) };
  const users = await User.find(filter).limit(10);
  res.json(users.map(publicProfile));
});

router.get('/:id', checkId, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const hasStory = Boolean(await Story.exists({ author: user._id, expiresAt: stillActive() }));
  res.json({ ...publicProfile(user), hasStory });
});

export default router;
