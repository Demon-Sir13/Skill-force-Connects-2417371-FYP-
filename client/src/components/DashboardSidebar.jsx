import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  LayoutDashboard, Briefcase, Users, Plus, ListChecks, MessageSquare,
  DollarSign, Star, User, Lock, LogOut, Shield, Zap, X, TrendingUp,
  ChevronLeft, FileText,
} from 'lucide-react';
import Avatar from './Avatar';

const orgLinks = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/post-job',      icon: Plus,            label: 'Post Job' },
  { to: '/my-jobs',       icon: ListChecks,      label: 'My Jobs' },
  { to: '/providers',     icon: Users,           label: 'Providers' },
  { to: '/jobs',          icon: Briefcase,       label: 'Browse Jobs' },
  { to: '/contracts',     icon: FileText,        label: 'Contracts' },
  { to: '/subscriptions', icon: TrendingUp,      label: 'Subscription' },
  { to: '/messages',      icon: MessageSquare,   label: 'Messages', badge: true },
];

const providerLinks = [
  { to: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs',             icon: Briefcase,       label: 'Browse Jobs' },
  { to: '/my-assigned-jobs', icon: ListChecks,      label: 'My Jobs' },
  { to: '/applications',     icon: ListChecks,      label: 'Applications' },
  { to: '/contracts',        icon: FileText,        label: 'Contracts' },
  { to: '/earnings',         icon: DollarSign,      label: 'Earnings' },
  { to: '/ratings',          icon: Star,            label: 'Ratings' },
  { to: '/subscriptions',    icon: TrendingUp,      label: 'Subscription' },
  { to: '/messages',         icon: MessageSquare,   label: 'Messages', badge: true },
];

const adminLinks = [
  { to: '/admin',     icon: Shield,          label: 'Admin Panel' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs',      icon: Briefcase,       label: 'Browse Jobs' },
  { to: '/messages',  icon: MessageSquare,   label: 'Messages', badge: true },
];

const bottomLinks = [
  { to: '/profile',         icon: User, label: 'Profile' },
  { to: '/change-password', icon: Lock, label: 'Security' },
];

export default function DashboardSidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { totalUnread } = useSocket() || {};
  const navigate = useNavigate();

  const links =
    user?.role === 'admin'        ? adminLinks :
    user?.role === 'organization' ? orgLinks   : providerLinks;

  const handleLogout = () => { logout(); navigate('/'); onClose?.(); };

  const linkCls = ({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden animate-fade-in" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-[260px] bg-surface-sidebar border-r border-surface-border/40
        flex flex-col transition-transform duration-500 ease-smooth
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-auto
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-surface-border/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow-sm">
              <Zap size={13} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">
              Skill<span className="gradient-text">Force</span>
            </span>
          </div>
          <button onClick={onClose} className="btn-icon md:hidden" aria-label="Close sidebar">
            <X size={16} />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-surface-border/40 shrink-0">
          <div className="flex items-center gap-3">
            <Avatar src={user?.profileImage} name={user?.name} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-gray-600 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4 space-y-0.5">
          <p className="text-[10px] font-medium text-gray-700 uppercase tracking-widest px-3 mb-2">Menu</p>
          {links.map(({ to, icon: Icon, label, badge }) => (
            <NavLink key={to} to={to} end={to === '/dashboard'} className={linkCls} onClick={onClose}>
              <Icon size={16} className="shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              {badge && totalUnread > 0 && (
                <span className="bg-red-500/90 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </NavLink>
          ))}

          <div className="divider my-4" />
          <p className="text-[10px] font-medium text-gray-700 uppercase tracking-widest px-3 mb-2">Account</p>

          {bottomLinks.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={linkCls} onClick={onClose}>
              <Icon size={16} className="shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-surface-border/40 shrink-0">
          <button onClick={handleLogout}
            className="sidebar-link w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06]">
            <LogOut size={16} className="shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
