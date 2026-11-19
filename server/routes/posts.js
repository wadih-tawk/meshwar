import express from 'express';
import mongoose from 'mongoose';
import Post, { visibleTo } from '../models/Post.js';
import Image from '../models/Image.js';
import Outing from '../models/Outing.js';
import Comment from '../models/Comment.js';
import Message from '../models/Message.js';
import { areFriends, friendIds } from '../models/Friendship.js';
import { validate, PostInput, PostUpdateInput, ShareInput } from '../middleware/validate.js';
import { uploadLimiter, uploadPhoto } from '../middleware/upload.js';
import { userLimiter } from '../middleware/limits.js';
import { toSafeJpeg } from '../images/photos.js';
import { postView } from '../views.js';

const router = express.Router();

const FEED_SIZE = 30;
const likeLimiter = userLimiter(10, 120, 'likes');
const shareLimiter = userLimiter(60, 30, 'shares');

function checkId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  next();
}

function withAuthor(query) {
  return query.populate('author', 'name avatarId');
}

function postViews(posts, me) {
  return posts.filter(post => post.author).map(post => postView(post, me));
}

function likeView(post, me) {
  return { likeCount: post.likes.length, likedByMe: post.likes.some(id => String(id) === String(me)) };
}

router.post('/', uploadLimiter, uploadPhoto, validate(PostInput), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Choose a photo to post' });
  let outing = null;
  if (req.body.outingId) {
    const found = await Outing.findOne({ _id: req.body.outingId, userId: req.userId });
    if (!found) return res.status(404).json({ error: 'Outing not found' });
    outing = { title: found.title, place: found.place.name, activity: found.activity };
  }
  const { data, info } = await toSafeJpeg(req.file.buffer, 1080, 'inside');
  const image = await Image.create({ ownerId: req.userId, purpose: 'post', data, width: info.width, height: info.height, size: info.size });
  const post = await Post.create({ author: req.userId, image: image._id, caption: req.body.caption, outing });
  await post.populate('author', 'name avatarId');
  res.status(201).json(postView(post, req.userId));
});

router.get('/feed', async (req, res) => {
  const circle = [...(await friendIds(req.userId)), req.userId];
  const newest = { createdAt: -1 };
  const friends = await withAuthor(Post.find({ author: mongoose.trusted({ $in: circle }), hidden: false }).sort(newest).limit(FEED_SIZE));
  const others = await withAuthor(Post.find({ author: mongoose.trusted({ $nin: circle }), hidden: false }).sort(newest).limit(FEED_SIZE));
  res.json({ friends: postViews(friends, req.userId), others: postViews(others, req.userId) });
});

router.get('/user/:id', checkId, async (req, res) => {
  const filter = { author: req.params.id };
  if (req.params.id !== String(req.userId)) {
    filter.hidden = false;
  }
  const posts = await withAuthor(Post.find(filter).sort({ createdAt: -1 }).limit(50));
  res.json(postViews(posts, req.userId));
});

router.get('/:id', checkId, async (req, res) => {
  const post = await withAuthor(Post.findOne({ _id: req.params.id, ...visibleTo(req.userId) }));
  if (!post || !post.author) return res.status(404).json({ error: 'Post not found' });
  res.json(postView(post, req.userId));
});

router.put('/:id', checkId, validate(PostUpdateInput), async (req, res) => {
  const { caption, hidden } = req.body;
  const filter = { _id: req.params.id, author: req.userId };
  const options = { returnDocument: 'after', runValidators: true };
  const post = await withAuthor(Post.findOneAndUpdate(filter, { caption, hidden }, options));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(postView(post, req.userId));
});

router.delete('/:id', checkId, async (req, res) => {
  const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.userId });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  await Image.deleteOne({ _id: post.image, ownerId: req.userId });
  await Comment.deleteMany({ post: post._id });
  res.status(204).end();
});

router.put('/:id/like', checkId, likeLimiter, async (req, res) => {
  const filter = { _id: req.params.id, ...visibleTo(req.userId) };
  const post = await Post.findOneAndUpdate(filter, { $addToSet: { likes: req.userId } }, { returnDocument: 'after' });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(likeView(post, req.userId));
});

router.delete('/:id/like', checkId, likeLimiter, async (req, res) => {
  const filter = { _id: req.params.id, ...visibleTo(req.userId) };
  const post = await Post.findOneAndUpdate(filter, { $pull: { likes: req.userId } }, { returnDocument: 'after' });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(likeView(post, req.userId));
});

router.post('/:id/share', checkId, shareLimiter, validate(ShareInput), async (req, res) => {
  const { friendId, note } = req.body;
  if (!(await areFriends(req.userId, friendId))) {
    return res.status(403).json({ error: 'You can only share posts with your friends' });
  }
  const post = await Post.findOneAndUpdate({ _id: req.params.id, hidden: false }, { $inc: { shareCount: 1 } }, { returnDocument: 'after' });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  await Message.create({ from: req.userId, to: friendId, post: post._id, note });
  res.status(201).json({ shareCount: post.shareCount });
});

export default router;
