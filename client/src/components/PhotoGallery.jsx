import { useState } from 'react';

export default function PhotoGallery({ photos, title }) {
  const [current, setCurrent] = useState(0);
  const photo = photos[current];

  return (
    <section className="gallery">
      <img className="gallery-main" src={photo.src} alt={`${title}, photo ${current + 1} of ${photos.length}`} />
      <p className="small">
        Photo:{' '}
        <a href={photo.page} target="_blank" rel="noreferrer">
          {photo.author}
        </a>
        , {photo.license}, via Wikimedia Commons
      </p>
      {photos.length > 1 && (
        <ul className="gallery-thumbs">
          {photos.map((item, index) => (
            <li key={item.src}>
              <button
                type="button"
                className={index === current ? 'thumb thumb-active' : 'thumb'}
                aria-label={`Show photo ${index + 1}`}
                aria-pressed={index === current}
                onClick={() => setCurrent(index)}
              >
                <img src={item.src} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
