import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="auth">
      <div className="auth-card">
        <p className="brand">Meshwar</p>
        <h1>Page not found</h1>
        <p className="muted">There is nothing at this address.</p>
        <Link to="/outings" className="button">
          Go to my outings
        </Link>
      </div>
    </main>
  );
}
