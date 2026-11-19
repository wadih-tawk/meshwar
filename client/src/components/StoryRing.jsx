import { useRef, useState } from 'react';
import Avatar from './Avatar.jsx';
import StoryViewer from './StoryViewer.jsx';

export default function StoryRing({ person, hasStory, size = 'medium', label, onChange }) {
  const [open, setOpen] = useState(false);
  const ring = useRef(null);

  function close() {
    setOpen(false);
    ring.current.focus();
  }

  if (!hasStory) {
    return <Avatar name={person.name} url={person.avatarUrl} size={size} />;
  }

  return (
    <>
      <button ref={ring} type="button" className="story-ring" aria-label={`See the stories of ${person.name}`} onClick={() => setOpen(true)}>
        <Avatar name={person.name} url={person.avatarUrl} size={size} />
      </button>
      {label && <span className="story-label">{label}</span>}
      {open && <StoryViewer person={person} onClose={close} onChange={onChange} />}
    </>
  );
}
