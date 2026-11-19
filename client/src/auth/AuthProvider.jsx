import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client.js';
import { AuthContext } from './AuthContext.js';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  function saveToken(newToken) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  }

  async function login(email, password) {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    saveToken(data.token);
  }

  async function signup(name, email, password) {
    const data = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    saveToken(data.token);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
  }

  useEffect(() => {
    function handleExpired() {
      localStorage.removeItem('token');
      setToken(null);
    }
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const value = { token, login, signup, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
