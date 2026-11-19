import { useLocation, useNavigate } from 'react-router-dom';
import OutingForm from '../components/OutingForm.jsx';
import { apiFetch } from '../api/client.js';

export default function NewOutingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const idea = location.state;

  async function handleSave(data) {
    const outing = await apiFetch('/api/outings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    navigate(`/outings/${outing._id}`);
  }

  const initial = idea
    ? { title: idea.suggestion.title, activity: idea.suggestion.activity, place: idea.suggestion.place, date: idea.date, notes: '' }
    : undefined;

  return (
    <>
      <h1>{idea ? `Plan an outing to ${idea.suggestion.place.name}` : 'New outing'}</h1>
      {idea && <p className="muted">We filled in the form from the idea. Change anything you like, then save.</p>}
      <OutingForm initial={initial} submitLabel="Save outing" onSubmit={handleSave} onCancel={() => navigate('/outings')} />
    </>
  );
}
