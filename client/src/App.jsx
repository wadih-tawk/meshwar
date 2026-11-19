import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import OutingsPage from './pages/OutingsPage.jsx';
import NewOutingPage from './pages/NewOutingPage.jsx';
import OutingPage from './pages/OutingPage.jsx';
import EditOutingPage from './pages/EditOutingPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import IdeaPage from './pages/IdeaPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/outings" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/outings" element={<OutingsPage />} />
          <Route path="/outings/new" element={<NewOutingPage />} />
          <Route path="/outings/:id" element={<OutingPage />} />
          <Route path="/outings/:id/edit" element={<EditOutingPage />} />
          <Route path="/ideas/:slug" element={<IdeaPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
