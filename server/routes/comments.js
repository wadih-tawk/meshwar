import express from 'express';
import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Post, { visibleTo } from '../models/Post.js';
import { validate, CommentInput } from '../middleware/validate.js';
import { userLimiter } from '../middleware/limits.js';
import { personView } from '../views.js';

const router = express.Router();

const commentLimiter = userLimiter(10, 20, 'comments');

function checkIds(req, res, next) {
  if (!Object.values(req.params).every(id => mongoose.isValidObjectId(id))) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  next();
}

function commentView(comment, me) {
  return {
    id: comment._id,
    author: personView(comment.author),
    text: comment.text,
    createdAt: comment.createdAt,
    canDelete: String(comment.author._id) === String(me) || String(comment.postAuthor) === String(me),
  };
}

router.get('/:id/comments', checkIds, async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, ...visibleTo(req.userId) });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const comments = await Comment.find({ post: post._id }).sort({ createdAt: 1 }).limit(100).populate('author', 'name avatarId');
  res.json(comments.filter(comment => comment.author).map(comment => commentView(comment, req.userId)));
});

router.post('/:id/comments', checkIds, commentLimiter, validate(CommentInput), async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, ...visibleTo(req.userId) });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const comment = await Comment.create({ post: post._id, postAuthor: post.author, author: req.userId, text: req.body.text });
  const counted = await Post.findByIdAndUpdate(post._id, { $inc: { commentCount: 1 } }, { returnDocument: 'after' });
  await comment.populate('author', 'name avatarId');
  res.status(201).json({ comment: commentView(comment, req.userId), commentCount: counted ? counted.commentCount : 0 });
});

router.delete('/:id/comments/:commentId', checkIds, async (req, res) => {
  const me = req.userId;
  const filter = { _id: req.params.commentId, post: req.params.id, $or: [{ author: me }, { postAuthor: me }] };
  const comment = await Comment.findOneAndDelete(filter);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  const post = await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } }, { returnDocument: 'after' });
  res.json({ commentCount: post ? post.commentCount : 0 });
});

export default router;
