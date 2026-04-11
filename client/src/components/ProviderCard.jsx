import { Star, Briefcase, ExternalLink, Award, BadgeCheck, Shield, DollarSign, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

function StarRating({ value = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={10}
          className={n <= Math.round(value) ? 'text-yellow-500/70 fill-yellow-500/70' : 'text-gray-800'} />
      ))}
      <span className="text-[11px] text-gray-500 ml-1">{value?.toFixed(1)}</span>
    </div>
  );
}

export default function ProviderCard({ provider, onAssign }) {
  const { user } = useAuth();
  const u = provider.userId;
  const trustScore = u?.trustScore || 0;
  const trustColor = trustScore >= 80 ? 'text-emerald-400' : trustScore >= 60 ? 'text-brand-blue' : trustScore >= 40 ? 'text-yellow-400' : 'text-gray-500';

  return (
    <Link to={`/providers/${u?._id}`}
      className="card group flex flex-col p-0 overflow-hidden
                 hover:border-white/[0.08] hover:shadow-card-hover hover:-translate-y-1
                 active:translate-y-0 transition-all duration-300">

      {/* Cover gradient */}
      <div className="h-16 bg-gradient-to-br from-brand-blue/20 via-brand-indigo/10 to-purple-500/10 relative">
        {provider.verificationStatus === 'approved' && (
          <span className="absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <BadgeCheck size={9} />Verified
          </span>
        )}
      </div>

      <div className="px-5 pb-5 -mt-6 flex flex-col gap-3 flex-1">
        {/* Avatar + name */}
        <div className="flex items-end gap-3">
          <Avatar src={u?.profileImage} name={u?.name} size="lg"
            className="border-2 border-surface-card shadow-lg group-hover:shadow-glow-sm transition-all" />
          <div className="min-w-0 flex-1 pb-1">
            <p className="font-semibold text-white text-sm truncate group-hover:text-brand-blue transition-colors flex items-center gap-1.5">
              {u?.name}
              {u?.verified && <BadgeCheck size={12} className="text-brand-blue shrink-0" />}
            </p>
            <StarRating value={provider.rating} />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-2 flex-wrap">
          {provider.hourlyRate > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-400/5 border border-emerald-400/10 px-2 py-0.5 rounded-lg">
              <DollarSign size={9} />₨{provider.hourlyRate.toLocaleString()}/hr
            </span>
          )}
          {provider.totalJobsCompleted > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-white/[0.02] border border-white/[0.04] px-2 py-0.5 rounded-lg">
              <Briefcase size={9} />{provider.totalJobsCompleted} jobs
            </span>
          )}
          {provider.location && (
            <span className="flex items-center gap-1 text-[10px] text-gray-500">
              <MapPin size={9} />{provider.location}
            </span>
          )}
          <span className={`flex items-center gap-1 text-[10px] font-semibold ${trustColor} ml-auto`}>
            <Shield size={9} />{trustScore}
          </span>
        </div>

        {/* Work mode badge */}
        {provider.workMode && provider.workMode !== 'any' && (
          <span className="text-[9px] px-2 py-0.5 rounded-md bg-brand-indigo/5 text-brand-indigo/70 border border-brand-indigo/10 w-fit capitalize">
            {provider.workMode}
          </span>
        )}

        {/* Skills */}
        {provider.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {provider.skills.slice(0, 4).map(s => (
              <span key={s} className="text-[9px] px-2 py-0.5 rounded-md bg-brand-blue/5 text-brand-blue/70 border border-brand-blue/10">{s}</span>
            ))}
            {provider.skills.length > 4 && (
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/[0.02] text-gray-600">+{provider.skills.length - 4}</span>
            )}
          </div>
        )}

        {/* Bio */}
        {provider.bio && (
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{provider.bio}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] mt-auto">
          <span className={`text-[10px] font-semibold flex items-center gap-1 ${
            provider.availability === 'available' ? 'text-emerald-400' :
            provider.availability === 'busy' ? 'text-yellow-400' : 'text-gray-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              provider.availability === 'available' ? 'bg-emerald-400 animate-pulse' :
              provider.availability === 'busy' ? 'bg-yellow-400' : 'bg-gray-500'
            }`} />
            {provider.availability === 'available' ? 'Available Now' :
             provider.availability === 'busy' ? 'Busy' : 'Offline'}
          </span>
          <span className="text-[10px] text-gray-700 group-hover:text-brand-blue flex items-center gap-1 transition-colors">
            View Profile <ExternalLink size={10} />
          </span>
        </div>
      </div>
    </Link>
  );
}
