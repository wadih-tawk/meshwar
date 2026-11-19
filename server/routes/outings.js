import express from 'express';
import mongoose from 'mongoose';
import Outing from '../models/Outing.js';

const router = express.Router();

function checkId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  next();
}

router.get('/', async (req, res) => {
  const outings = await Outing.find({ userId: req.userId }).sort({ date: 1 });
  res.json(outings);
});

router.post('/', async (req, res) => {
  const { title, activity, place, date, notes } = req.body;
  const outing = await Outing.create({ title, activity, place, date, notes, userId: req.userId });
  res.status(201).json(outing);
});

router.get('/:id', checkId, async (req, res) => {
  const outing = await Outing.findOne({ _id: req.params.id, userId: req.userId });
  if (!outing) return res.status(404).json({ error: 'Outing not found' });
  res.json(outing);
});

router.put('/:id', checkId, async (req, res) => {
  const { title, activity, place, date, notes } = req.body;
  const filter = { _id: req.params.id, userId: req.userId };
  const options = { returnDocument: 'after', runValidators: true };
  const outing = await Outing.findOneAndUpdate(filter, { title, activity, place, date, notes }, options);
  if (!outing) return res.status(404).json({ error: 'Outing not found' });
  res.json(outing);
});

router.delete('/:id', checkId, async (req, res) => {
  const outing = await Outing.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!outing) return res.status(404).json({ error: 'Outing not found' });
  res.status(204).end();
});

export default router;
