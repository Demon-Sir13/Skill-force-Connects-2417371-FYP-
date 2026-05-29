import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, ChevronRight, Bell } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';
import { useAuth } from '../context/AuthContext';

// Map route → page title + breadcrumb
const ROUTE_META = {
  '/dashboard':           { title: 'Dashboard',       crumbs: ['Home', 'Dashboard'] },
  '/my-jobs':             { title: 'My Jobs',          crumbs: ['Home', 'Jobs'] },
  '/post-job':            { title: 'Post a Job',       crumbs: ['Home', 'Jobs', 'Post'] },
  '/org/applicants':      { title: 'Applicants',       crumbs: ['Home', 'Applicants'] },
  '/contracts':           { title: 'Contracts',        crumbs: ['Home', 'Contracts'] },
  '/org/deliveries':      { title: 'Deliveries',       crumbs: ['Home', 'Deliveries'] },
  '/org/analytics':       { title: 'Analytics',        crumbs: ['Home', 'Analytics'] },
  '/payment-history':     { title: 'Payments',         crumbs: ['Home', 'Payments'] },
  '/messages':            { title: 'Messages',         crumbs: ['Home', 'Messages'] },
  '/jobs':                { title: 'Browse Jobs',      crumbs: ['Home', 'Jobs'] },
  '/applications':        { title: 'Applications',     crumbs: ['Home', 'Applications'] },
  '/my-assigned-jobs':    { title: 'Assigned Work',    crumbs: ['Home', 'Assigned Work'] },
  '/provider/deliveries': { title: 'Deliveries',       crumbs: ['Home', 'Deliveries'] },
  '/earnings':            { title: 'Earnings',         crumbs: ['Home', 'Earnings'] },
  '/ratings':             { title: 'Reviews',          crumbs: ['Home', 'Reviews'] },
  '/admin':               { title: 'Analytics',        crumbs: ['Admin', 'Analytics'] },
  '/admin/users':         { title: 'Users',            crumbs: ['Admin', 'Users'] },
  '/admin/jobs':          { title: 'Jobs',             crumbs: ['Admin', 'Jobs'] },
  '/admin/revenue':       { title: 'Revenue',          crumbs: ['Admin', 'Revenue'] },
  '/admin/reports':       { title: 'Reports',          crumbs: ['Admin', 'Reports'] },
  '/admin/activity':      { title: 'Activity Logs',    crumbs: ['Admin', 'Activity'] },
  '/profile':             { title: 'Profile',          crumbs: ['Home', 'Profile'] },
  '/subscriptions':       { title: 'Subscription',     crumbs: ['Home', 'Subscription'] },
  '/change-password':     { title: 'Security',         crumbs: ['Home', 'Security'] },
};

function getRouteMeta(pathname) {
  // Exact match first
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];
  // Prefix match (e.g. /jobs/123)
  const prefix = Object.keys(ROUTE_META).find(k => k !== '/' && pathname.startsWith(k));
  if (prefix) return ROUTE_META[prefix];
  return { title: 'Dashboard', crumbs: ['Home'] };
}

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const meta = getRouteMeta(pathname);

  return (
    <div className="flex h-[calc(100vh-64px)]" style={{ background: 'var(--bg)' }}>
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top bar ── */}
        <header className="h-14 shrink-0 flex items-center justify-between px-5 border-b transition-colors duration-300"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Open sidebar"
            >
              <Menu size={16} />
            </button>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm">
              {meta.crumbs.map((crumb, i) => (
                <span key={crumb} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight size={12} className="text-gray-700" />}
                  <span className={i === meta.crumbs.length - 1 ? 'text-white font-semibold' : 'text-gray-600'}>
                    {crumb}
                  </span>
                </span>
              ))}
            </nav>
          </div>

          {/* Right side: role badge */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-600 bg-white/[0.03] border border-white/[0.05] px-3 py-1.5 rounded-full capitalize">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              {user?.role}
            </span>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
