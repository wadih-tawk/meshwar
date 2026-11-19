import { imageSrc } from '../api/client.js';
import { initials } from '../utils/photos.js';

export default function Avatar({ name, url, size = 'medium' }) {
  if (url) {
    return <img className={`avatar avatar-${size}`} src={imageSrc(url)} alt={name} />;
  }
  return (
    <span className={`avatar avatar-${size} avatar-initials`} role="img" aria-label={name}>
      {initials(name)}
    </span>
  );
}
