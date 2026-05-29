import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Users, CheckCircle, XCircle, MessageSquare, FileText, TrendingUp } from 'lucide-react';
import Avatar from '../components/Avatar';

const STATUS_BADGE = {
  pending:     'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  shortlisted: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  interview:   'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  approved:    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  rejected:    'bg-red-500/10 text-red-400 border border-red-500/20',
  contracted:  'bg-gray-500/10 text-gray-400 border border-gray-500/20',
};

export default function OrgApplicants() {
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    api.get('/applications/org')
      .then(({ data }) => setApps(data))
      .catch(() => toast.error('Failed to load applicants'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/applications/${id}/status`, { status });
      setApps(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      toast.success(`Application ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  return (
    <div className="page max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Applicants</h1>
          <p className="text-gray-500 text-sm mt-1">All applications across your jobs</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">{apps.length} total</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'shortlisted', 'interview', 'approved', 'rejected', 'contracted'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filter === s ? 'bg-brand-blue text-white' : 'bg-surface-hover text-gray-400 hover:text-white border border-surface-border'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="card h-20 animate-pulse bg-surface-hover" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Users size={36} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No applicants found</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Applicant', 'Job', 'Match', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <tr key={app._id} className="border-b border-surface-border/50 hover:bg-surface-hover transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar src={app.providerId?.profileImage} name={app.providerId?.name} size="sm" />
                        <div>
                          <p className="font-medium text-white text-sm">{app.providerId?.name}</p>
                          <p className="text-[10px] text-gray-500">{app.providerId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link to={`/jobs/${app.jobId?._id}`} className="text-xs text-gray-300 hover:text-brand-blue transition-colors">
                        {app.jobId?.title || '—'}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      {app.matchScore > 0 ? (
                        <span className={`text-xs font-bold ${app.matchScore >= 70 ? 'text-emerald-400' : app.matchScore >= 40 ? 'text-yellow-400' : 'text-gray-500'}`}>
                          {app.matchScore}%
                        </span>
                      ) : <span className="text-gray-600 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[app.status] || ''}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1 flex-wrap">
                        {app.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(app._id, 'shortlisted')} className="text-[10px] px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20">Shortlist</button>
                            <button onClick={() => updateStatus(app._id, 'rejected')} className="text-[10px] px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">Reject</button>
                          </>
                        )}
                        {app.status === 'shortlisted' && (
                          <>
                            <button onClick={() => updateStatus(app._id, 'interview')} className="text-[10px] px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20">Interview</button>
                            <button onClick={() => updateStatus(app._id, 'approved')} className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">Approve</button>
                          </>
                        )}
                        {app.status === 'interview' && (
                          <button onClick={() => updateStatus(app._id, 'approved')} className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">Approve</button>
                        )}
                        {app.status === 'approved' && (
                          <Link to={`/messages/${app.providerId?._id}`} className="text-[10px] px-2 py-1 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 flex items-center gap-1">
                            <MessageSquare size={10} />Message
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
