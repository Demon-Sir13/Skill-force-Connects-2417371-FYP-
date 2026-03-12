import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { X, Search, UserCheck, Star, Briefcase } from 'lucide-react';

export default function AssignProviderModal({ job, onClose, onAssigned }) {
  const [providers, setProviders] = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [assigning, setAssigning] = useState(null);

  useEffect(() => {
    const t = setTimeout(() =>
      api.get('/providers', { params: search ? { skill: search } : {} })
        .then(({ data }) => setProviders(data.providers || data))
        .catch(() => {})
        .finally(() => setLoading(false))
    , 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleAssign = async (providerId, providerName) => {
    setAssigning(providerId);
    try {
      await api.put(`/jobs/${job._id}/assign`, { providerId });
      toast.success(`${providerName} assigned to "${job.title}"`);
      onAssigned();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign provider');
    } finally {
      setAssigning(null);
    }
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
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-surface-border">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input className="input pl-10" placeholder="Search by skill..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Provider list */}
        <div className="overflow-y-auto max-h-[380px]">
          {loading ? (
            <div className="flex flex-col gap-2 p-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-surface-hover animate-pulse" />)}
            </div>
          ) : providers.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">No providers found.</div>
          ) : (
            providers.map(p => {
              const u = p.userId;
              const initials = u?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
              return (
                <div key={p._id}
                  className="flex items-center gap-4 px-6 py-4 border-b border-surface-border/50 hover:bg-surface-hover transition-colors">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm">{u?.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star size={11} className="text-yellow-400 fill-yellow-400" />
                        {p.rating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase size={11} className="text-brand-indigo" />
                        {p.totalJobsCompleted || 0} jobs
                      </span>
                    </div>
                    {p.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {p.skills.slice(0, 3).map(s => (
                          <span key={s} className="badge-blue text-[10px]">{s}</span>
                        ))}
                        {p.skills.length > 3 && <span className="badge-gray text-[10px]">+{p.skills.length - 3}</span>}
                      </div>
                    )}
                  </div>

                  {/* Assign button */}
                  <button
                    onClick={() => handleAssign(u?._id, u?.name)}
                    disabled={assigning === u?._id}
                    className="btn-primary text-xs px-4 py-2 shrink-0">
                    {assigning === u?._id ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><UserCheck size={13} />Assign</>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
