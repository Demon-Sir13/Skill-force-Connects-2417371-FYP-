import { Link } from 'react-router-dom';
import { Star, Briefcase, ExternalLink, BadgeCheck, Shield, DollarSign, MapPin, Crown } from 'lucide-react';
import Avatar from './Avatar';

const AVAIL = {
  available:   { label: 'Available',  dot: '#34d399', text: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)',  pulse: true },
  busy:        { label: 'Busy',       dot: '#fbbf24', text: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)',  pulse: false },
  unavailable: { label: 'Offline',    dot: '#94a3b8', text: '#94a3b8', bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.15)', pulse: false },
};

const WORK_LABELS = { freelance: 'Freelance', 'part-time': 'Part-Time', 'full-time': 'Full-Time' };

function StarRating({ value = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={10}
          className={n <= Math.round(value) ? 'text-yellow-400 fill-yellow-400' : ''}
          style={n > Math.round(value) ? { color: 'var(--border)' } : {}} />
      ))}
      <span className="text-[11px] ml-1" style={{ color: 'var(--text-muted)' }}>
        {(value || 0).toFixed(1)}
      </span>
    </div>
  );
}

export default function ProviderCard({ provider }) {
  const u = provider.userId;
  const avail = AVAIL[provider.availability] || AVAIL.unavailable;
  const trustScore = u?.trustScore || 0;
  const trustColor = trustScore >= 80 ? '#34d399' : trustScore >= 60 ? 'var(--brand-blue)' : 'var(--text-muted)';
  const workLabel = WORK_LABELS[provider.workMode];

  return (
    <Link
      to={`/providers/${u?._id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-200"
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
      {/* Top accent */}
      <div className="h-0.5 opacity-40 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(90deg, var(--brand-blue), var(--brand-indigo), #a855f7)' }} />

      {/* Cover */}
      <div className="h-14 relative"
        style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(99,102,241,0.06))' }}>
        {/* Availability */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: avail.bg, border: `1px solid ${avail.border}` }}>
          <span className="relative flex h-2 w-2">
            {avail.pulse && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                style={{ background: avail.dot }} />
            )}
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: avail.dot }} />
          </span>
          <span className="text-[9px] font-semibold" style={{ color: avail.text }}>{avail.label}</span>
        </div>

        {/* Verified */}
        {(provider.verificationStatus === 'approved' || u?.verified) && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>
            <BadgeCheck size={10} style={{ color: 'var(--brand-blue)' }} />
            <span className="text-[9px] font-semibold" style={{ color: 'var(--brand-blue)' }}>Verified</span>
          </div>
        )}

        {/* Featured */}
        {provider.featured && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <Crown size={9} style={{ color: '#f59e0b' }} />
            <span className="text-[9px] font-bold" style={{ color: '#f59e0b' }}>FEATURED</span>
          </div>
        )}
      </div>

      <div className="px-4 pb-4 -mt-6 flex flex-col gap-3 flex-1">
        {/* Avatar + name */}
        <div className="flex items-end gap-3">
          <Avatar
            src={u?.profileImage}
            name={u?.name}
            size="lg"
            className="ring-2 shadow-lg transition-all duration-200"
            style={{ '--tw-ring-color': 'var(--card)' }}
          />
          <div className="min-w-0 flex-1 pb-1">
            <p className="font-semibold text-sm truncate flex items-center gap-1.5 transition-colors duration-200 group-hover:text-brand-blue"
              style={{ color: 'var(--text)' }}>
              {u?.name}
              {u?.verified && <BadgeCheck size={12} style={{ color: 'var(--brand-blue)', flexShrink: 0 }} />}
            </p>
            <StarRating value={provider.rating} />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 flex-wrap">
          {provider.hourlyRate > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg"
              style={{ color: '#34d399', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.12)' }}>
              <DollarSign size={9} />₨{provider.hourlyRate.toLocaleString()}/hr
            </span>
          )}
          {provider.totalJobsCompleted > 0 && (
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg"
              style={{ color: 'var(--text-muted)', background: 'var(--hover)', border: '1px solid var(--border)' }}>
              <Briefcase size={9} />{provider.totalJobsCompleted} jobs
            </span>
          )}
          {provider.location && (
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <MapPin size={9} />{provider.location}
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] font-semibold ml-auto" style={{ color: trustColor }}>
            <Shield size={9} />{trustScore}
          </span>
        </div>

        {/* Skills */}
        {provider.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {provider.skills.slice(0, 4).map(s => (
              <span key={s} className="text-[9px] px-2 py-0.5 rounded-md transition-colors duration-200"
                style={{ background: 'rgba(14,165,233,0.06)', color: 'var(--brand-blue)', border: '1px solid rgba(14,165,233,0.1)' }}>
                {s}
              </span>
            ))}
            {provider.skills.length > 4 && (
              <span className="text-[9px] px-2 py-0.5 rounded-md" style={{ background: 'var(--hover)', color: 'var(--text-muted)' }}>
                +{provider.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Bio */}
        {provider.bio && (
          <p className="text-[10px] line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {provider.bio}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5 mt-auto"
          style={{ borderTop: '1px solid var(--border)' }}>
          {workLabel ? (
            <span className="text-[9px] px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(99,102,241,0.06)', color: 'var(--brand-indigo)', border: '1px solid rgba(99,102,241,0.1)' }}>
              {workLabel}
            </span>
          ) : <span />}
          <span className="text-[10px] flex items-center gap-1 transition-colors duration-200 group-hover:text-brand-blue"
            style={{ color: 'var(--text-disabled)' }}>
            View Profile <ExternalLink size={10} />
          </span>
        </div>
      </div>
    </Link>
  );
}
