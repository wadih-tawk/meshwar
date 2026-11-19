import { useState } from 'react';
import Avatar from './Avatar.jsx';
import StoryRing from './StoryRing.jsx';
import { apiFetch } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useApi } from '../hooks/useApi.js';
import { usePhotoPicker } from '../hooks/usePhotoPicker.js';

export default function StoryBar() {
  const { user } = useAuth();
  const { data: people, reload } = useApi('/api/stories/friends');
  const photo = usePhotoPicker();
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleShare(e) {
    e.preventDefault();
    const form = new FormData();
    form.append('caption', caption);
    form.append('photo', photo.file);
    setBusy(true);
    setError('');
    try {
      await apiFetch('/api/stories', { method: 'POST', body: form });
      photo.clear();
      setCaption('');
      reload();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  const problem = photo.problem || error;

  return (
    <section className="panel stories" aria-label="Stories">
      <ul className="story-list">
        <li className="story-item">
          <label className="story-add">
            <Avatar name={user ? user.name : ''} url={user ? user.avatarUrl : null} size="medium" />
            <span className="story-plus" aria-hidden="true">
              +
            </span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={photo.pick} aria-label="Add a story photo" />
          </label>
          <span className="story-label">Add story</span>
        </li>
        {(people || []).map(person => (
          <li key={person.id} className="story-item">
            <StoryRing person={person} hasStory size="medium" label={person.mine ? 'Your story' : person.name} onChange={reload} />
          </li>
        ))}
      </ul>

      {photo.preview && (
        <form className="story-composer" onSubmit={handleShare}>
          <img src={photo.preview} alt="Story to share" />
          <div className="field">
            <label htmlFor="story-caption">Caption (optional)</label>
            <input id="story-caption" value={caption} onChange={e => setCaption(e.target.value)} maxLength={100} placeholder="Where are you right now?" />
            <p className="small">Stories disappear after 24 hours.</p>
          </div>
          <div className="form-actions">
            <button className="button" disabled={busy}>
              {busy ? 'Sharing…' : 'Share story'}
            </button>
            <button type="button" className="button button-quiet" onClick={photo.clear}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {problem && (
        <p className="error" role="alert">
          {problem}
        </p>
      )}
    </section>
  );
}
