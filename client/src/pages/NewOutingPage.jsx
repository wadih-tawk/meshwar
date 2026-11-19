import { useNavigate } from 'react-router-dom';
import OutingForm from '../components/OutingForm.jsx';
import { apiFetch } from '../api/client.js';

export default function NewOutingPage() {
  const navigate = useNavigate();

  async function handleSave(data) {
    const outing = await apiFetch('/api/outings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    navigate(`/outings/${outing._id}`);
  }

  return (
    <>
      <h1>New outing</h1>
      <OutingForm submitLabel="Save outing" onSubmit={handleSave} onCancel={() => navigate('/outings')} />
    </>
  );
}
