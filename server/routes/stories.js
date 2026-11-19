import express from 'express';
import mongoose from 'mongoose';
import Story, { STORY_HOURS, stillActive } from '../models/Story.js';
import Image from '../models/Image.js';
import { friendIds } from '../models/Friendship.js';
import { validate, StoryInput } from '../middleware/validate.js';
import { uploadLimiter, uploadPhoto } from '../middleware/upload.js';
import { imageUrl, toSafeJpeg } from '../images/photos.js';
import { personView } from '../views.js';

const router = express.Router();

function checkId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  next();
}

function storyView(story, me) {
  return {
    id: story._id,
    imageUrl: imageUrl(story.image),
    caption: story.caption,
    mine: String(story.author._id || story.author) === String(me),
    createdAt: story.createdAt,
    expiresAt: story.expiresAt,
  };
}

router.post('/', uploadLimiter, uploadPhoto, validate(StoryInput), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Choose a photo for your story' });
  const expiresAt = new Date(Date.now() + STORY_HOURS * 60 * 60 * 1000);
  const { data, info } = await toSafeJpeg(req.file.buffer, 1080, 'inside');
  const image = await Image.create({ ownerId: req.userId, purpose: 'story', data, width: info.width, height: info.height, size: info.size, expiresAt });
  const story = await Story.create({ author: req.userId, image: image._id, caption: req.body.caption, expiresAt });
  res.status(201).json(storyView(story, req.userId));
});

router.get('/friends', async (req, res) => {
  const circle = [...(await friendIds(req.userId)), req.userId];
  const stories = await Story.find({ author: mongoose.trusted({ $in: circle }), expiresAt: stillActive() })
    .sort({ createdAt: -1 })
    .populate('author', 'name avatarId');
  const people = [];
  stories.forEach(story => {
    if (!story.author) return;
    const found = people.find(item => String(item.id) === String(story.author._id));
    if (found) {
      found.count += 1;
    } else {
      people.push({ ...personView(story.author), count: 1, latestAt: story.createdAt, mine: String(story.author._id) === String(req.userId) });
    }
  });
  people.sort((a, b) => b.mine - a.mine);
  res.json(people);
});

router.get('/user/:id', checkId, async (req, res) => {
  const stories = await Story.find({ author: req.params.id, expiresAt: stillActive() }).sort({ createdAt: 1 });
  res.json(stories.map(story => storyView(story, req.userId)));
});

router.delete('/:id', checkId, async (req, res) => {
  const story = await Story.findOneAndDelete({ _id: req.params.id, author: req.userId });
  if (!story) return res.status(404).json({ error: 'Story not found' });
  await Image.deleteOne({ _id: story.image, ownerId: req.userId });
  res.status(204).end();
});

export default router;
