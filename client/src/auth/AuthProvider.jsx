import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client.js';
import { AuthContext } from './AuthContext.js';

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(loadUser);

  function saveSession(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  async function login(email, password) {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    saveSession(data);
  }

  async function signup(name, email, password) {
    const data = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    saveSession(data);
  }

  function updateUser(profile) {
    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    function handleExpired() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }
    let ignore = false;
    apiFetch('/api/users/me')
      .then(profile => {
        if (!ignore) {
          localStorage.setItem('user', JSON.stringify(profile));
          setUser(profile);
        }
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [token]);

  const value = { token, user, login, signup, logout, updateUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
