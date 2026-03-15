import { useAuth } from '../context/AuthContext';
import OrgDashboard from './OrgDashboard';
import ProviderDashboard from './ProviderDashboard';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'organization') return <OrgDashboard />;
  return <ProviderDashboard />;
}
