import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import {
  LayoutDashboard, Briefcase, Users, ListChecks, MessageSquare,
  DollarSign, Star, User, Lock, LogOut, Zap, X,
  FileText, Receipt, Crown, BarChart2, Activity, ClipboardList,
  Package,
} from 'lucide-react';
import Avatar from './Avatar';
import ThemeToggle from './ThemeToggle';

const ORG_SECTIONS = [
  { label: 'Main', links: [
    { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/my-jobs',        icon: Briefcase,       label: 'Jobs' },
    { to: '/org/applicants', icon: Users,           label: 'Applicants' },
    { to: '/contracts',      icon: FileText,        label: 'Contracts' },
    { to: '/org/deliveries', icon: Package,         label: 'Deliveries' },
  ]},
  { label: 'Insights', links: [
    { to: '/org/analytics',   icon: BarChart2,  label: 'Analytics' },
    { to: '/payment-history', icon: Receipt,    label: 'Payments' },
  ]},
  { label: 'Communication', links: [
    { to: '/messages', icon: MessageSquare, label: 'Messages', badge: true },
  ]},
];

const PROVIDER_SECTIONS = [
  { label: 'Main', links: [
    { to: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/jobs',                icon: Briefcase,       label: 'Browse Jobs' },
    { to: '/applications',        icon: ClipboardList,   label: 'Applications' },
    { to: '/my-assigned-jobs',    icon: ListChecks,      label: 'Assigned Work' },
    { to: '/provider/deliveries', icon: Package,         label: 'Deliveries' },
  ]},
  { label: 'Earnings', links: [
    { to: '/earnings', icon: DollarSign, label: 'Earnings' },
    { to: '/ratings',  icon: Star,       label: 'Reviews' },
  ]},
  { label: 'Communication', links: [
    { to: '/messages', icon: MessageSquare, label: 'Messages', badge: true },
  ]},
];

const ADMIN_SECTIONS = [
  { label: 'Overview', links: [
    { to: '/admin',       icon: LayoutDashboard, label: 'Analytics' },
    { to: '/admin/users', icon: Users,           label: 'Users' },
    { to: '/admin/jobs',  icon: Briefcase,       label: 'Jobs' },
  ]},
  { label: 'Finance', links: [
    { to: '/admin/revenue',  icon: DollarSign, label: 'Revenue' },
    { to: '/admin/reports',  icon: BarChart2,  label: 'Reports' },
  ]},
  { label: 'System', links: [
    { to: '/admin/activity', icon: Activity, label: 'Activity Logs' },
  ]},
];

const BOTTOM_LINKS = [
  { to: '/profile',         icon: User,  label: 'Profile' },
  { to: '/subscriptions',   icon: Crown, label: 'Subscription' },
  { to: '/change-password', icon: Lock,  label: 'Security' },
];

export default function DashboardSidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { totalUnread }  = useSocket() || {};
  const navigate         = useNavigate();
  const { pathname }     = useLocation();
  const [plan, setPlan]  = useState(null);

  useEffect(() => {
    if (!user) return;
    api.get('/payments/subscription-status')
      .then(({ data }) => { if (data.plan && data.plan !== 'free') setPlan(data.plan); })
      .catch(() => {});
  }, [user]);

  const sections =
    user?.role === 'admin'        ? ADMIN_SECTIONS :
    user?.role === 'organization' ? ORG_SECTIONS   : PROVIDER_SECTIONS;

  const handleLogout = () => { logout(); navigate('/'); onClose?.(); };

  const isActive = (to, exact) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + '/');

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[240px] flex flex-col
          transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:z-auto`}
        style={{
          background: 'var(--card)',
          borderRight: '1px solid var(--border)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <NavLink to="/" className="flex items-center gap-2.5 group" onClick={onClose}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-indigo))' }}>
              <Zap size={13} className="text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text)' }}>
              Skill<span className="gradient-text">Force</span>
            </span>
          </NavLink>
          <button onClick={onClose} className="md:hidden btn-icon" aria-label="Close">
            <X size={15} />
          </button>
        </div>

        {/* User card */}
        <div className="px-4 py-3.5 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <Avatar src={user?.profileImage} name={user?.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate leading-tight" style={{ color: 'var(--text)' }}>
                {user?.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[11px] capitalize" style={{ color: 'var(--text-muted)' }}>
                  {user?.role}
                </p>
                {plan && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    plan === 'enterprise'
                      ? 'bg-yellow-400/15 text-yellow-500 border border-yellow-400/25'
                      : 'bg-brand-blue/15 text-brand-blue border border-brand-blue/25'
                  }`}>
                    {plan.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-hide">
          {sections.map(({ label, links }) => (
            <div key={label}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] px-3 mb-1.5"
                style={{ color: 'var(--text-disabled)' }}>
                {label}
              </p>
              <div className="space-y-0.5">
                {links.map(({ to, icon: Icon, label: lbl, badge }) => {
                  const active = isActive(to, to === '/dashboard' || to === '/admin');
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/dashboard' || to === '/admin'}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                      style={{
                        background: active ? 'rgba(14,165,233,0.08)' : 'transparent',
                        color: active ? 'var(--brand-blue)' : 'var(--text-muted)',
                        border: active ? '1px solid rgba(14,165,233,0.12)' : '1px solid transparent',
                      }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--hover)'; e.currentTarget.style.color = 'var(--text)'; }}}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}}
                    >
                      <Icon size={15} className="shrink-0" />
                      <span className="flex-1 truncate">{lbl}</span>
                      {badge && totalUnread > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1 shrink-0">
                          {totalUnread > 99 ? '99+' : totalUnread}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Account */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] px-3 mb-1.5"
              style={{ color: 'var(--text-disabled)' }}>
              Account
            </p>
            <div className="space-y-0.5">
              {BOTTOM_LINKS.map(({ to, icon: Icon, label: lbl }) => {
                const active = isActive(to, false);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      background: active ? 'rgba(14,165,233,0.08)' : 'transparent',
                      color: active ? 'var(--brand-blue)' : 'var(--text-muted)',
                      border: active ? '1px solid rgba(14,165,233,0.12)' : '1px solid transparent',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--hover)'; e.currentTarget.style.color = 'var(--text)'; }}}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}}
                  >
                    <Icon size={15} className="shrink-0" />
                    <span className="truncate">{lbl}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Bottom: theme toggle + logout */}
        <div className="px-3 py-3 shrink-0 flex items-center gap-2"
          style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{ color: 'rgba(248,113,113,0.7)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,113,113,0.7)'; }}
          >
            <LogOut size={15} className="shrink-0" />
            <span>Sign Out</span>
          </button>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
