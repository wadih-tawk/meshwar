import { useState } from 'react';
import { useAuth } from '../auth/AuthContext.js';

export default function SignupPage({ onShowLogin }) {
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    setBusy(true);
    setError('');
    try {
      await signup(form.get('name'), form.get('email'), form.get('password'));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className="auth">
      <div className="auth-card">
        <p className="brand">Meshwar</p>
        <h1>Sign up</h1>
        <p className="muted">Save your outings and see the forecast for each one.</p>
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" autoComplete="name" maxLength={50} required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required />
            <p className="small">At least 8 characters.</p>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy ? 'Creating your account…' : 'Sign up'}
          </button>
        </form>
        <p className="small">
          Already have an account?{' '}
          <button type="button" onClick={onShowLogin}>
            Log in
          </button>
        </p>
      </div>
    </main>
  );
}
