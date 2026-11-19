import express from 'express';
import Outing from '../models/Outing.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const outings = await Outing.find({ userId: req.userId }).sort({ date: 1 });
  res.json(outings);
});

router.post('/', async (req, res) => {
  const { title, activity, place, date, notes } = req.body;
  const outing = await Outing.create({ title, activity, place, date, notes, userId: req.userId });
  res.status(201).json(outing);
});

export default router;
