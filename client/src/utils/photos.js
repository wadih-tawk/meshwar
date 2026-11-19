export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function checkPhotoFile(file) {
  if (!PHOTO_TYPES.includes(file.type)) {
    return 'Choose a JPG, PNG or WebP photo.';
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return 'This photo is bigger than 5 MB. Choose a smaller one.';
  }
  return '';
}

export function initials(name) {
  if (!name || !name.trim()) {
    return '?';
  }
  return name
    .trim()
    .split(' ')
    .filter(word => word !== '')
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('');
}
