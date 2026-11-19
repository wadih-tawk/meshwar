import { useState } from 'react';
import { apiFetch } from '../api/client.js';
import { useApi } from '../hooks/useApi.js';
import { usePhotoPicker } from '../hooks/usePhotoPicker.js';

export default function PostComposer({ onPosted }) {
  const { data: outings } = useApi('/api/outings');
  const photo = usePhotoPicker();
  const [caption, setCaption] = useState('');
  const [outingId, setOutingId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!photo.file) {
      setError('Choose a photo first.');
      return;
    }
    const form = new FormData();
    form.append('caption', caption);
    if (outingId) {
      form.append('outingId', outingId);
    }
    form.append('photo', photo.file);
    setBusy(true);
    setError('');
    try {
      const post = await apiFetch('/api/posts', { method: 'POST', body: form });
      onPosted(post);
      photo.clear();
      setCaption('');
      setOutingId('');
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  const problem = photo.problem || error;

  return (
    <form className="panel composer" onSubmit={handleSubmit}>
      <h2>Share a photo from an outing</h2>
      {photo.preview && <img className="composer-preview" src={photo.preview} alt="Photo to post" />}
      <label className="button button-quiet file-button">
        {photo.file ? 'Choose another photo' : '📷 Choose a photo'}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={photo.pick} />
      </label>
      <div className="field">
        <label htmlFor="caption">Caption</label>
        <textarea id="caption" rows={2} value={caption} onChange={e => setCaption(e.target.value)} maxLength={500} placeholder="Where were you, and how was it?" />
      </div>
      {outings && outings.length > 0 && (
        <div className="field">
          <label htmlFor="outing">Outing (optional)</label>
          <select id="outing" value={outingId} onChange={e => setOutingId(e.target.value)}>
            <option value="">No outing</option>
            {outings.map(outing => (
              <option key={outing._id} value={outing._id}>
                {outing.title} · {outing.place.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {problem && (
        <p className="error" role="alert">
          {problem}
        </p>
      )}
      <div className="form-actions">
        <button className="button" disabled={busy}>
          {busy ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  );
}
