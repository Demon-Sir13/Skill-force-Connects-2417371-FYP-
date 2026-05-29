import { Link } from 'react-router-dom';
import { DollarSign, Calendar, Clock, Tag, MapPin, Zap, Users, Crown, ArrowRight } from 'lucide-react';
import Avatar from './Avatar';

const statusMap = {
  open:          { cls: 'badge-green',  label: 'Open',        dot: '#34d399' },
  'in-progress': { cls: 'badge-yellow', label: 'In Progress', dot: '#fbbf24' },
  completed:     { cls: 'badge-gray',   label: 'Completed',   dot: '#94a3b8' },
};

const urgencyColor = {
  urgent: '#f87171',
  high:   '#fb923c',
  medium: 'var(--brand-blue)',
  low:    'var(--text-disabled)',
};

function daysLeft(deadline) {
  const diff = Math.ceil((new Date(deadline) - Date.now()) / 86400000);
  if (diff < 0)  return { label: 'Overdue',    color: '#f87171' };
  if (diff === 0) return { label: 'Due today',  color: '#fbbf24' };
  if (diff <= 3)  return { label: `${diff}d left`, color: '#fbbf24' };
  return { label: `${diff}d left`, color: 'var(--text-muted)' };
}

export default function JobCard({ job }) {
  const s = statusMap[job.status] || statusMap.open;
  const dl = daysLeft(job.deadline);

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl transition-all duration-200"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
        e.currentTarget.style.borderColor = 'rgba(14,165,233,0.25)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Top accent bar */}
      <div className="h-0.5 transition-opacity duration-300 group-hover:opacity-100 opacity-50"
        style={{ background: 'linear-gradient(90deg, var(--brand-blue), var(--brand-indigo), #a855f7)' }} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-snug line-clamp-2 transition-colors duration-200"
              style={{ color: 'var(--text)' }}>
              {job.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <Tag size={9} style={{ color: 'var(--brand-blue)', opacity: 0.6 }} />{job.category}
              </span>
              {job.district && (
                <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <MapPin size={9} />{job.district}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`${s.cls} flex items-center gap-1 text-[10px]`}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: s.dot }} />
              {s.label}
            </span>
            {job.featured && (
              <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Crown size={9} />FEATURED
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs leading-relaxed line-clamp-2 flex-1" style={{ color: 'var(--text-muted)' }}>
          {job.description}
        </p>

        {/* Skills */}
        {job.skillsRequired?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skillsRequired.slice(0, 3).map(sk => (
              <span key={sk} className="text-[9px] px-2 py-0.5 rounded-md"
                style={{ background: 'rgba(14,165,233,0.06)', color: 'var(--brand-blue)', border: '1px solid rgba(14,165,233,0.12)' }}>
                {sk}
              </span>
            ))}
            {job.skillsRequired.length > 3 && (
              <span className="text-[9px] px-2 py-0.5 rounded-md" style={{ background: 'var(--hover)', color: 'var(--text-muted)' }}>
                +{job.skillsRequired.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <span className="flex items-center gap-1 font-semibold" style={{ color: '#34d399' }}>
            <DollarSign size={11} />₨{job.budget?.toLocaleString()}
          </span>
          <span className="flex items-center gap-1" style={{ color: dl.color }}>
            <Clock size={10} />{dl.label}
          </span>
          {job.urgency && job.urgency !== 'medium' && (
            <span className="flex items-center gap-1" style={{ color: urgencyColor[job.urgency] }}>
              <Zap size={10} />{job.urgency}
            </span>
          )}
          {job.applicantCount > 0 && (
            <span className="flex items-center gap-1 ml-auto" style={{ color: 'var(--text-muted)' }}>
              <Users size={10} />{job.applicantCount}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-auto"
          style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <Avatar src={job.organizationId?.profileImage} name={job.organizationId?.name} size="xs" />
            <span className="text-xs truncate max-w-[120px]" style={{ color: 'var(--text-muted)' }}>
              {job.organizationId?.name || 'Organization'}
            </span>
          </div>
          <span className="text-[10px] flex items-center gap-1 transition-colors duration-200 group-hover:text-brand-blue"
            style={{ color: 'var(--text-disabled)' }}>
            View <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </span>
        </div>
      </div>
    </Link>
  );
}
