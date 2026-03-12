import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Spinner shown while auth state is resolving
const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
  </div>
);

/**
 * PrivateRoute — requires authentication.
 * Optionally restrict to specific roles: <PrivateRoute roles={['admin']} />
 */
export const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

/**
 * AdminRoute — shorthand for admin-only pages.
 */
export const AdminRoute = ({ children }) => (
  <PrivateRoute roles={['admin']}>{children}</PrivateRoute>
);

/**
 * GuestRoute — redirects logged-in users away from login/register.
 */
export const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};
