import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import {
  Zap, Shield, ChevronDown, LogOut, User, Lock, Star,
  Briefcase, Users, MessageSquare, Bell,
} from 'lucide-react';
import Avatar from './Avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalUnread } = useSocket() || {};
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [dropOpen, setDropOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get('/notifications/unread-count').then(({ data }) => setUnreadCount(data.count)).catch(() => {});
    const interval = setInterval(() => {
      api.get('/notifications/unread-count').then(({ data }) => setUnreadCount(data.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const openNotifications = async () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) {
      try { const { data } = await api.get('/notifications'); setNotifications(data.slice(0, 8)); } catch {}
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); };
  const active = (p) => pathname === p;

  const publicLinks = [
    { to: '/jobs', label: 'Jobs' },
    { to: '/providers', label: 'Providers' },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-surface-bg/70 backdrop-blur-2xl border-b border-surface-border/40 shadow-[0_1px_30px_rgba(0,0,0,0.3)]'
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center
                          shadow-glow-sm group-hover:shadow-glow-blue transition-all duration-500">
            <Zap size={15} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            Skill<span className="gradient-text">Force</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
          {publicLinks.map(({ to, label }) => (
            <Link key={to} to={to} className={`text-sm font-medium transition-all duration-300 relative py-1
              ${active(to) ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              {label}
              {active(to) && (
                <span className="absolute -bottom-[19px] left-0 right-0 h-[2px] bg-gradient-brand rounded-full" />
              )}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" className={`text-sm font-medium flex items-center gap-1.5 transition-all duration-300
              ${active('/admin') ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <Shield size={13} />Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              {/* Notification bell */}
              <div className="relative" ref={notifRef}>
                <button onClick={openNotifications} className="btn-icon relative">
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 glass-card p-0 animate-scale-in z-50 max-h-96 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                      <p className="text-sm font-semibold text-white">Notifications</p>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[11px] text-brand-blue hover:underline">Mark all read</button>
                      )}
                    </div>
                    <div className="overflow-y-auto max-h-72">
                      {notifications.length === 0 ? (
                        <p className="text-center text-gray-600 text-sm py-8">No notifications</p>
                      ) : notifications.map(n => (
                        <div key={n._id}
                          onClick={async () => {
                            if (!n.read) {
                              try { await api.put(`/notifications/${n._id}/read`); } catch {}
                              setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, read: true } : x));
                              setUnreadCount(c => Math.max(0, c - 1));
                            }
                            setNotifOpen(false);
                            const url = n.referenceUrl || (
                              n.type === 'application' ? '/applications' :
                              n.type === 'contract' ? '/contracts' :
                              n.type === 'payment' ? '/subscriptions' :
                              n.relatedId ? `/jobs/${n.relatedId}` : '/dashboard'
                            );
                            navigate(url);
                          }}
                          className={`px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.04] transition-colors cursor-pointer ${!n.read ? 'bg-brand-blue/[0.03]' : ''}`}>
                          <p className="text-xs font-medium text-gray-200">{n.title}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-gray-700 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="tooltip-wrap hidden md:block">
                <Link to="/messages" className="btn-icon relative">
                  <MessageSquare size={16} />
                  {totalUnread > 0 && <span className="notif-dot animate-pulse" />}
                </Link>
                <span className="tooltip">Messages{totalUnread > 0 ? ` (${totalUnread})` : ''}</span>
              </div>

              {/* User dropdown */}
              <div className="relative" ref={dropRef}>
                <button onClick={() => setDropOpen(!dropOpen)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all duration-300
                    ${dropOpen
                      ? 'border-brand-blue/30 bg-brand-blue/[0.05]'
                      : 'border-transparent hover:border-white/[0.06] hover:bg-white/[0.03]'}`}>
                  <Avatar src={user.profileImage} name={user.name} size="sm" />
                  <span className="text-sm text-gray-400 max-w-[100px] truncate hidden sm:block">{user.name}</span>
                  <ChevronDown size={13} className={`text-gray-600 transition-transform duration-300 ${dropOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 glass-card p-1.5 animate-scale-in z-50">
                    <div className="px-3 py-2.5 mb-1 border-b border-white/[0.06]">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-500 capitalize">{user.role}</p>
                    </div>
                    {[
                      { to: '/dashboard', icon: Zap, label: 'Dashboard' },
                      { to: '/profile', icon: User, label: 'Profile' },
                      { to: '/change-password', icon: Lock, label: 'Change Password' },
                    ].map(({ to, icon: Icon, label }) => (
                      <Link key={to} to={to} onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/[0.04] hover:text-white transition-all duration-200">
                        <Icon size={14} className="text-gray-600" />
                        {label}
                      </Link>
                    ))}
                    {user?.role === 'provider' && (
                      <Link to="/ratings" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/[0.04] hover:text-white transition-all duration-200">
                        <Star size={14} className="text-gray-600" />My Ratings
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link to="/admin" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400/80 hover:bg-red-500/[0.06] transition-all duration-200">
                        <Shield size={14} />Admin Panel
                      </Link>
                    )}
                    <div className="divider my-1" />
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400/80 hover:bg-red-500/[0.06] transition-all duration-200">
                      <LogOut size={14} />Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-sm px-4 py-2">Login</Link>
              <Link to="/register" className="btn-primary text-sm px-5 py-2">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
