import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, ChevronRight } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';
import { useAuth } from '../context/AuthContext';

const ROUTE_META = {
  '/dashboard':           { crumbs: ['Home', 'Dashboard'] },
  '/my-jobs':             { crumbs: ['Home', 'Jobs'] },
  '/post-job':            { crumbs: ['Home', 'Jobs', 'Post'] },
  '/org/applicants':      { crumbs: ['Home', 'Applicants'] },
  '/contracts':           { crumbs: ['Home', 'Contracts'] },
  '/org/deliveries':      { crumbs: ['Home', 'Deliveries'] },
  '/org/analytics':       { crumbs: ['Home', 'Analytics'] },
  '/payment-history':     { crumbs: ['Home', 'Payments'] },
  '/messages':            { crumbs: ['Home', 'Messages'] },
  '/jobs':                { crumbs: ['Home', 'Jobs'] },
  '/applications':        { crumbs: ['Home', 'Applications'] },
  '/my-assigned-jobs':    { crumbs: ['Home', 'Assigned Work'] },
  '/provider/deliveries': { crumbs: ['Home', 'Deliveries'] },
  '/earnings':            { crumbs: ['Home', 'Earnings'] },
  '/ratings':             { crumbs: ['Home', 'Reviews'] },
  '/admin':               { crumbs: ['Admin', 'Analytics'] },
  '/admin/users':         { crumbs: ['Admin', 'Users'] },
  '/admin/jobs':          { crumbs: ['Admin', 'Jobs'] },
  '/admin/revenue':       { crumbs: ['Admin', 'Revenue'] },
  '/admin/reports':       { crumbs: ['Admin', 'Reports'] },
  '/admin/activity':      { crumbs: ['Admin', 'Activity'] },
  '/profile':             { crumbs: ['Home', 'Profile'] },
  '/subscriptions':       { crumbs: ['Home', 'Subscription'] },
  '/change-password':     { crumbs: ['Home', 'Security'] },
};

function getMeta(pathname) {
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];
  const prefix = Object.keys(ROUTE_META).find(k => k !== '/' && pathname.startsWith(k));
  return prefix ? ROUTE_META[prefix] : { crumbs: ['Home'] };
}

const ROLE_COLORS = {
  admin:        { bg: 'rgba(239,68,68,0.08)',    color: '#f87171',  border: 'rgba(239,68,68,0.15)' },
  organization: { bg: 'rgba(99,102,241,0.08)',   color: '#818cf8',  border: 'rgba(99,102,241,0.15)' },
  provider:     { bg: 'rgba(14,165,233,0.08)',   color: 'var(--brand-blue)', border: 'rgba(14,165,233,0.15)' },
};

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const meta = getMeta(pathname);
  const roleStyle = ROLE_COLORS[user?.role] || ROLE_COLORS.provider;

  return (
    <div className="flex h-[calc(100vh-64px)]" style={{ background: 'var(--bg)' }}>
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header
          className="h-14 shrink-0 flex items-center justify-between px-5 transition-colors duration-200"
          style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden btn-icon"
              aria-label="Open sidebar"
            >
              <Menu size={16} />
            </button>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm">
              {meta.crumbs.map((crumb, i) => (
                <span key={crumb} className="flex items-center gap-1.5">
                  {i > 0 && (
                    <ChevronRight size={11} style={{ color: 'var(--text-disabled)' }} />
                  )}
                  <span
                    className="text-sm"
                    style={{
                      color: i === meta.crumbs.length - 1 ? 'var(--text)' : 'var(--text-muted)',
                      fontWeight: i === meta.crumbs.length - 1 ? 600 : 400,
                    }}
                  >
                    {crumb}
                  </span>
                </span>
              ))}
            </nav>
          </div>

          {/* Role badge */}
          <span
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full capitalize"
            style={{ background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}` }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block bg-emerald-400" />
            {user?.role}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
