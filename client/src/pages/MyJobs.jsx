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
          <h1 className="text-2xl font-bold text-white">My Jobs</h1>
          <p className="text-gray-500 text-sm mt-1">{counts.all} jobs posted</p>
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
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              filter === tab.value
                ? 'bg-brand-blue/15 text-brand-blue border border-brand-blue/30'
                : 'text-gray-400 hover:text-white hover:bg-surface-hover border border-transparent'
            }`}>
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-md ${filter === tab.value ? 'bg-brand-blue/20' : 'bg-surface-border'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Jobs list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-surface-hover" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card p-16 text-center">
          <Briefcase size={36} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-4">No jobs found</p>
          <Link to="/post-job" className="btn-primary inline-flex">Post your first job</Link>
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
                    className="font-semibold text-white hover:text-brand-blue transition-colors line-clamp-1">
                    {job.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">
                    {job.category} · ₨{job.budget?.toLocaleString()} · Due {new Date(job.deadline).toLocaleDateString()}
                  </p>
                  {job.assignedProviderId && (
                    <p className="text-xs text-brand-indigo mt-1 flex items-center gap-1">
                      <UserCheck size={11} />Assigned: {job.assignedProviderId.name}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Status dropdown */}
                  <div className="relative group">
                    <button className="btn-ghost text-xs flex items-center gap-1.5 border border-surface-border px-3 py-2 rounded-xl">
                      <s.icon size={13} />
                      <span className="capitalize">{job.status}</span>
                      <ChevronDown size={12} />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-40 card p-1 z-10 hidden group-hover:block shadow-card animate-fade-in">
                      {STATUS_OPTIONS.filter(o => o !== job.status).map(opt => (
                        <button key={opt} onClick={() => handleStatusChange(job._id, opt)}
                          className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-surface-hover text-gray-300 hover:text-white capitalize transition-colors">
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
                      className="btn-ghost text-xs px-3 py-2 border border-surface-border rounded-xl">
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
