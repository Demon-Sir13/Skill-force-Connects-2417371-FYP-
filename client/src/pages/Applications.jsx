import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FileText, Clock, CheckCircle, XCircle, UserCheck, Briefcase } from 'lucide-react';
import Avatar from '../components/Avatar';

const statusConfig = {
  pending:     { badge: 'badge-blue',   icon: Clock,       label: 'Pending' },
  shortlisted: { badge: 'badge-yellow', icon: UserCheck,   label: 'Shortlisted' },
  interview:   { badge: 'badge-indigo', icon: FileText,    label: 'Interview' },
  approved:    { badge: 'badge-green',  icon: CheckCircle, label: 'Approved' },
  rejected:    { badge: 'badge-red',    icon: XCircle,     label: 'Rejected' },
  contracted:  { badge: 'badge-indigo', icon: FileText,    label: 'Contracted' },
};

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/applications/my')
      .then(({ data }) => setApps(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page">
      <div className="grid grid-cols-1 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="card h-28 animate-pulse bg-surface-hover" />)}
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl bg-brand-blue/10 border border-brand-blue/30 flex items-center justify-center">
          <FileText size={20} className="text-brand-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">My Applications</h1>
          <p className="text-gray-500 text-sm">{apps.length} applications submitted</p>
        </div>
      </div>

      {apps.length === 0 ? (
        <div className="card p-16 text-center">
          <Briefcase size={36} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-2">No applications yet</p>
          <Link to="/jobs" className="text-brand-blue text-sm hover:underline">Browse jobs to apply</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map(app => {
            const cfg = statusConfig[app.status] || statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <div key={app._id} className="card p-5 hover:border-brand-blue/30 transition-all">
                <div className="flex items-center gap-4">
                  <Avatar src={app.jobId?.organizationId?.profileImage} name={app.jobId?.organizationId?.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/jobs/${app.jobId?._id}`} className="text-white font-semibold text-sm hover:text-brand-blue transition-colors">
                      {app.jobId?.title || 'Job removed'}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">{app.jobId?.organizationId?.name} · ₨{app.jobId?.budget?.toLocaleString()}</p>
                    {app.coverLetter && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{app.coverLetter}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cfg.badge}><Icon size={11} className="mr-1" />{cfg.label}</span>
                    {app.status === 'approved' && (
                      <Link to={`/messages/${app.jobId?.organizationId?._id}`} className="text-[10px] px-2 py-1 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20">💬 Message</Link>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-gray-600 mt-2">Applied {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
