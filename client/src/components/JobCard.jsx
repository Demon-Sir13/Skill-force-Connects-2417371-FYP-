import { Link } from 'react-router-dom';
import { DollarSign, Calendar, Tag, ArrowRight, Clock } from 'lucide-react';
import Avatar from './Avatar';

const statusMap = {
  open:          { cls: 'badge-green',  label: 'Open',        dot: 'bg-emerald-400' },
  'in-progress': { cls: 'badge-yellow', label: 'In Progress', dot: 'bg-yellow-400' },
  completed:     { cls: 'badge-gray',   label: 'Completed',   dot: 'bg-gray-400' },
};

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
      className="card group flex flex-col gap-4 p-5 animate-fade-in-up
                 hover:border-white/[0.08] hover:shadow-card-hover hover:-translate-y-1
                 active:translate-y-0 transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-gray-200 text-sm leading-snug
                       group-hover:text-white transition-colors duration-300 line-clamp-2">
          {job.title}
        </h3>
        <span className={`${s.cls} shrink-0 flex items-center gap-1`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot} inline-block`} />
          {s.label}
        </span>
      </div>

      <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 flex-1">{job.description}</p>

      <div className="flex flex-wrap gap-1.5 text-xs text-gray-500">
        <span className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.04] px-2.5 py-1 rounded-lg">
          <Tag size={10} className="text-brand-blue/50" />{job.category}
        </span>
        <span className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.04] px-2.5 py-1 rounded-lg">
          <DollarSign size={10} className="text-emerald-400/60" />
          <span className="text-emerald-400/80 font-medium">₨{job.budget?.toLocaleString()}</span>
        </span>
        <span className={`flex items-center gap-1 bg-white/[0.02] border border-white/[0.04] px-2.5 py-1 rounded-lg ${dl.cls}`}>
          <Clock size={10} />{dl.label}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Avatar src={job.organizationId?.profileImage} name={job.organizationId?.name} size="xs" />
          <span className="text-xs text-gray-600 truncate max-w-[110px]">
            {job.organizationId?.name || 'Organization'}
          </span>
        </div>
        <ArrowRight size={13} className="text-gray-700 group-hover:text-brand-blue/60 group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </Link>
  );
}
