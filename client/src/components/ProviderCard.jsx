/**
 * ProviderCard Component
 * 
 * Displays a provider's profile in a card format.
 * Shows live availability badge, skills, rating, work mode.
 * Used in: Providers browse page, OrgDashboard recommendations.
 */
import { Link } from 'react-router-dom';
import { Star, Briefcase, ExternalLink, BadgeCheck, Shield, DollarSign, MapPin } from 'lucide-react';
import Avatar from './Avatar';

// Availability badge config — color + label + animation
const AVAIL_CONFIG = {
  available:   { label: 'Available Now', dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10', pulse: true },
  busy:        { label: 'Busy',          dot: 'bg-yellow-400',  text: 'text-yellow-400',  bg: 'bg-yellow-400/10',  pulse: false },
  unavailable: { label: 'Offline',       dot: 'bg-gray-500',    text: 'text-gray-400',    bg: 'bg-gray-500/10',    pulse: false },
};

const WORK_MODE_LABELS = {
  freelance: 'Freelance', 'part-time': 'Part-Time',
  'full-time': 'Full-Time', any: null,
};

function StarRating({ value = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={10}
          className={n <= Math.round(value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
      ))}
      <span className="text-[11px] text-gray-500 ml-1">{(value || 0).toFixed(1)}</span>
    </div>
  );
}

export default function ProviderCard({ provider, onAssign }) {
  const u = provider.userId;
  const avail = AVAIL_CONFIG[provider.availability] || AVAIL_CONFIG.unavailable;
  const trustScore = u?.trustScore || 0;
  const trustColor = trustScore >= 80 ? 'text-emerald-400' : trustScore >= 60 ? 'text-brand-blue' : 'text-gray-500';
  const workModeLabel = WORK_MODE_LABELS[provider.workMode];

  return (
    <Link
      to={`/providers/${u?._id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl
        bg-surface-card border border-surface-border
        hover:border-white/[0.12] hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]
        transition-all duration-300 cursor-pointer"
    >
      {/* Top gradient accent bar */}
      <div className="h-1 bg-gradient-to-r from-brand-blue via-brand-indigo to-purple-500
        opacity-30 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Cover gradient */}
      <div className="h-14 bg-gradient-to-br from-brand-blue/15 via-brand-indigo/8 to-purple-500/10 relative">
        {/* Availability badge — top right */}
        <div className={`absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full ${avail.bg} border border-white/[0.06]`}>
          <span className="relative flex h-2 w-2">
            {avail.pulse && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${avail.dot} opacity-60`} />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${avail.dot}`} />
          </span>
          <span className={`text-[9px] font-semibold ${avail.text}`}>{avail.label}</span>
        </div>
        {/* Verified badge */}
        {(provider.verificationStatus === 'approved' || u?.verified) && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-blue/10 border border-brand-blue/20">
            <BadgeCheck size={10} className="text-brand-blue" />
            <span className="text-[9px] text-brand-blue font-semibold">Verified</span>
          </div>
        )}
      </div>

      <div className="px-4 pb-4 -mt-6 flex flex-col gap-3 flex-1">
        {/* Avatar + name */}
        <div className="flex items-end gap-3">
          <Avatar
            src={u?.profileImage} name={u?.name} size="lg"
            className="border-2 border-surface-card shadow-lg ring-1 ring-white/[0.06]
              group-hover:ring-brand-blue/30 transition-all duration-300"
          />
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
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold
              bg-emerald-400/5 border border-emerald-400/10 px-2 py-0.5 rounded-lg">
              <DollarSign size={9} />₨{provider.hourlyRate.toLocaleString()}/hr
            </span>
          )}
          {provider.totalJobsCompleted > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400
              bg-white/[0.02] border border-white/[0.04] px-2 py-0.5 rounded-lg">
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

        {/* Skills */}
        {provider.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {provider.skills.slice(0, 4).map(s => (
              <span key={s} className="text-[9px] px-2 py-0.5 rounded-md
                bg-brand-blue/5 text-brand-blue/70 border border-brand-blue/10
                group-hover:bg-brand-blue/10 transition-colors">
                {s}
              </span>
            ))}
            {provider.skills.length > 4 && (
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/[0.02] text-gray-600">
                +{provider.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Bio */}
        {provider.bio && (
          <p className="text-[10px] text-gray-600 line-clamp-2 leading-relaxed">{provider.bio}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.04] mt-auto">
          <div className="flex items-center gap-2">
            {workModeLabel && (
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-brand-indigo/5 text-brand-indigo/70 border border-brand-indigo/10 capitalize">
                {workModeLabel}
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-600 group-hover:text-brand-blue flex items-center gap-1 transition-colors">
            View Profile <ExternalLink size={10} />
          </span>
        </div>
      </div>
    </Link>
  );
}
