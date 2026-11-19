import crypto from 'node:crypto';
import sharp from 'sharp';

const FORMATS = ['jpeg', 'png', 'webp'];
const MAX_PIXELS = 40_000_000;
const HOUR = 60 * 60;

function badImage() {
  const err = new Error('This file is not a valid JPG, PNG or WebP photo');
  err.status = 400;
  return err;
}

export async function toSafeJpeg(buffer, size, fit) {
  let meta;
  try {
    meta = await sharp(buffer, { limitInputPixels: MAX_PIXELS }).metadata();
  } catch {
    throw badImage();
  }
  if (!FORMATS.includes(meta.format)) {
    throw badImage();
  }
  try {
    return await sharp(buffer, { limitInputPixels: MAX_PIXELS })
      .rotate()
      .resize({ width: size, height: size, fit, withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw badImage();
  }
}

function sign(text) {
  return crypto.createHmac('sha256', process.env.JWT_SECRET).update(`image:${text}`).digest('hex');
}

export function imageUrl(imageId) {
  if (!imageId) {
    return null;
  }
  const expires = (Math.floor(Date.now() / 1000 / HOUR) + 2) * HOUR;
  return `/api/images/${imageId}?expires=${expires}&sig=${sign(`${imageId}.${expires}`)}`;
}

export function checkImageLink(imageId, expires, sig) {
  if (typeof expires !== 'string' || typeof sig !== 'string') {
    return false;
  }
  if (!/^\d+$/.test(expires) || !/^[a-f0-9]{64}$/.test(sig)) {
    return false;
  }
  if (Number(expires) < Date.now() / 1000) {
    return false;
  }
  const expected = Buffer.from(sign(`${imageId}.${expires}`), 'hex');
  return crypto.timingSafeEqual(expected, Buffer.from(sig, 'hex'));
}
