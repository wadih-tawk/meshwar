import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';

export default function Layout() {
  const { logout } = useAuth();

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/outings" className="brand">
            Meshwar
          </Link>
          <nav className="topbar-actions">
            <Link to="/outings/new" className="button">
              + New
            </Link>
            <button type="button" className="button button-quiet" onClick={logout}>
              Log out
            </button>
          </nav>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </>
  );
}
