import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { PrivateRoute, AdminRoute, GuestRoute } from './components/RouteGuard';
import ErrorBoundary from './components/ErrorBoundary';

import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import PostJob from './pages/PostJob';
import Providers from './pages/Providers';
import ProviderProfile from './pages/ProviderProfile';
import MyJobs from './pages/MyJobs';
import MyAssignedJobs from './pages/MyAssignedJobs';
import Earnings from './pages/Earnings';
import Ratings from './pages/Ratings';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import ChangePassword from './pages/ChangePassword';
import AdminDashboard from './pages/AdminDashboard';
import Applications from './pages/Applications';
import Subscriptions from './pages/Subscriptions';
import Contracts from './pages/Contracts';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

const WithSidebar = ({ children }) => (
  <DashboardLayout>{children}</DashboardLayout>
);

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route path="/providers" element={<Providers />} />
      <Route path="/providers/:userId" element={<ProviderProfile />} />

      {/* Guest only */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* Payment return pages */}
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failure" element={<PaymentFailure />} />

      {/* Authenticated with sidebar */}
      <Route path="/dashboard" element={<PrivateRoute><WithSidebar><Dashboard /></WithSidebar></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><WithSidebar><Profile /></WithSidebar></PrivateRoute>} />
      <Route path="/messages" element={<PrivateRoute><WithSidebar><Messages /></WithSidebar></PrivateRoute>} />
      <Route path="/messages/:userId" element={<PrivateRoute><WithSidebar><Messages /></WithSidebar></PrivateRoute>} />
      <Route path="/change-password" element={<PrivateRoute><WithSidebar><ChangePassword /></WithSidebar></PrivateRoute>} />
      <Route path="/subscriptions" element={<PrivateRoute><WithSidebar><Subscriptions /></WithSidebar></PrivateRoute>} />
      <Route path="/contracts" element={<PrivateRoute><WithSidebar><Contracts /></WithSidebar></PrivateRoute>} />

      {/* Organization only */}
      <Route path="/post-job" element={<PrivateRoute roles={['organization']}><WithSidebar><PostJob /></WithSidebar></PrivateRoute>} />
      <Route path="/my-jobs" element={<PrivateRoute roles={['organization']}><WithSidebar><MyJobs /></WithSidebar></PrivateRoute>} />

      {/* Provider only */}
      <Route path="/my-assigned-jobs" element={<PrivateRoute roles={['provider']}><WithSidebar><MyAssignedJobs /></WithSidebar></PrivateRoute>} />
      <Route path="/earnings" element={<PrivateRoute roles={['provider']}><WithSidebar><Earnings /></WithSidebar></PrivateRoute>} />
      <Route path="/ratings" element={<PrivateRoute roles={['provider']}><WithSidebar><Ratings /></WithSidebar></PrivateRoute>} />
      <Route path="/applications" element={<PrivateRoute roles={['provider']}><WithSidebar><Applications /></WithSidebar></PrivateRoute>} />

      {/* Admin only */}
      <Route path="/admin" element={<AdminRoute><WithSidebar><AdminDashboard /></WithSidebar></AdminRoute>} />
    </Routes>

    <Toaster
      position="top-right"
      gutter={10}
      toastOptions={{
        duration: 3500,
        style: {
          background: '#11161E',
          color: '#f1f5f9',
          border: '1px solid #1E2530',
          borderRadius: '14px',
          fontSize: '13px',
          padding: '12px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        },
        success: { iconTheme: { primary: '#10B981', secondary: '#11161E' }, style: { borderColor: '#10B981/30' } },
        error: { iconTheme: { primary: '#EF4444', secondary: '#11161E' }, style: { borderColor: 'rgba(239,68,68,0.3)' } },
        loading: { iconTheme: { primary: '#0EA5E9', secondary: '#11161E' } },
      }}
    />
  </>
);

const AuthenticatedApp = () => {
  const { user } = useAuth();
  return (
    <SocketProvider token={user?.token} userId={user?._id}>
      <AppRoutes />
    </SocketProvider>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}
