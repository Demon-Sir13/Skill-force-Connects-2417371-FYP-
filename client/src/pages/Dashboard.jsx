import { useAuth } from '../context/AuthContext';
import OrgDashboard from './OrgDashboard';
import ProviderDashboard from './ProviderDashboard';
import { Navigate } from 'react-router-dom';
import { PageLoader } from '../components/Spinner';

export default function Dashboard() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'organization') return <OrgDashboard />;
  return <ProviderDashboard />;
}
