import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { X, UserCheck, Star, Briefcase, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

/**
 * AssignProviderModal — STRICT WORKFLOW ENFORCEMENT
 * Only shows providers who have APPLIED to this specific job.
 * Prevents assigning random providers who never applied.
 */
export default function AssignProviderModal({ job, onClose, onAssigned }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [assigning, setAssigning]   = useState(null);

  useEffect(() => {
    // Fetch ONLY applicants for this specific job
    api.get(`/jobs/${job._id}/applicants`)
      .then(({ data }) => setApplicants(data))
      .catch(() => toast.error('Failed to load applicants'))
      .finally(() => setLoading(false));
  }, [job._id]);

  const handleAssign = async (application) => {
    const providerId = application.providerId?._id || application.providerId;
    const providerName = application.providerId?.name || 'Provider';
    setAssigning(providerId);
    try {
      await api.put(`/jobs/${job._id}/assign`, {
        providerId,
        applicationId: application._id,
      });
      toast.success(`${providerName} assigned to "${job.title}"`);
      onAssigned();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign provider');
    } finally {
      setAssigning(null);
    }
  };

  const statusColor = {
    pending:     'badge-yellow',
    shortlisted: 'badge-blue',
    interview:   'badge-indigo',
    approved:    'badge-green',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg card p-0 overflow-hidden shadow-card animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <div>
            <h2 className="font-semibold text-white">Assign Provider</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{job.title}</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg"><X size={18} /></button>
        </div>

        {/* Workflow notice */}
        <div className="mx-6 mt-4 mb-2 flex items-start gap-2.5 p-3 rounded-xl bg-brand-blue/5 border border-brand-blue/15">
          <AlertTriangle size={14} className="text-brand-blue shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400 leading-relaxed">
            Only providers who <strong className="text-white">applied to this job</strong> are shown.
            Shortlist or approve an application first to assign work.
          </p>
        </div>

        {/* Applicant list */}
        <div className="overflow-y-auto max-h-[420px] px-2 pb-4">
          {loading ? (
            <div className="flex flex-col gap-2 p-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-surface-hover animate-pulse" />)}
            </div>
          ) : applicants.length === 0 ? (
            <div className="py-14 text-center">
              <Briefcase size={28} className="mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400 text-sm font-medium">No applicants yet</p>
              <p className="text-gray-600 text-xs mt-1">
                Providers must apply to this job before you can assign them.
              </p>
            </div>
          ) : (
            <div className="space-y-2 mt-2">
              {applicants.map(app => {
                const provider = app.providerId;
                const initials = provider?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
                return (
                  <div key={app._id}
                    className="flex items-center gap-4 px-4 py-4 rounded-xl border border-surface-border hover:bg-surface-hover transition-colors">

                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                      {provider?.profileImage
                        ? <img src={provider.profileImage} alt="" className="w-full h-full object-cover" />
                        : initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-white text-sm">{provider?.name}</p>
                        {provider?.verified && <CheckCircle size={12} className="text-brand-blue" />}
                        <span className={`${statusColor[app.status] || 'badge-gray'} text-[10px] ml-auto`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star size={10} className="text-yellow-400 fill-yellow-400" />
                          {typeof provider?.rating === 'number' ? provider.rating.toFixed(1) : '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp size={10} className="text-emerald-400" />
                          Match: <strong className="text-emerald-400 ml-0.5">{app.matchScore || 0}%</strong>
                        </span>
                        {app.expectedSalary > 0 && (
                          <span>Expects ₨{app.expectedSalary.toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Assign button */}
                    <button
                      onClick={() => handleAssign(app)}
                      disabled={!!assigning}
                      className="btn-primary text-xs px-4 py-2 shrink-0">
                      {assigning === (provider?._id) ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><UserCheck size={13} />Assign</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
