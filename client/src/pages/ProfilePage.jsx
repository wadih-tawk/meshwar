import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import { apiFetch } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.js';
import { useApi } from '../hooks/useApi.js';
import { usePhotoPicker } from '../hooks/usePhotoPicker.js';

function ProfileEditor({ initial }) {
  const { updateUser } = useAuth();
  const photo = usePhotoPicker();
  const [profile, setProfile] = useState(initial);
  const [name, setName] = useState(initial.name);
  const [bio, setBio] = useState(initial.bio);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function saved(next, text) {
    setProfile(next);
    updateUser(next);
    setMessage(text);
    setError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const next = await apiFetch('/api/users/me', { method: 'PUT', body: JSON.stringify({ name, bio }) });
      saved(next, 'Profile saved.');
    } catch (err) {
      setError(err.message);
      setMessage('');
    }
    setBusy(false);
  }

  async function handleUpload() {
    const form = new FormData();
    form.append('photo', photo.file);
    setBusy(true);
    try {
      const next = await apiFetch('/api/users/me/avatar', { method: 'PUT', body: form });
      saved(next, 'Profile photo updated.');
      photo.clear();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function handleRemove() {
    setBusy(true);
    try {
      await apiFetch('/api/users/me/avatar', { method: 'DELETE' });
      saved({ ...profile, avatarUrl: null }, 'Profile photo removed.');
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  const problem = photo.problem || error;

  return (
    <div className="profile-layout">
      <section className="panel profile-card">
        {photo.preview ? <img className="avatar avatar-large" src={photo.preview} alt="New profile photo" /> : <Avatar name={profile.name} url={profile.avatarUrl} size="large" />}
        <h1>{profile.name}</h1>
        <p className="muted">{profile.email}</p>
        {profile.bio && <p className="bio">{profile.bio}</p>}
        <div className="form-actions">
          <label className="button button-quiet file-button">
            {profile.avatarUrl ? 'Change photo' : 'Add a photo'}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={photo.pick} />
          </label>
          {photo.file && (
            <button type="button" className="button" onClick={handleUpload} disabled={busy}>
              {busy ? 'Uploading…' : 'Save photo'}
            </button>
          )}
          {!photo.file && profile.avatarUrl && (
            <button type="button" className="button button-danger" onClick={handleRemove} disabled={busy}>
              Remove photo
            </button>
          )}
        </div>
        <p className="small">JPG, PNG or WebP, up to 5 MB.</p>
        <Link to={`/people/${profile.id}`}>See my public profile and posts</Link>
      </section>

      <form className="panel form" onSubmit={handleSave}>
        <h2>Edit profile</h2>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" value={name} onChange={e => setName(e.target.value)} maxLength={50} required />
        </div>
        <div className="field">
          <label htmlFor="bio">Bio</label>
          <textarea id="bio" rows={4} value={bio} onChange={e => setBio(e.target.value)} maxLength={300} placeholder="Tell people where you like to go…" />
          <p className="small">{bio.length}/300</p>
        </div>
        {message && <p className="success">{message}</p>}
        {problem && (
          <p className="error" role="alert">
            {problem}
          </p>
        )}
        <div className="form-actions">
          <button className="button" disabled={busy}>
            Save profile
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  const { data: profile, loading, error, reload } = useApi('/api/users/me');

  if (loading) {
    return <p className="status">Loading your profile…</p>;
  }
  if (error) {
    return (
      <div className="status" role="alert">
        <p className="error">{error.message}</p>
        <button type="button" className="button button-quiet" onClick={reload}>
          Retry
        </button>
      </div>
    );
  }
  return <ProfileEditor initial={profile} />;
}
