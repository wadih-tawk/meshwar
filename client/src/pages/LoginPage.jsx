import { useState } from 'react';
import { useAuth } from '../auth/AuthContext.js';

export default function LoginPage({ onShowSignup }) {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    setBusy(true);
    setError('');
    try {
      await login(form.get('email'), form.get('password'));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className="auth">
      <div className="auth-card">
        <p className="brand">Meshwar</p>
        <h1>Log in</h1>
        <p className="muted">Plan your outings around the weather.</p>
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="small">
          No account yet?{' '}
          <button type="button" onClick={onShowSignup}>
            Sign up
          </button>
        </p>
      </div>
    </main>
  );
}
