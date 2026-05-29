import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FileText, Clock, CheckCircle, XCircle, UserCheck, Briefcase, Send } from 'lucide-react';
import Avatar from '../components/Avatar';
import { SkeletonCard } from '../components/Spinner';

const STATUS = {
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
    <div className="page flex flex-col gap-3">
      {[...Array(3)].map((_, i) => <SkeletonCard key={i} className="h-24" />)}
    </div>
  );

  return (
    <div className="page">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>
          <FileText size={20} style={{ color: 'var(--brand-blue)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>My Applications</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {apps.length} application{apps.length !== 1 ? 's' : ''} submitted
          </p>
        </div>
      </div>

      {apps.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--hover)' }}>
            <Briefcase size={24} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>No applications yet</p>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
            Browse available jobs and submit your first application
          </p>
          <Link to="/jobs" className="btn-primary inline-flex">
            <Briefcase size={14} />Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map(app => {
            const cfg = STATUS[app.status] || STATUS.pending;
            const Icon = cfg.icon;
            return (
              <div key={app._id} className="card p-5 transition-all duration-200"
                style={{ cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(14,165,233,0.2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div className="flex items-center gap-4">
                  <Avatar
                    src={app.jobId?.organizationId?.profileImage}
                    name={app.jobId?.organizationId?.name}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/jobs/${app.jobId?._id}`}
                      className="font-semibold text-sm transition-colors duration-200 hover:text-brand-blue"
                      style={{ color: 'var(--text)' }}
                    >
                      {app.jobId?.title || 'Job removed'}
                    </Link>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {app.jobId?.organizationId?.name}
                      {app.jobId?.budget ? ` · ₨${app.jobId.budget.toLocaleString()}` : ''}
                    </p>
                    {app.coverLetter && (
                      <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                        {app.coverLetter}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cfg.badge}>
                      <Icon size={10} />{cfg.label}
                    </span>
                    {app.status === 'approved' && (
                      <Link
                        to={`/messages/${app.jobId?.organizationId?._id}`}
                        className="text-[10px] px-2 py-1 rounded-lg flex items-center gap-1"
                        style={{ background: 'rgba(14,165,233,0.08)', color: 'var(--brand-blue)', border: '1px solid rgba(14,165,233,0.15)' }}
                      >
                        <Send size={9} />Message
                      </Link>
                    )}
                  </div>
                </div>
                <p className="text-[10px] mt-2" style={{ color: 'var(--text-disabled)' }}>
                  Applied {new Date(app.appliedAt || app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
