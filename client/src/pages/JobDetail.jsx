import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  DollarSign, Calendar, Tag, MessageSquare, ArrowLeft,
  Clock, CheckCircle, Briefcase, Trash2, UserCheck, ChevronDown,
  MapPin, Send, Users, FileText, XCircle, Sparkles, Target, Zap,
} from 'lucide-react';
import AssignProviderModal from '../components/AssignProviderModal';
import RateProviderModal from '../components/RateProviderModal';
import Avatar from '../components/Avatar';

const statusMap = {
  open:          { badge: 'badge-green',  label: 'Open' },
  'in-progress': { badge: 'badge-yellow', label: 'In Progress' },
  completed:     { badge: 'badge-gray',   label: 'Completed' },
};
const STATUS_OPTIONS = ['open', 'in-progress', 'completed'];
const appStatusBadge = { pending: 'badge-blue', shortlisted: 'badge-yellow', interview: 'badge-indigo', approved: 'badge-green', rejected: 'badge-red', contracted: 'badge-gray' };

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [showRate, setShowRate] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [showApplicants, setShowApplicants] = useState(false);
  const [recommended, setRecommended] = useState([]);

  const fetchJob = () =>
    api.get(`/jobs/${id}`)
      .then(({ data }) => setJob(data))
      .catch(() => toast.error('Job not found'))
      .finally(() => setLoading(false));

  useEffect(() => { fetchJob(); }, [id]);

  // Fetch recommended providers for this job (org only)
  useEffect(() => {
    if (user?.role === 'organization') {
      api.get(`/matching/providers/${id}`)
        .then(({ data }) => setRecommended(Array.isArray(data) ? data.slice(0, 5) : []))
        .catch(() => {});
    }
  }, [id, user]);

  // Check if provider already applied
  useEffect(() => {
    if (user?.role === 'provider') {
      api.get('/applications/my')
        .then(({ data }) => {
          const found = data.find(a => a.jobId?._id === id);
          if (found) setHasApplied(true);
        }).catch(() => {});
    }
  }, [user, id]);

  const handleApply = async () => {
    if (!coverLetter.trim()) return toast.error('Cover letter is required');
    setApplying(true);
    try {
      await api.post(`/applications/${id}`, {
        coverLetter,
        cvFile,
        portfolioLink,
        expectedSalary: expectedSalary ? Number(expectedSalary) : 0,
        availabilityDate: availabilityDate || null,
      });
      toast.success('Application submitted!');
      setShowApply(false);
      setHasApplied(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const fetchApplicants = async () => {
    try {
      const { data } = await api.get(`/applications/job/${id}`);
      setApplicants(data);
      setShowApplicants(true);
    } catch (err) {
      toast.error('Failed to load applicants');
    }
  };

  const updateAppStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      toast.success(`Application ${status}`);
      fetchApplicants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      toast.success('Job deleted');
      navigate('/my-jobs');
    } catch { toast.error('Failed to delete'); }
  };

  const handleGenerateContract = async (applicationId) => {
    try {
      const { data } = await api.post('/contracts/generate', { applicationId });
      toast.success('Contract generated!');
      navigate(`/contracts`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate contract');
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await api.put(`/jobs/${id}/status`, { status });
      toast.success(`Status → ${status}`);
      setStatusOpen(false);
      fetchJob();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="page max-w-4xl"><div className="card h-64 animate-pulse bg-surface-hover" /></div>;
  if (!job) return (
    <div className="page text-center py-20">
      <p className="text-gray-400">Job not found.</p>
      <Link to="/jobs" className="btn-outline mt-4 inline-flex">Back to Jobs</Link>
    </div>
  );

  const s = statusMap[job.status] || statusMap.open;
  const isOwner = user && (job.organizationId?._id === user._id || job.organizationId === user._id);
  const isProvider = user?.role === 'provider';

  return (
    <div className="page max-w-4xl">
      <Link to={isOwner ? '/my-jobs' : '/jobs'}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={15} />{isOwner ? 'My Jobs' : 'Browse Jobs'}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="card p-7">
            <div className="flex items-start justify-between gap-4 mb-5">
              <h1 className="text-xl font-bold text-white leading-snug">{job.title}</h1>
              <div className="flex items-center gap-2 shrink-0">
                <span className={s.badge}>{s.label}</span>
                {job.rated && <span className="badge-green text-[10px]">★ Rated</span>}
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
            {job.skillsRequired?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {job.skillsRequired.map((sk, i) => <span key={i} className="badge-blue text-[10px]">{sk}</span>)}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Tag, label: 'Category', value: job.category, color: 'text-brand-blue' },
              { icon: DollarSign, label: 'Budget', value: `₨${job.budget?.toLocaleString()}`, color: 'text-emerald-400' },
              { icon: Calendar, label: 'Deadline', value: new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), color: 'text-brand-indigo' },
              { icon: MapPin, label: 'Location', value: job.location || 'Remote', color: 'text-purple-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="card p-4 text-center">
                <Icon size={16} className={`mx-auto mb-2 ${color}`} />
                <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                <p className="text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Owner controls */}
          {isOwner && (
            <div className="card p-5 flex flex-wrap gap-3">
              <p className="w-full text-xs text-gray-500 uppercase tracking-wide mb-1">Job Controls</p>
              <div className="relative">
                <button onClick={() => setStatusOpen(!statusOpen)}
                  className="btn-ghost text-sm border border-surface-border flex items-center gap-2 px-4 py-2.5 rounded-xl">
                  <span className="capitalize">{job.status}</span>
                  <ChevronDown size={14} className={`transition-transform ${statusOpen ? 'rotate-180' : ''}`} />
                </button>
                {statusOpen && (
                  <div className="absolute left-0 top-full mt-1 w-44 card p-1 z-10 shadow-card animate-fade-in">
                    {STATUS_OPTIONS.filter(o => o !== job.status).map(opt => (
                      <button key={opt} onClick={() => handleStatusChange(opt)}
                        className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-surface-hover text-gray-300 hover:text-white capitalize transition-colors">
                        → {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {job.status === 'open' && (
                <button onClick={() => setShowAssign(true)} className="btn-outline text-sm">
                  <UserCheck size={15} />Assign Provider
                </button>
              )}
              <button onClick={fetchApplicants} className="btn-outline text-sm">
                <Users size={15} />Applicants ({job.applicantCount || 0})
              </button>
              {job.status === 'completed' && job.assignedProviderId && !job.rated && (
                <button onClick={() => setShowRate(true)} className="btn-primary text-sm">★ Rate Provider</button>
              )}
              <button onClick={handleDelete} className="btn-danger text-sm ml-auto">
                <Trash2 size={15} />Delete Job
              </button>
            </div>
          )}

          {/* Provider apply */}
          {isProvider && job.status === 'open' && !isOwner && (
            <div className="card p-5">
              {hasApplied ? (
                <div className="flex items-center gap-3 text-green-400">
                  <CheckCircle size={18} />
                  <p className="text-sm font-medium">You have already applied to this job</p>
                </div>
              ) : showApply ? (
                <div>
                  <p className="text-sm font-semibold text-white mb-4">Apply to this Job</p>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="label">Cover Letter <span className="text-red-400">*</span></label>
                      <textarea className="input w-full resize-none" rows={4} placeholder="Why are you a great fit for this role?"
                        value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">CV / Resume URL</label>
                        <input className="input" placeholder="https://drive.google.com/..." value={cvFile} onChange={e => setCvFile(e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Portfolio Link</label>
                        <input className="input" placeholder="https://behance.net/..." value={portfolioLink} onChange={e => setPortfolioLink(e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Expected Salary (NPR)</label>
                        <input className="input" type="number" placeholder="e.g. 50000" value={expectedSalary} onChange={e => setExpectedSalary(e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Available From</label>
                        <input className="input" type="date" value={availabilityDate} onChange={e => setAvailabilityDate(e.target.value)} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowApply(false)} className="btn-ghost text-sm">Cancel</button>
                      <button onClick={handleApply} disabled={applying || !coverLetter.trim()} className="btn-primary text-sm">
                        <Send size={14} />{applying ? 'Submitting...' : 'Submit Application'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowApply(true)} className="btn-primary w-full justify-center">
                  <Send size={15} />Apply Now
                </button>
              )}
            </div>
          )}

          {/* Applicants panel */}
          {showApplicants && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-white flex items-center gap-2">
                  <Users size={14} className="text-brand-blue" />Applicants ({applicants.length})
                </p>
                <button onClick={() => setShowApplicants(false)} className="btn-ghost text-xs"><XCircle size={14} /></button>
              </div>
              {applicants.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No applicants yet</p>
              ) : (
                <div className="space-y-3">
                  {applicants.map(app => (
                    <div key={app._id} className="p-4 rounded-xl bg-surface-hover">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar src={app.providerId?.profileImage} name={app.providerId?.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <Link to={`/providers/${app.providerId?._id}`} className="text-sm font-medium text-white hover:text-brand-blue">
                            {app.providerId?.name}
                          </Link>
                          {app.providerId?.verified && <span className="ml-1 text-brand-blue text-[10px]">✓</span>}
                          <div className="flex items-center gap-2 mt-0.5">
                            {app.expectedSalary > 0 && <span className="text-[10px] text-emerald-400">₨{app.expectedSalary.toLocaleString()}</span>}
                            {app.availabilityDate && <span className="text-[10px] text-gray-500">From {new Date(app.availabilityDate).toLocaleDateString()}</span>}
                          </div>
                        </div>
                        <span className={`${appStatusBadge[app.status] || 'badge-blue'} text-[10px]`}>{app.status}</span>
                      </div>
                      {app.coverLetter && <p className="text-xs text-gray-400 mb-2 line-clamp-2">{app.coverLetter}</p>}
                      <div className="flex items-center gap-2 flex-wrap">
                        {app.cvFile && <a href={app.cvFile} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20">📄 View CV</a>}
                        {app.portfolioLink && <a href={app.portfolioLink} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">🎨 Portfolio</a>}
                        {(app.status === 'pending') && (
                          <>
                            <button onClick={() => updateAppStatus(app._id, 'shortlisted')} className="text-[10px] px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20">Shortlist</button>
                            <button onClick={() => updateAppStatus(app._id, 'approved')} className="text-[10px] px-2 py-1 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20">Approve</button>
                            <button onClick={() => updateAppStatus(app._id, 'rejected')} className="text-[10px] px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">Reject</button>
                          </>
                        )}
                        {app.status === 'shortlisted' && (
                          <>
                            <button onClick={() => updateAppStatus(app._id, 'interview')} className="text-[10px] px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20">Interview</button>
                            <button onClick={() => updateAppStatus(app._id, 'approved')} className="text-[10px] px-2 py-1 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20">Approve</button>
                            <button onClick={() => updateAppStatus(app._id, 'rejected')} className="text-[10px] px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">Reject</button>
                          </>
                        )}
                        {app.status === 'interview' && (
                          <>
                            <button onClick={() => updateAppStatus(app._id, 'approved')} className="text-[10px] px-2 py-1 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20">Approve</button>
                            <button onClick={() => updateAppStatus(app._id, 'rejected')} className="text-[10px] px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">Reject</button>
                          </>
                        )}
                        {app.status === 'approved' && (
                          <>
                            <Link to={`/messages/${app.providerId?._id}`} className="text-[10px] px-2 py-1 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20">💬 Message</Link>
                            <button onClick={() => handleGenerateContract(app._id)} className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">📝 Generate Contract</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">Posted by</p>
            <div className="flex items-center gap-3 mb-5">
              <Avatar src={job.organizationId?.profileImage} name={job.organizationId?.name} size="md" className="shadow-glow-sm" />
              <div>
                <p className="font-semibold text-white text-sm">{job.organizationId?.name}</p>
                <p className="text-xs text-gray-500">Organization</p>
              </div>
            </div>
            {!user && <Link to="/login" className="btn-primary w-full justify-center text-sm">Login to Apply</Link>}
          </div>

          {job.assignedProviderId && (
            <div className="card p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Assigned Provider</p>
              <div className="flex items-center gap-3 mb-4">
                <Avatar src={job.assignedProviderId?.profileImage} name={job.assignedProviderId?.name} size="md" />
                <div>
                  <p className="text-sm font-medium text-white">{job.assignedProviderId?.name}</p>
                  <p className="text-xs text-gray-500">Provider</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link to={`/providers/${job.assignedProviderId?._id}`}
                  className="btn-ghost text-xs w-full justify-center border border-surface-border rounded-xl py-2">View Profile</Link>
                {isOwner && (
                  <Link to={`/messages/${job.assignedProviderId?._id}`}
                    className="btn-outline text-xs w-full justify-center py-2"><MessageSquare size={13} />Message</Link>
                )}
              </div>
            </div>
          )}

          {/* Job meta */}
          {(job.urgency || job.jobType || job.district) && (
            <div className="card p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Details</p>
              <div className="space-y-3">
                {job.urgency && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1.5"><Zap size={12} />Urgency</span>
                    <span className={`text-xs font-semibold capitalize ${
                      job.urgency === 'urgent' ? 'text-red-400' : job.urgency === 'high' ? 'text-yellow-400' : 'text-gray-300'
                    }`}>{job.urgency}</span>
                  </div>
                )}
                {job.jobType && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1.5"><Clock size={12} />Type</span>
                    <span className="text-xs text-gray-300 capitalize">{job.jobType.replace('-', ' ')}</span>
                  </div>
                )}
                {job.district && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1.5"><MapPin size={12} />District</span>
                    <span className="text-xs text-gray-300">{job.district}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recommended providers */}
          {isOwner && recommended.length > 0 && (
            <div className="card p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Sparkles size={12} className="text-yellow-400" />Best Matches
              </p>
              <div className="space-y-3">
                {recommended.map(({ provider, matchScore, matchedSkills }) => (
                  <Link key={provider._id} to={`/providers/${provider.userId?._id}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-hover transition-colors group">
                    <Avatar src={provider.userId?.profileImage} name={provider.userId?.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white group-hover:text-brand-blue transition-colors truncate">
                        {provider.userId?.name}
                      </p>
                      {matchedSkills?.length > 0 && (
                        <div className="flex gap-1 mt-0.5">
                          {matchedSkills.slice(0, 2).map(s => (
                            <span key={s} className="text-[9px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 bg-brand-blue/10 px-1.5 py-0.5 rounded-lg shrink-0">
                      <Target size={9} className="text-brand-blue" />
                      <span className="text-[10px] font-bold text-brand-blue">{matchScore}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showAssign && <AssignProviderModal job={job} onClose={() => setShowAssign(false)} onAssigned={() => { setShowAssign(false); fetchJob(); }} />}
      {showRate && <RateProviderModal job={job} onClose={() => setShowRate(false)} onRated={() => { setShowRate(false); fetchJob(); }} />}
    </div>
  );
}
