import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Briefcase, Clock, CheckCircle, MessageSquare,
  ArrowRight, Building2, DollarSign, Calendar,
} from 'lucide-react';

const statusStyle = {
  open:          { badge: 'badge-green',  icon: Briefcase,   label: 'Open' },
  'in-progress': { badge: 'badge-yellow', icon: Clock,       label: 'In Progress' },
  completed:     { badge: 'badge-gray',   icon: CheckCircle, label: 'Completed' },
};

export default function MyAssignedJobs() {
  const { user }  = useAuth();
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchJobs = () => {
    const params = { providerId: user._id };
    if (filter) params.status = filter;
    api.get('/jobs', { params })
      .then(({ data }) => setJobs(data.jobs || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, [filter]);

  const handleAcknowledge = async (jobId) => {
    setUpdating(jobId);
    try {
      await api.put(`/jobs/${jobId}/provider-status`, { status: 'in-progress' });
      toast.success('Job marked as in-progress');
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const counts = {
    all:           jobs.length,
    'in-progress': jobs.filter(j => j.status === 'in-progress').length,
    completed:     jobs.filter(j => j.status === 'completed').length,
  };

  const tabs = [
    { value: '',            label: 'All',         count: counts.all },
    { value: 'in-progress', label: 'In Progress', count: counts['in-progress'] },
    { value: 'completed',   label: 'Completed',   count: counts.completed },
  ];

  return (
    <div className="page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Assigned Jobs</h1>
          <p className="text-gray-500 text-sm mt-1">{counts.all} jobs assigned to you</p>
        </div>
        <Link to="/jobs" className="btn-primary text-sm">
          <Briefcase size={15} />Browse More Jobs
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
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
          {[...Array(4)].map((_, i) => <div key={i} className="card h-28 animate-pulse bg-surface-hover" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card p-16 text-center">
          <Briefcase size={36} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-4">No assigned jobs yet</p>
          <Link to="/jobs" className="btn-primary inline-flex">Browse open jobs</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map(job => {
            const s = statusStyle[job.status] || statusStyle.open;
            const org = job.organizationId;
            return (
              <div key={job._id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={s.badge}>{s.label}</span>
                    {job.rated && <span className="badge-green text-[10px]">★ Rated</span>}
                  </div>
                  <Link to={`/jobs/${job._id}`}
                    className="font-semibold text-white hover:text-brand-blue transition-colors line-clamp-1 text-sm">
                    {job.title}
                  </Link>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Building2 size={11} className="text-brand-indigo" />{org?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={11} className="text-emerald-400" />₨{job.budget?.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} className="text-brand-blue" />
                      Due {new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Acknowledge open→in-progress */}
                  {job.status === 'open' && (
                    <button
                      onClick={() => handleAcknowledge(job._id)}
                      disabled={updating === job._id}
                      className="btn-primary text-xs px-4 py-2">
                      {updating === job._id
                        ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : 'Start Working'}
                    </button>
                  )}

                  {/* Message org */}
                  {org && (
                    <Link to={`/messages/${org._id}`}
                      className="btn-ghost text-xs px-3 py-2 border border-surface-border rounded-xl flex items-center gap-1.5">
                      <MessageSquare size={13} />Message
                    </Link>
                  )}

                  {/* View detail */}
                  <Link to={`/jobs/${job._id}`}
                    className="btn-ghost text-xs px-3 py-2 border border-surface-border rounded-xl">
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
