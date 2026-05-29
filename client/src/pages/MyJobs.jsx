import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Plus, Briefcase, Clock, CheckCircle, Trash2,
  ChevronDown, MessageSquare, UserCheck, ArrowRight,
} from 'lucide-react';
import AssignProviderModal from '../components/AssignProviderModal';
import RateProviderModal from '../components/RateProviderModal';

const STATUS_OPTIONS = ['open', 'in-progress', 'completed'];
const statusStyle = {
  open:          { badge: 'badge-green',  icon: Briefcase },
  'in-progress': { badge: 'badge-yellow', icon: Clock },
  completed:     { badge: 'badge-gray',   icon: CheckCircle },
};

export default function MyJobs() {
  const { user } = useAuth();
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('');
  const [assignJob, setAssignJob] = useState(null);   // job to assign provider to
  const [rateJob, setRateJob]     = useState(null);   // job to rate provider on

  const fetchJobs = () => {
    const params = { orgId: user._id };
    if (filter) params.status = filter;
    api.get('/jobs', { params })
      .then(({ data }) => setJobs(data.jobs || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, [filter]);

  const handleStatusChange = async (jobId, status) => {
    try {
      await api.put(`/jobs/${jobId}/status`, { status });
      toast.success(`Status updated to "${status}"`);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (jobId, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job deleted');
      fetchJobs();
    } catch {
      toast.error('Failed to delete job');
    }
  };

  const counts = {
    all:          jobs.length,
    open:         jobs.filter(j => j.status === 'open').length,
    'in-progress':jobs.filter(j => j.status === 'in-progress').length,
    completed:    jobs.filter(j => j.status === 'completed').length,
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>My Jobs</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{counts.all} jobs posted</p>
        </div>
        <Link to="/post-job" className="btn-primary text-sm">
          <Plus size={15} />Post New Job
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: '',            label: 'All',         count: counts.all },
          { value: 'open',        label: 'Open',        count: counts.open },
          { value: 'in-progress', label: 'In Progress', count: counts['in-progress'] },
          { value: 'completed',   label: 'Completed',   count: counts.completed },
        ].map(tab => (
          <button key={tab.value} onClick={() => setFilter(tab.value)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
            style={{
              background: filter === tab.value ? 'rgba(14,165,233,0.1)' : 'transparent',
              color: filter === tab.value ? 'var(--brand-blue)' : 'var(--text-muted)',
              border: `1px solid ${filter === tab.value ? 'rgba(14,165,233,0.25)' : 'var(--border)'}`,
            }}>
            {tab.label}
            <span className="text-xs px-1.5 py-0.5 rounded-md"
              style={{
                background: filter === tab.value ? 'rgba(14,165,233,0.15)' : 'var(--hover)',
                color: filter === tab.value ? 'var(--brand-blue)' : 'var(--text-muted)',
              }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Jobs list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--hover)' }}>
            <Briefcase size={24} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>No jobs found</p>
          <Link to="/post-job" className="btn-primary inline-flex mt-4">Post your first job</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map(job => {
            const s = statusStyle[job.status];
            return (
              <div key={job._id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={s.badge}>{job.status}</span>
                    {job.rated && <span className="badge-green text-[10px]">★ Rated</span>}
                  </div>
                  <Link to={`/jobs/${job._id}`}
                    className="font-semibold transition-colors duration-200 hover:text-brand-blue line-clamp-1"
                    style={{ color: 'var(--text)' }}>
                    {job.title}
                  </Link>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {job.category} · ₨{job.budget?.toLocaleString()} · Due {new Date(job.deadline).toLocaleDateString()}
                  </p>
                  {job.assignedProviderId && (
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--brand-indigo)' }}>
                      <UserCheck size={11} />Assigned: {job.assignedProviderId.name}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Status dropdown */}
                  <div className="relative group">
                    <button className="btn-ghost text-xs flex items-center gap-1.5 px-3 py-2 rounded-xl"
                      style={{ border: '1px solid var(--border)' }}>
                      <s.icon size={13} />
                      <span className="capitalize">{job.status}</span>
                      <ChevronDown size={12} />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-40 rounded-xl p-1 z-10 hidden group-hover:block"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-hover)' }}>
                      {STATUS_OPTIONS.filter(o => o !== job.status).map(opt => (
                        <button key={opt} onClick={() => handleStatusChange(job._id, opt)}
                          className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors capitalize"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover)'; e.currentTarget.style.color = 'var(--text)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                          → {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Assign provider (open jobs only) */}
                  {job.status === 'open' && (
                    <button onClick={() => setAssignJob(job)}
                      className="btn-outline text-xs px-3 py-2">
                      <UserCheck size={13} />Assign
                    </button>
                  )}

                  {/* Message provider */}
                  {job.assignedProviderId && (
                    <Link to={`/messages/${job.assignedProviderId._id}`}
                      className="btn-ghost text-xs px-3 py-2 rounded-xl"
                      style={{ border: '1px solid var(--border)' }}>
                      <MessageSquare size={13} />Message
                    </Link>
                  )}

                  {/* Rate provider (completed, not yet rated) */}
                  {job.status === 'completed' && job.assignedProviderId && !job.rated && (
                    <button onClick={() => setRateJob(job)}
                      className="btn-primary text-xs px-3 py-2">
                      ★ Rate
                    </button>
                  )}

                  {/* View */}
                  <Link to={`/jobs/${job._id}`} className="btn-ghost text-xs px-3 py-2 border border-surface-border rounded-xl">
                    <ArrowRight size={13} />
                  </Link>

                  {/* Delete */}
                  <button onClick={() => handleDelete(job._id, job.title)}
                    className="btn-danger text-xs px-3 py-2">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {assignJob && (
        <AssignProviderModal
          job={assignJob}
          onClose={() => setAssignJob(null)}
          onAssigned={() => { setAssignJob(null); fetchJobs(); }}
        />
      )}
      {rateJob && (
        <RateProviderModal
          job={rateJob}
          onClose={() => setRateJob(null)}
          onRated={() => { setRateJob(null); fetchJobs(); }}
        />
      )}
    </div>
  );
}
