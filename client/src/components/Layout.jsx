import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';

export default function Layout() {
  const { logout } = useAuth();

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/outings" className="brand">
            <img src="/favicon.svg" alt="" className="brand-logo" />
            Meshwar
          </Link>
          <nav className="topbar-actions">
            <NavLink to="/outings" end className="nav-link">
              My outings
            </NavLink>
            <Link to="/outings/new" className="button button-light">
              + New
            </Link>
            <button type="button" className="button button-ghost" onClick={logout}>
              Log out
            </button>
          </nav>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
      <footer className="footer">
        <p>Meshwar · Weather by Open-Meteo · Places and photos from Wikipedia · Maps by Google</p>
      </footer>
    </>
  );
}
