import { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar.jsx';
import { apiFetch, imageSrc } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { timeAgo } from '../utils/dates.js';

export const STORY_SECONDS = 5;

export default function StoryViewer({ person, onClose, onChange }) {
  const { data, loading, error } = useApi(`/api/stories/user/${person.id}`);
  const [index, setIndex] = useState(0);
  const [removed, setRemoved] = useState([]);
  const [confirming, setConfirming] = useState(false);
  const [problem, setProblem] = useState('');
  const closeButton = useRef(null);

  const stories = data ? data.filter(story => !removed.includes(story.id)) : [];
  const story = stories[index];

  function next() {
    setConfirming(false);
    if (index + 1 < stories.length) {
      setIndex(index + 1);
    } else {
      onClose();
    }
  }

  function previous() {
    setConfirming(false);
    setIndex(Math.max(0, index - 1));
  }

  useEffect(() => {
    closeButton.current.focus();
  }, []);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') previous();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  useEffect(() => {
    if (!story || confirming) {
      return;
    }
    const timer = setTimeout(next, STORY_SECONDS * 1000);
    return () => clearTimeout(timer);
  });

  async function handleDelete() {
    try {
      await apiFetch(`/api/stories/${story.id}`, { method: 'DELETE' });
      setConfirming(false);
      setRemoved(list => [...list, story.id]);
      if (onChange) onChange();
      if (stories.length === 1) onClose();
      else if (index === stories.length - 1) setIndex(index - 1);
    } catch (err) {
      setProblem(err.message);
    }
  }

  let content;
  if (loading) {
    content = <p className="story-message">Loading stories…</p>;
  } else if (error) {
    content = <p className="story-message">{error.message}</p>;
  } else if (!story) {
    content = <p className="story-message">No stories right now.</p>;
  } else {
    content = (
      <>
        <div className="story-progress">
          {stories.map((item, i) => (
            <span key={item.id} className={i < index ? 'seen' : i === index ? 'current' : ''} />
          ))}
        </div>
        <img key={story.id} className="story-photo" src={imageSrc(story.imageUrl)} alt={story.caption || `Story by ${person.name}`} />
        {story.caption && <p className="story-caption">{story.caption}</p>}
        <button type="button" className="story-nav story-prev" aria-label="Previous story" onClick={previous} disabled={index === 0} />
        <button type="button" className="story-nav story-next" aria-label="Next story" onClick={next} />
        {story.mine && (
          <div className="story-owner">
            {confirming ? (
              <>
                <button type="button" className="button button-danger" onClick={handleDelete}>
                  Delete story
                </button>
                <button type="button" className="button button-quiet" onClick={() => setConfirming(false)}>
                  Keep
                </button>
              </>
            ) : (
              <button type="button" className="button button-ghost" onClick={() => setConfirming(true)}>
                Delete…
              </button>
            )}
          </div>
        )}
        {problem && <p className="story-message">{problem}</p>}
      </>
    );
  }

  return (
    <div className="story-backdrop" onClick={onClose}>
      <div className={confirming ? "story-box paused" : "story-box"} role="dialog" aria-modal="true" aria-label={`Stories by ${person.name}`} onClick={e => e.stopPropagation()}>
        <header className="story-head">
          <Avatar name={person.name} url={person.avatarUrl} size="small" />
          <strong>{person.name}</strong>
          {story && <span>{timeAgo(story.createdAt)}</span>}
          <button ref={closeButton} type="button" className="story-close" aria-label="Close stories" onClick={onClose}>
            ✕
          </button>
        </header>
        {content}
      </div>
    </div>
  );
}
