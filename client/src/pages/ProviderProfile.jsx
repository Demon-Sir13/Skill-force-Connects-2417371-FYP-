import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Star, Briefcase, ExternalLink, MessageSquare, ArrowLeft, Award, BadgeCheck,
  Shield, Phone, MapPin, GraduationCap, Languages, DollarSign,
  Calendar, ChevronRight,
} from 'lucide-react';
import Avatar from '../components/Avatar';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

function TrustBadge({ score }) {
  const level = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'New';
  const color = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-brand-blue' : score >= 40 ? 'text-yellow-400' : 'text-gray-500';
  const bg = score >= 80 ? 'bg-emerald-400/8' : score >= 60 ? 'bg-brand-blue/8' : score >= 40 ? 'bg-yellow-400/8' : 'bg-white/[0.03]';
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${bg} border border-white/[0.04]`}>
      <Shield size={13} className={color} />
      <span className={`text-xs font-semibold ${color}`}>{score}/100</span>
      <span className="text-[10px] text-gray-600">{level}</span>
    </div>
  );
}

export default function ProviderProfile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    api.get(`/providers/${userId}`)
      .then(({ data }) => setProfile(data))
      .catch(() => {})
      .finally(() => setLoading(false));
    api.get(`/reviews/user/${userId}`)
      .then(({ data }) => setReviews(data.reviews || []))
      .catch(() => {});
  }, [userId]);

  if (loading) return (
    <div className="page max-w-4xl"><div className="card h-64 animate-pulse bg-surface-hover" /></div>
  );
  if (!profile) return (
    <div className="page text-center py-20">
      <p className="text-gray-500">Provider not found.</p>
      <Link to="/providers" className="btn-outline mt-4 inline-flex">Back to Providers</Link>
    </div>
  );

  const u = profile.userId;
  const isOwnProfile = user?._id === userId;
  const trustScore = u?.trustScore || 50;
  const tabs = [
    { id: 'overview', label: 'Overview' },
    ...(profile.portfolio?.length ? [{ id: 'portfolio', label: 'Portfolio' }] : []),
    ...(profile.gallery?.length ? [{ id: 'gallery', label: 'Gallery' }] : []),
    ...(profile.certifications?.length ? [{ id: 'certifications', label: 'Certifications' }] : []),
    { id: 'reviews', label: 'Reviews' },
  ];

  return (
    <div className="page max-w-4xl">
      <Link to="/providers" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-300 mb-6 transition-colors">
        <ArrowLeft size={14} />Back to Providers
      </Link>

      <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col gap-4">
        {/* Cover / Hero card */}
        <motion.div variants={fadeUp} className="card overflow-hidden relative">
          {/* Cover gradient */}
          <div className="h-28 sm:h-36 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-brand opacity-[0.08]" />
            <div className="absolute inset-0 bg-gradient-mesh" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface-card/80 to-transparent" />
          </div>
          <div className="px-7 pb-7 -mt-10 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <Avatar src={u?.profileImage} name={u?.name} size="xl"
                className="ring-4 ring-surface-card shadow-elevated" />
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-white">{u?.name}</h1>
                  {u?.verified && <BadgeCheck size={16} className="text-brand-blue" />}
                  {profile.verificationStatus === 'approved' && (
                    <span className="badge-green text-[9px]">Verified</span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-0.5">{u?.email}</p>
                {profile.bio && (
                  <p className="text-gray-400 text-sm mt-2 leading-relaxed line-clamp-2">{profile.bio}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-3">
                  {profile.location && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={11} className="text-brand-blue/50" />{profile.location}
                    </span>
                  )}
                  {profile.phone && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone size={11} className="text-brand-indigo/50" />{profile.phone}
                    </span>
                  )}
                  {profile.hourlyRate > 0 && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                      <DollarSign size={11} />₨{profile.hourlyRate.toLocaleString()}/hr
                    </span>
                  )}
                  {profile.availability && (
                    <span className={`text-[10px] capitalize px-2 py-0.5 rounded-lg border ${
                      profile.availability === 'available' ? 'bg-emerald-400/6 text-emerald-400 border-emerald-400/10' :
                      profile.availability === 'busy' ? 'bg-yellow-400/6 text-yellow-400 border-yellow-400/10' :
                      'bg-red-400/6 text-red-400 border-red-400/10'
                    }`}>{profile.availability}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0 sm:pb-1">
                {!isOwnProfile && user && (
                  <Link to={`/messages/${userId}`} className="btn-primary text-sm">
                    <MessageSquare size={14} />Message
                  </Link>
                )}
                {isOwnProfile && (
                  <Link to="/profile" className="btn-outline text-sm">Edit Profile</Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Star, label: 'Rating', value: profile.rating?.toFixed(1) || '0.0', sub: `${profile.totalReviews || 0} reviews`, color: 'text-yellow-400' },
            { icon: Briefcase, label: 'Jobs Done', value: profile.totalJobsCompleted || 0, sub: 'completed', color: 'text-brand-indigo' },
            { icon: DollarSign, label: 'Earned', value: `₨${(profile.totalEarnings || 0).toLocaleString()}`, sub: 'total', color: 'text-emerald-400' },
            { icon: Shield, label: 'Trust', value: `${trustScore}/100`, sub: trustScore >= 80 ? 'Excellent' : trustScore >= 60 ? 'Good' : 'Building', color: 'text-brand-blue' },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <s.icon size={16} className={`mx-auto mb-2 ${s.color} opacity-60`} />
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider">{s.sub}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        {tabs.length > 1 && (
          <motion.div variants={fadeUp} className="flex gap-1 bg-white/[0.02] rounded-xl p-1 border border-white/[0.04]">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex-1 text-sm py-2 rounded-lg transition-all duration-300 ${
                  activeTab === t.id ? 'bg-brand-blue/8 text-brand-blue font-semibold' : 'text-gray-600 hover:text-gray-300'
                }`}>{t.label}</button>
            ))}
          </motion.div>
        )}

        {activeTab === 'overview' && (
          <>
            {profile.skills?.length > 0 && (
              <motion.div variants={fadeUp} className="card p-6">
                <h2 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
                  <Award size={14} className="text-brand-blue/60" />Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(s => <span key={s} className="badge-blue text-sm px-3 py-1.5">{s}</span>)}
                </div>
              </motion.div>
            )}
            {(profile.languages?.length > 0 || profile.education) && (
              <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.languages?.length > 0 && (
                  <div className="card p-5">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm">
                      <Languages size={13} className="text-brand-indigo/60" />Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map(l => <span key={l} className="badge-gray text-xs">{l}</span>)}
                    </div>
                  </div>
                )}
                {profile.education && (
                  <div className="card p-5">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm">
                      <GraduationCap size={13} className="text-emerald-400/60" />Education
                    </h3>
                    <p className="text-gray-400 text-sm">{profile.education}</p>
                  </div>
                )}
              </motion.div>
            )}
            {profile.experience && (
              <motion.div variants={fadeUp} className="card p-6">
                <h2 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
                  <Briefcase size={14} className="text-brand-indigo/60" />Experience
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{profile.experience}</p>
              </motion.div>
            )}
            {profile.portfolioLinks?.filter(Boolean).length > 0 && (
              <motion.div variants={fadeUp} className="card p-6">
                <h2 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
                  <ExternalLink size={14} className="text-brand-blue/60" />Links
                </h2>
                <div className="flex flex-col gap-2">
                  {profile.portfolioLinks.filter(Boolean).map((link, i) => (
                    <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-brand-blue/80 text-sm hover:text-brand-blue hover:underline truncate transition-colors">
                      <ExternalLink size={12} />{link}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
            {profile.rating > 0 && (
              <motion.div variants={fadeUp} className="card p-6 flex items-center gap-4">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} size={18} className={n <= Math.round(profile.rating) ? 'text-yellow-500/60 fill-yellow-500/60' : 'text-gray-700'} />
                  ))}
                </div>
                <p className="text-gray-500 text-sm">
                  <span className="text-white font-semibold">{profile.rating?.toFixed(1)}</span> from {profile.totalReviews || profile.totalJobsCompleted} reviews
                </p>
              </motion.div>
            )}
          </>
        )}

        {activeTab === 'portfolio' && profile.portfolio?.length > 0 && (
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.portfolio.map((item, i) => (
              <div key={item._id || i} className="card overflow-hidden group">
                {item.imageUrl && (
                  <div className="h-40 overflow-hidden">
                    <img src={item.imageUrl} alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-semibold text-white text-sm mb-1">{item.title}</h3>
                  {item.description && <p className="text-gray-500 text-xs line-clamp-3 mb-3">{item.description}</p>}
                  <div className="flex items-center justify-between">
                    {item.date && (
                      <span className="text-[10px] text-gray-600 flex items-center gap-1">
                        <Calendar size={10} />{new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer"
                        className="text-brand-blue/70 text-xs flex items-center gap-1 hover:text-brand-blue transition-colors">
                        View <ChevronRight size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'gallery' && profile.gallery?.length > 0 && (
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {profile.gallery.map((item, i) => (
              <div key={item._id || i} className="card overflow-hidden group aspect-square relative">
                <img src={item.url} alt={item.caption || 'Gallery'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-xs">{item.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'certifications' && profile.certifications?.length > 0 && (
          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.certifications.map((cert, i) => (
              <div key={cert._id || i} className="card p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-indigo/6 border border-brand-indigo/10 flex items-center justify-center shrink-0">
                  <Award size={16} className="text-brand-indigo/60" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white text-sm">{cert.name}</h3>
                  {cert.issuer && <p className="text-gray-500 text-xs mt-0.5">{cert.issuer}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    {cert.year && <span className="text-[10px] text-gray-600">{cert.year}</span>}
                    {cert.url && (
                      <a href={cert.url} target="_blank" rel="noopener noreferrer"
                        className="text-brand-blue/60 text-[10px] hover:text-brand-blue hover:underline flex items-center gap-1 transition-colors">
                        View <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'reviews' && (
          <motion.div variants={fadeUp}>
            {reviews.length === 0 ? (
              <div className="card p-12 text-center">
                <Star size={32} className="mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400 text-sm">No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r._id} className="card p-5">
                    <div className="flex items-start gap-3">
                      <Avatar src={r.reviewerId?.profileImage} name={r.reviewerId?.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-white">{r.reviewerId?.name}</p>
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(n => (
                              <Star key={n} size={11} className={n <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
                            ))}
                          </div>
                        </div>
                        {r.jobId?.title && <p className="text-[10px] text-gray-500 mb-2">for "{r.jobId.title}"</p>}
                        {r.comment && <p className="text-sm text-gray-400 leading-relaxed">{r.comment}</p>}
                        <p className="text-[10px] text-gray-600 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
