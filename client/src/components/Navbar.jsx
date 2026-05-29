import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import {
  Zap, Shield, ChevronDown, LogOut, User, Lock, Star,
  MessageSquare, Bell,
} from 'lucide-react';
import Avatar from './Avatar';
import ThemeToggle from './ThemeToggle';

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
    const t = setInterval(() => {
      api.get('/notifications/unread-count').then(({ data }) => setUnreadCount(data.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(t);
  }, [user]);

  const openNotifications = async () => {
    setNotifOpen(v => !v);
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
  const isActive = (p) => pathname === p;

  const publicLinks = [
    { to: '/jobs',      label: 'Jobs' },
    { to: '/providers', label: 'Providers' },
    { to: '/about',     label: 'About' },
    { to: '/investor',  label: 'Investors' },
  ];

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={scrolled ? {
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 20px rgba(0,0,0,0.08)',
      } : { background: 'transparent', borderBottom: '1px solid transparent' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-indigo))' }}>
            <Zap size={15} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--text)' }}>
            Skill<span className="gradient-text">Force</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-7 flex-1 justify-center">
          {publicLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-sm font-medium transition-all duration-200 relative py-1"
              style={{ color: isActive(to) ? 'var(--text)' : 'var(--text-muted)' }}
            >
              {label}
              {isActive(to) && (
                <span className="absolute -bottom-[19px] left-0 right-0 h-[2px] rounded-full"
                  style={{ background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-indigo))' }} />
              )}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin"
              className="text-sm font-medium flex items-center gap-1.5 transition-all duration-200"
              style={{ color: isActive('/admin') ? 'var(--text)' : 'var(--text-muted)' }}>
              <Shield size={13} />Admin
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ThemeToggle />

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
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50 max-h-96 animate-scale-in"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-hover)' }}>
                    <div className="flex items-center justify-between px-4 py-3"
                      style={{ borderBottom: '1px solid var(--border)' }}>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Notifications</p>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[11px] text-brand-blue hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="overflow-y-auto max-h-72">
                      {notifications.length === 0 ? (
                        <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>
                          No notifications
                        </p>
                      ) : notifications.map(n => (
                        <div
                          key={n._id}
                          onClick={async () => {
                            if (!n.read) {
                              try { await api.put(`/notifications/${n._id}/read`); } catch {}
                              setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, read: true } : x));
                              setUnreadCount(c => Math.max(0, c - 1));
                            }
                            setNotifOpen(false);
                            navigate(n.referenceUrl || (
                              n.type === 'application' ? '/applications' :
                              n.type === 'contract' ? '/contracts' :
                              n.type === 'payment' ? '/subscriptions' :
                              n.relatedId ? `/jobs/${n.relatedId}` : '/dashboard'
                            ));
                          }}
                          className="px-4 py-3 cursor-pointer transition-colors"
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            background: !n.read ? 'rgba(14,165,233,0.03)' : 'transparent',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = !n.read ? 'rgba(14,165,233,0.03)' : 'transparent'}
                        >
                          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{n.title}</p>
                          <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{n.message}</p>
                          <p className="text-[10px] mt-1" style={{ color: 'var(--text-disabled)' }}>
                            {new Date(n.createdAt).toLocaleDateString()}
                          </p>
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
                  {totalUnread > 0 && <span className="notif-dot" />}
                </Link>
                <span className="tooltip">Messages{totalUnread > 0 ? ` (${totalUnread})` : ''}</span>
              </div>

              {/* User dropdown */}
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen(v => !v)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-200"
                  style={{
                    border: `1px solid ${dropOpen ? 'rgba(14,165,233,0.3)' : 'var(--border)'}`,
                    background: dropOpen ? 'rgba(14,165,233,0.05)' : 'transparent',
                  }}
                >
                  <Avatar src={user.profileImage} name={user.name} size="sm" />
                  <span className="text-sm max-w-[100px] truncate hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
                    {user.name}
                  </span>
                  <ChevronDown size={13} className={`transition-transform duration-300 ${dropOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--text-muted)' }} />
                </button>

                {dropOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl p-1.5 z-50 animate-scale-in"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-hover)' }}>
                    <div className="px-3 py-2.5 mb-1" style={{ borderBottom: '1px solid var(--border)' }}>
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{user.name}</p>
                      <p className="text-[11px] capitalize" style={{ color: 'var(--text-muted)' }}>{user.role}</p>
                    </div>
                    {[
                      { to: '/dashboard',       icon: Zap,  label: 'Dashboard' },
                      { to: '/profile',         icon: User, label: 'Profile' },
                      { to: '/change-password', icon: Lock, label: 'Change Password' },
                    ].map(({ to, icon: Icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover)'; e.currentTarget.style.color = 'var(--text)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        <Icon size={14} style={{ color: 'var(--text-muted)' }} />
                        {label}
                      </Link>
                    ))}
                    {user?.role === 'provider' && (
                      <Link to="/ratings" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover)'; e.currentTarget.style.color = 'var(--text)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                        <Star size={14} style={{ color: 'var(--text-muted)' }} />My Ratings
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link to="/admin" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200"
                        style={{ color: '#f87171' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Shield size={14} />Admin Panel
                      </Link>
                    )}
                    <div className="divider my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200"
                      style={{ color: '#f87171' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
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
