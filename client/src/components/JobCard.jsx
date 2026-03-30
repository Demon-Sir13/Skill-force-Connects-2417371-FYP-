import { Link } from 'react-router-dom';
import { DollarSign, Calendar, Tag, ArrowRight, Clock, MapPin, Zap, Users } from 'lucide-react';
import Avatar from './Avatar';

const statusMap = {
  open:          { cls: 'badge-green',  label: 'Open',        dot: 'bg-emerald-400' },
  'in-progress': { cls: 'badge-yellow', label: 'In Progress', dot: 'bg-yellow-400' },
  completed:     { cls: 'badge-gray',   label: 'Completed',   dot: 'bg-gray-400' },
};

const urgencyColor = { urgent: 'text-red-400', high: 'text-orange-400', medium: 'text-brand-blue', low: 'text-gray-500' };

function daysLeft(deadline) {
  const diff = Math.ceil((new Date(deadline) - Date.now()) / 86400000);
  if (diff < 0) return { label: 'Overdue', cls: 'text-red-400' };
  if (diff === 0) return { label: 'Due today', cls: 'text-yellow-400' };
  if (diff <= 3) return { label: `${diff}d left`, cls: 'text-yellow-400' };
  return { label: `${diff}d left`, cls: 'text-gray-600' };
}

export default function JobCard({ job }) {
  const s = statusMap[job.status] || statusMap.open;
  const dl = daysLeft(job.deadline);

  return (
    <Link to={`/jobs/${job._id}`}
      className="card group flex flex-col p-0 overflow-hidden
                 hover:border-white/[0.08] hover:shadow-card-hover hover:-translate-y-1
                 active:translate-y-0 transition-all duration-300">

      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-brand-blue via-brand-indigo to-purple-500 opacity-40 group-hover:opacity-80 transition-opacity" />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-200 text-sm leading-snug
                           group-hover:text-white transition-colors duration-300 line-clamp-2">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                <Tag size={9} className="text-brand-blue/50" />{job.category}
              </span>
              {job.district && (
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <MapPin size={9} />{job.district}
                </span>
              )}
            </div>
          </div>
          <span className={`${s.cls} shrink-0 flex items-center gap-1 text-[10px]`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot} inline-block`} />
            {s.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 flex-1">{job.description}</p>

        {/* Skills */}
        {job.skillsRequired?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skillsRequired.slice(0, 3).map(sk => (
              <span key={sk} className="text-[9px] px-2 py-0.5 rounded-md bg-brand-blue/5 text-brand-blue/70 border border-brand-blue/10">{sk}</span>
            ))}
            {job.skillsRequired.length > 3 && (
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/[0.02] text-gray-500">+{job.skillsRequired.length - 3}</span>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <DollarSign size={11} />₨{job.budget?.toLocaleString()}
          </span>
          <span className={`flex items-center gap-1 ${dl.cls}`}>
            <Clock size={10} />{dl.label}
          </span>
          {job.urgency && job.urgency !== 'medium' && (
            <span className={`flex items-center gap-1 ${urgencyColor[job.urgency] || 'text-gray-500'}`}>
              <Zap size={10} />{job.urgency}
            </span>
          )}
          {job.applicantCount > 0 && (
            <span className="flex items-center gap-1 text-gray-500 ml-auto">
              <Users size={10} />{job.applicantCount}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Avatar src={job.organizationId?.profileImage} name={job.organizationId?.name} size="xs" />
            <span className="text-xs text-gray-500 truncate max-w-[120px]">
              {job.organizationId?.name || 'Organization'}
            </span>
          </div>
          <span className="text-[10px] text-gray-700 group-hover:text-brand-blue flex items-center gap-1 transition-colors">
            View <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
