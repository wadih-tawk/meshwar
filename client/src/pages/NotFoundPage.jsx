import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';

export default function NotFoundPage() {
  return (
    <AuthLayout title="Page not found" subtitle="There is nothing at this address.">
      <Link to="/outings" className="button">
        Go to my outings
      </Link>
    </AuthLayout>
  );
}
