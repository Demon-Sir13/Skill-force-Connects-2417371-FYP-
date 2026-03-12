import { Star, Briefcase, MessageSquare, ExternalLink, Award, BadgeCheck, Shield, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

function StarRating({ value = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={10}
          className={n <= Math.round(value) ? 'text-yellow-500/60 fill-yellow-500/60' : 'text-gray-800'} />
      ))}
      <span className="text-[11px] text-gray-500 ml-1">{value?.toFixed(1) || '0.0'}</span>
    </div>
  );
}

function TrustBadge({ score }) {
  if (!score && score !== 0) return null;
  const color = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-brand-blue' : score >= 40 ? 'text-yellow-400' : 'text-gray-500';
  const bg = score >= 80 ? 'bg-emerald-400/6' : score >= 60 ? 'bg-brand-blue/6' : score >= 40 ? 'bg-yellow-400/6' : 'bg-white/[0.02]';
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${bg} border border-white/[0.04]`}>
      <Shield size={9} className={color} />
      <span className={`text-[10px] font-semibold ${color}`}>{score}</span>
    </div>
  );
}

export default function ProviderCard({ provider, onAssign }) {
  const { user } = useAuth();
  const u = provider.userId;
  const trustScore = u?.trustScore;
  const availBadge = {
    available: 'badge-green', busy: 'badge-yellow', unavailable: 'badge-red',
  }[provider.availability] || 'badge-gray';

  return (
    <div className="card group flex flex-col gap-4 p-5 animate-fade-in-up
                    hover:border-white/[0.08] hover:shadow-card-hover hover:-translate-y-1
                    transition-all duration-300">
      <div className="flex items-center gap-3">
        <Link to={`/providers/${u?._id}`}>
          <Avatar src={u?.profileImage} name={u?.name} size="md"
            className="group-hover:shadow-glow-sm transition-all duration-500" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/providers/${u?._id}`}
            className="font-semibold text-gray-200 text-sm truncate group-hover:text-white transition-colors duration-300 flex items-center gap-1.5">
            {u?.name}
            {u?.verified && <BadgeCheck size={12} className="text-brand-blue/60 shrink-0" />}
          </Link>
          <StarRating value={provider.rating} />
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {provider.totalJobsCompleted > 0 && (
            <div className="tooltip-wrap">
              <div className="flex items-center gap-1 text-xs text-gray-600 bg-white/[0.02] border border-white/[0.04] px-2 py-1 rounded-lg">
                <Briefcase size={9} className="text-brand-indigo/50" />
                <span className="text-gray-400 font-medium">{provider.totalJobsCompleted}</span>
              </div>
              <span className="tooltip">Jobs completed</span>
            </div>
          )}
          <TrustBadge score={trustScore} />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {provider.availability && (
          <span className={`${availBadge} text-[10px] capitalize`}>{provider.availability}</span>
        )}
        {provider.hourlyRate > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-400/80 font-semibold bg-emerald-400/6 border border-emerald-400/10 px-2 py-0.5 rounded-lg">
            <DollarSign size={9} />₨{provider.hourlyRate.toLocaleString()}/hr
          </span>
        )}
        {provider.verificationStatus === 'approved' && (
          <span className="badge-green text-[9px]">Verified</span>
        )}
      </div>

      {provider.skills?.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {provider.skills.slice(0, 4).map(s => (
            <span key={s} className="badge-blue text-[10px]">{s}</span>
          ))}
          {provider.skills.length > 4 && (
            <span className="badge-gray text-[10px]">+{provider.skills.length - 4}</span>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-700 italic">No skills listed</p>
      )}

      {provider.experience && (
        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{provider.experience}</p>
      )}

      <div className="flex gap-2 mt-auto pt-1">
        <Link to={`/providers/${u?._id}`}
          className="btn-ghost flex-1 justify-center text-xs py-2 border border-white/[0.04] rounded-xl hover:border-white/[0.08]">
          <ExternalLink size={11} />View
        </Link>
        {user && (
          <Link to={`/messages/${u?._id}`} className="btn-outline flex-1 justify-center text-xs py-2">
            <MessageSquare size={11} />Message
          </Link>
        )}
      </div>

      {onAssign && user?.role === 'organization' && (
        <button onClick={() => onAssign(provider)} className="btn-primary w-full justify-center text-xs py-2">
          <Award size={11} />Assign to Job
        </button>
      )}
    </div>
  );
}
