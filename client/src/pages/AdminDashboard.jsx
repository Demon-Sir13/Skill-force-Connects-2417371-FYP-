import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Shield, Users, Briefcase, TrendingUp, CheckCircle, Trash2, Search,
  ChevronDown, Ban, RotateCcw, DollarSign, AlertTriangle, Clock,
  Eye, CheckSquare, XSquare, BarChart2, Activity, UserX, Flag,
  FileText, BadgeCheck, Crown, ShieldCheck, XCircle,
} from 'lucide-react';
import Avatar from '../components/Avatar';

const ROLES = ['organization', 'provider', 'admin'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const roleBadge = { admin: 'badge-red', organization: 'badge-indigo', provider: 'badge-blue' };
const statusBadge = { open: 'badge-blue', 'in-progress': 'badge-yellow', completed: 'badge-green' };
const reportBadge = { pending: 'badge-yellow', reviewed: 'badge-blue', dismissed: 'badge-gray' };
const verifyBadge = { pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red' };

function BarChart({ data, color = '#0EA5E9', label }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">{label}</p>
      <div className="flex items-end gap-1.5 h-20">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-sm transition-all" style={{ height: `${(d.count / max) * 100}%`, background: color, opacity: 0.85 }} />
            <span className="text-[9px] text-gray-600">{MONTHS[d._id.month - 1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuspendModal({ user, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center"><Ban size={18} className="text-yellow-400" /></div>
          <div><h3 className="font-semibold text-white">Suspend User</h3><p className="text-xs text-gray-500">{user.name}</p></div>
        </div>
        <label className="label">Reason (optional)</label>
        <input className="input mb-5" placeholder="e.g. Violation of terms" value={reason} onChange={e => setReason(e.target.value)} />
        <div className="flex gap-3">
          <button className="btn-outline flex-1" onClick={onClose}>Cancel</button>
          <button className="btn-danger flex-1" onClick={() => onConfirm(reason)}>Suspend</button>
        </div>
      </div>
    </div>
  );
}

function ReportModal({ report, onClose, onUpdate }) {
  const [note, setNote] = useState(report.adminNote || '');
  const handle = (status) => onUpdate(report._id, status, note);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-lg p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center"><Flag size={18} className="text-red-400" /></div>
          <div><h3 className="font-semibold text-white">Report Details</h3><p className="text-xs text-gray-500">Filed by {report.reportedBy?.name}</p></div>
          <span className={`${reportBadge[report.status]} ml-auto`}>{report.status}</span>
        </div>
        <div className="space-y-3 mb-5">
          <div className="bg-surface-hover rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Target</p><p className="text-sm text-white capitalize">{report.targetType} · <span className="text-gray-400 font-mono text-xs">{report.targetId}</span></p></div>
          <div className="bg-surface-hover rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Reason</p><p className="text-sm text-white">{report.reason}</p></div>
          {report.details && <div className="bg-surface-hover rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Details</p><p className="text-sm text-gray-300">{report.details}</p></div>}
        </div>
        <label className="label">Admin Note</label>
        <textarea className="input mb-5 resize-none" rows={2} placeholder="Internal note..." value={note} onChange={e => setNote(e.target.value)} />
        <div className="flex gap-2">
          <button className="btn-outline flex-1 text-xs" onClick={onClose}>Close</button>
          <button className="btn-ghost flex-1 text-xs flex items-center justify-center gap-1.5 text-gray-400 hover:text-white" onClick={() => handle('dismissed')}><XSquare size={13} />Dismiss</button>
          <button className="btn-primary flex-1 text-xs flex items-center justify-center gap-1.5" onClick={() => handle('reviewed')}><CheckSquare size={13} />Mark Reviewed</button>
        </div>
      </div>
    </div>
  );
}

const TABS = ['Overview', 'Users', 'Jobs', 'Verification', 'Reports', 'Activity'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatus, setJobStatus] = useState('');
  const [reports, setReports] = useState([]);
  const [reportStatus, setReportStatus] = useState('');
  const [reportDetail, setReportDetail] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [revenue, setRevenue] = useState(null);

  const fetchStats = useCallback(() =>
    api.get('/admin/stats').then(({ data }) => setStats(data)).catch(() => {}).finally(() => setLoadingStats(false))
  , []);

  const fetchUsers = useCallback(() => {
    const params = {};
    if (userSearch) params.search = userSearch;
    if (roleFilter) params.role = roleFilter;
    if (statusFilter) params.status = statusFilter;
    api.get('/admin/users', { params }).then(({ data }) => setUsers(data)).catch(() => {});
  }, [userSearch, roleFilter, statusFilter]);

  const fetchJobs = useCallback(() => {
    const params = {};
    if (jobSearch) params.search = jobSearch;
    if (jobStatus) params.status = jobStatus;
    api.get('/admin/jobs', { params }).then(({ data }) => setJobs(data)).catch(() => {});
  }, [jobSearch, jobStatus]);

  const fetchReports = useCallback(() => {
    const params = {};
    if (reportStatus) params.status = reportStatus;
    api.get('/admin/reports', { params }).then(({ data }) => setReports(data)).catch(() => {});
  }, [reportStatus]);

  const fetchActivityLogs = useCallback(() => {
    setActivityLoading(true);
    api.get('/admin/activity-logs', { params: { limit: 100 } }).then(({ data }) => setActivityLogs(data)).catch(() => {}).finally(() => setActivityLoading(false));
  }, []);

  useEffect(() => {
    fetchStats();
    api.get('/admin/revenue').then(({ data }) => setRevenue(data)).catch(() => {});
  }, [fetchStats]);
  useEffect(() => { if (tab === 'Users' || tab === 'Verification') { const t = setTimeout(fetchUsers, 300); return () => clearTimeout(t); } }, [tab, fetchUsers]);
  useEffect(() => { if (tab === 'Jobs') { const t = setTimeout(fetchJobs, 300); return () => clearTimeout(t); } }, [tab, fetchJobs]);
  useEffect(() => { if (tab === 'Reports') fetchReports(); }, [tab, fetchReports]);
  useEffect(() => { if (tab === 'Activity') fetchActivityLogs(); }, [tab, fetchActivityLogs]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This is permanent.`)) return;
    try { await api.delete(`/admin/users/${id}`); toast.success('User deleted'); fetchUsers(); fetchStats(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };
  const handleRoleChange = async (id, role) => {
    try { await api.put(`/admin/users/${id}/role`, { role }); toast.success('Role updated'); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };
  const handleSuspend = async (reason) => {
    try { await api.put(`/admin/users/${suspendTarget._id}/suspend`, { reason }); toast.success('User suspended'); setSuspendTarget(null); fetchUsers(); fetchStats(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleUnsuspend = async (id) => {
    try { await api.put(`/admin/users/${id}/unsuspend`); toast.success('User unsuspended'); fetchUsers(); fetchStats(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleVerify = async (id) => {
    try { const { data } = await api.put(`/admin/users/${id}/verify`); toast.success(data.message); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleDeleteJob = async (id, title) => {
    if (!window.confirm(`Delete job "${title}"?`)) return;
    try { await api.delete(`/admin/jobs/${id}`); toast.success('Job deleted'); fetchJobs(); fetchStats(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleUpdateReport = async (id, status, adminNote) => {
    try { await api.put(`/admin/reports/${id}`, { status, adminNote }); toast.success('Report updated'); setReportDetail(null); fetchReports(); fetchStats(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleProviderVerification = async (userId, status) => {
    try { await api.put(`/admin/providers/${userId}/verification`, { status }); toast.success(`Provider ${status}`); fetchUsers(); fetchStats(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleJobApproval = async (jobId, approvalStatus) => {
    try { await api.put(`/admin/jobs/${jobId}/approval`, { approvalStatus }); toast.success(`Job ${approvalStatus}`); fetchJobs(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
    { label: 'Providers', value: stats.totalProviders || 0, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { label: 'Organizations', value: stats.totalOrganizations || 0, icon: Briefcase, color: 'text-brand-indigo', bg: 'bg-brand-indigo/10' },
    { label: 'Est. Revenue', value: `₨${stats.totalRevenue?.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Open Jobs', value: stats.openJobs, icon: Clock, color: 'text-sky-400', bg: 'bg-sky-400/10' },
    { label: 'In Progress', value: stats.inProgressJobs, icon: Activity, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Completed', value: stats.completedJobs, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Applications', value: stats.totalApplications || 0, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Suspended', value: stats.suspendedUsers, icon: UserX, color: 'text-red-400', bg: 'bg-red-400/10' },
  ] : [];

  return (
    <div className="page">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <Shield size={20} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-500 text-sm">Platform management & oversight</p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-surface-card rounded-xl border border-surface-border mb-8 w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-gradient-brand text-white shadow-glow-sm' : 'text-gray-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'Overview' && (
        <>
          {loadingStats ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(8)].map((_, i) => <div key={i} className="card h-28 animate-pulse bg-surface-hover" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="stat-card">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}><Icon size={18} className={color} /></div>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-gray-500 text-xs">{label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {stats?.byRole && (
              <div className="card p-5">
                <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Users size={14} className="text-brand-blue" />Users by Role</p>
                <div className="space-y-3">
                  {stats.byRole.map(r => {
                    const pct = stats.totalUsers ? Math.round((r.count / stats.totalUsers) * 100) : 0;
                    return (
                      <div key={r._id}>
                        <div className="flex justify-between text-xs mb-1"><span className="capitalize text-gray-400">{r._id}</span><span className="text-white font-medium">{r.count} ({pct}%)</span></div>
                        <div className="h-1.5 bg-surface-hover rounded-full overflow-hidden"><div className="h-full bg-gradient-brand rounded-full" style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {stats?.jobsByMonth?.length > 0 && (
              <div className="card p-5">
                <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><BarChart2 size={14} className="text-brand-indigo" />Jobs per Month</p>
                <BarChart data={stats.jobsByMonth} color="#6366F1" label="Last 6 months" />
              </div>
            )}
            {stats?.usersByMonth?.length > 0 && (
              <div className="card p-5">
                <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={14} className="text-emerald-400" />New Users per Month</p>
                <BarChart data={stats.usersByMonth} color="#10B981" label="Last 6 months" />
              </div>
            )}
          </div>

          {/* Subscription & Verification Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {stats?.subscriptionStats?.length > 0 && (
              <div className="card p-5">
                <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Crown size={14} className="text-yellow-400" />Subscriptions</p>
                <div className="space-y-3">
                  {stats.subscriptionStats.map(s => (
                    <div key={s._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-hover">
                      <span className="text-sm text-gray-300 capitalize">{s._id}</span>
                      <span className="text-sm font-bold text-white">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {stats?.verificationStats?.length > 0 && (
              <div className="card p-5">
                <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><ShieldCheck size={14} className="text-brand-blue" />Provider Verification</p>
                <div className="space-y-3">
                  {stats.verificationStats.map(v => (
                    <div key={v._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-hover">
                      <span className={`${verifyBadge[v._id]} capitalize`}>{v._id}</span>
                      <span className="text-sm font-bold text-white">{v.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {stats?.applicationsByStatus?.length > 0 && (
            <div className="card p-5">
              <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><FileText size={14} className="text-purple-400" />Application Status</p>
              <div className="flex flex-wrap gap-4">
                {stats.applicationsByStatus.map(a => (
                  <div key={a._id} className="flex-1 min-w-[100px] p-3 rounded-xl bg-surface-hover text-center">
                    <p className="text-lg font-bold text-white">{a.count}</p>
                    <p className="text-xs text-gray-400 capitalize">{a._id}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revenue Intelligence */}
          {revenue && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="card p-5">
                <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign size={14} className="text-emerald-400" />Revenue Intelligence
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-surface-hover">
                    <p className="text-xs text-gray-500">Total Revenue</p>
                    <p className="text-lg font-bold text-emerald-400">₨{(revenue.totalRevenue || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-hover">
                    <p className="text-xs text-gray-500">Projected Monthly</p>
                    <p className="text-lg font-bold text-brand-blue">₨{(revenue.projectedRevenue || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-hover">
                    <p className="text-xs text-gray-500">Conversion Rate</p>
                    <p className="text-lg font-bold text-yellow-400">{revenue.conversionRate || 0}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-hover">
                    <p className="text-xs text-gray-500">Growth</p>
                    <p className={`text-lg font-bold ${(revenue.growthPct || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {(revenue.growthPct || 0) >= 0 ? '+' : ''}{revenue.growthPct || 0}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-5">
                <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Crown size={14} className="text-yellow-400" />Paid Subscriptions
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-hover">
                    <span className="text-sm text-gray-300">Active Paid</span>
                    <span className="text-sm font-bold text-brand-blue">{revenue.activeSubscriptions || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-hover">
                    <span className="text-sm text-gray-300">Paid Users</span>
                    <span className="text-sm font-bold text-emerald-400">{revenue.paidUsers || 0} / {revenue.totalUsers || 0}</span>
                  </div>
                  {revenue.subsByPlan?.map(s => (
                    <div key={s._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-hover">
                      <span className="text-sm text-gray-300 capitalize">{s._id}</span>
                      <span className="text-sm font-bold text-white">{s.count} · ₨{(s.totalPrice || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* USERS TAB */}
      {tab === 'Users' && (
        <div className="card overflow-hidden p-0">
          <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-surface-border">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input className="input pl-10" placeholder="Search by name..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            </div>
            <div className="relative">
              <select className="input sm:w-40 appearance-none pr-9" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            <div className="relative">
              <select className="input sm:w-40 appearance-none pr-9" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-surface-border">
                {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className={`border-b border-surface-border/50 hover:bg-surface-hover transition-colors ${u.suspended ? 'opacity-60' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.profileImage} name={u.name} size="sm" />
                        <div>
                          <p className="font-medium text-white flex items-center gap-1.5">{u.name}{u.verified && <BadgeCheck size={13} className="text-brand-blue" />}</p>
                          {u.suspended && <p className="text-[10px] text-red-400">{u.suspendReason}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                        className={`${roleBadge[u.role]} bg-transparent border-0 cursor-pointer capitalize text-xs font-medium focus:outline-none`}>
                        {ROLES.map(r => <option key={r} value={r} className="bg-surface-card text-white capitalize">{r}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3.5">{u.suspended ? <span className="badge-red">Suspended</span> : <span className="badge-green">Active</span>}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-5 py-3.5">
                      {u.role !== 'admin' && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleVerify(u._id)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${u.verified ? 'bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20' : 'bg-surface-hover text-gray-400 hover:text-white'}`}>
                            <BadgeCheck size={11} />{u.verified ? 'Verified' : 'Verify'}
                          </button>
                          {u.suspended ? (
                            <button onClick={() => handleUnsuspend(u._id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"><RotateCcw size={11} />Restore</button>
                          ) : (
                            <button onClick={() => setSuspendTarget(u)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors"><Ban size={11} />Suspend</button>
                          )}
                          <button onClick={() => handleDelete(u._id, u.name)} className="btn-danger px-2.5 py-1.5 text-xs"><Trash2 size={11} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-500">No users found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JOBS TAB */}
      {tab === 'Jobs' && (
        <div className="card overflow-hidden p-0">
          <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-surface-border">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input className="input pl-10" placeholder="Search jobs by title..." value={jobSearch} onChange={e => setJobSearch(e.target.value)} />
            </div>
            <div className="relative">
              <select className="input sm:w-44 appearance-none pr-9" value={jobStatus} onChange={e => setJobStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-surface-border">
                {['Title', 'Organization', 'Budget', 'Status', 'Approval', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j._id} className="border-b border-surface-border/50 hover:bg-surface-hover transition-colors">
                    <td className="px-5 py-3.5"><p className="font-medium text-white">{j.title}</p><p className="text-xs text-gray-500">{j.category}</p></td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{j.organizationId?.name || '—'}</td>
                    <td className="px-5 py-3.5 text-emerald-400 font-medium">₨{j.budget?.toLocaleString()}</td>
                    <td className="px-5 py-3.5"><span className={statusBadge[j.status] || 'badge-gray'}>{j.status}</span></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <span className={`${verifyBadge[j.approvalStatus] || 'badge-yellow'} text-[10px]`}>{j.approvalStatus || 'approved'}</span>
                        {(j.approvalStatus === 'pending' || !j.approvalStatus) && (
                          <>
                            <button onClick={() => handleJobApproval(j._id, 'approved')} className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20"><CheckCircle size={10} /></button>
                            <button onClick={() => handleJobApproval(j._id, 'rejected')} className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"><XCircle size={10} /></button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => handleDeleteJob(j._id, j.title)} className="btn-danger px-2.5 py-1.5 text-xs"><Trash2 size={11} />Delete</button>
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-500">No jobs found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VERIFICATION TAB */}
      {tab === 'Verification' && (
        <div className="card overflow-hidden p-0">
          <div className="p-5 border-b border-surface-border">
            <p className="text-sm font-semibold text-white flex items-center gap-2"><ShieldCheck size={14} className="text-brand-blue" />Provider Verification Management</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-surface-border">
                {['Provider', 'Email', 'Verified', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {users.filter(u => u.role === 'provider').map(u => (
                  <tr key={u._id} className="border-b border-surface-border/50 hover:bg-surface-hover transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.profileImage} name={u.name} size="sm" />
                        <p className="font-medium text-white">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{u.email}</td>
                    <td className="px-5 py-3.5">{u.verified ? <span className="badge-green">Verified</span> : <span className="badge-yellow">Pending</span>}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => handleProviderVerification(u._id, 'approved')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500/20"><CheckCircle size={11} />Approve</button>
                        <button onClick={() => handleProviderVerification(u._id, 'rejected')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20"><XCircle size={11} />Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.filter(u => u.role === 'provider').length === 0 && <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-500">No providers found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORTS TAB */}
      {tab === 'Reports' && (
        <div className="card overflow-hidden p-0">
          <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-surface-border">
            <p className="text-sm font-semibold text-white flex items-center gap-2 flex-1"><Flag size={14} className="text-red-400" />User Reports</p>
            <div className="relative">
              <select className="input sm:w-44 appearance-none pr-9" value={reportStatus} onChange={e => setReportStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="dismissed">Dismissed</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-surface-border">
                {['Reported By', 'Target', 'Reason', 'Status', 'Filed', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r._id} className="border-b border-surface-border/50 hover:bg-surface-hover transition-colors">
                    <td className="px-5 py-3.5"><p className="font-medium text-white">{r.reportedBy?.name}</p><p className="text-xs text-gray-500">{r.reportedBy?.email}</p></td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs capitalize">{r.targetType}</td>
                    <td className="px-5 py-3.5 text-gray-300 text-xs max-w-[200px] truncate">{r.reason}</td>
                    <td className="px-5 py-3.5"><span className={reportBadge[r.status]}>{r.status}</span></td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setReportDetail(r)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface-hover text-gray-400 hover:text-white"><Eye size={11} />Review</button>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-500">No reports found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ACTIVITY TAB */}
      {tab === 'Activity' && (
        <div className="card overflow-hidden p-0">
          <div className="p-5 border-b border-surface-border">
            <p className="text-sm font-semibold text-white flex items-center gap-2"><Activity size={14} className="text-brand-blue" />Activity Logs</p>
          </div>
          {activityLoading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : activityLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No activity logs yet.</div>
          ) : (
            <div className="divide-y divide-surface-border/50 max-h-[500px] overflow-y-auto">
              {activityLogs.map(log => (
                <div key={log._id} className="px-5 py-3 hover:bg-surface-hover transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                      <Activity size={12} className="text-brand-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white"><span className="font-medium">{log.userId?.name || 'System'}</span> <span className="text-gray-400">{log.action}</span></p>
                      <p className="text-[10px] text-gray-600">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {suspendTarget && <SuspendModal user={suspendTarget} onClose={() => setSuspendTarget(null)} onConfirm={handleSuspend} />}
      {reportDetail && <ReportModal report={reportDetail} onClose={() => setReportDetail(null)} onUpdate={handleUpdateReport} />}
    </div>
  );
}
