import { useState } from 'react';
import { useAuth } from './auth/AuthContext.js';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';

export default function App() {
  const { token, logout } = useAuth();
  const [screen, setScreen] = useState('login');

  if (token) {
    return (
      <main>
        <h1>Meshwar</h1>
        <p>You are logged in.</p>
        <button type="button" onClick={logout}>
          Log out
        </button>
      </main>
    );
  }

  if (screen === 'signup') {
    return <SignupPage onShowLogin={() => setScreen('login')} />;
  }
  return <LoginPage onShowSignup={() => setScreen('signup')} />;
}
