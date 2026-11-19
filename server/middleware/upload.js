import path from 'node:path';
import multer from 'multer';
import { userLimiter } from './limits.js';

const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const uploadPhoto = multer({
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

export const uploadLimiter = userLimiter(60, 30, 'uploads');
