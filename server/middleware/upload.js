import path from 'node:path';
import multer from 'multer';
import Image from '../models/Image.js';
import { ipLimiter, userLimiter } from './limits.js';

const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_PHOTOS = 100;

const readPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1, fields: 5 },
  fileFilter(req, file, done) {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!TYPES.includes(file.mimetype) || !EXTENSIONS.includes(extension)) {
      const err = new Error('Only JPG, PNG or WebP photos are allowed');
      err.status = 400;
      return done(err);
    }
    done(null, true);
  },
}).single('photo');

export function uploadPhoto(req, res, next) {
  readPhoto(req, res, err => {
    if (err && err.name !== 'MulterError' && !err.status) {
      err.status = 400;
      err.message = 'The upload could not be read. Try again.';
    }
    next(err);
  });
}

async function photoQuota(req, res, next) {
  const count = await Image.countDocuments({ ownerId: req.userId });
  if (count >= MAX_PHOTOS) {
    return res.status(403).json({ error: `You can keep up to ${MAX_PHOTOS} photos. Delete some before adding more.` });
  }
  next();
}

export const uploadLimiter = [ipLimiter(60, 60, 'uploads from this network'), userLimiter(60, 30, 'uploads'), photoQuota];
