import express from 'express';
import mongoose from 'mongoose';
import Image from '../models/Image.js';
import { checkImageLink } from '../images/photos.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id) || !checkImageLink(id, req.query.expires, req.query.sig)) {
    return res.status(403).json({ error: 'This image link is not valid' });
  }
  const image = await Image.findById(id);
  if (!image) return res.status(404).json({ error: 'Image not found' });
  res.set({
    'Content-Type': image.contentType,
    'Content-Disposition': 'inline; filename="photo.jpg"',
    'Cache-Control': 'private, max-age=3600',
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });
  res.send(image.data);
});

export default router;
