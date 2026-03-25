import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FileText, CheckCircle, Clock, Pen, Send, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import Avatar from '../components/Avatar';

const statusBadge = { draft: 'badge-yellow', signed: 'badge-blue', active: 'badge-green', completed: 'badge-green', cancelled: 'badge-red' };
const updateTypeBadge = { update: 'text-brand-blue', milestone: 'text-yellow-400', completion: 'text-emerald-400', response: 'text-purple-400' };

export default function Contracts() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [updates, setUpdates] = useState({});
  const [newUpdate, setNewUpdate] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    api.get('/contracts/my')
      .then(({ data }) => setContracts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSign = async (id) => {
    try {
      const { data } = await api.put(`/contracts/${id}/sign`);
      setContracts(prev => prev.map(c => c._id === id ? data : c));
      toast.success('Contract signed!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to sign'); }
  };

  const toggleTimeline = async (contractId) => {
    if (expandedId === contractId) { setExpandedId(null); return; }
    setExpandedId(contractId);
    if (!updates[contractId]) {
      try {
        const { data } = await api.get(`/work-updates/${contractId}`);
        setUpdates(prev => ({ ...prev, [contractId]: data }));
      } catch {}
    }
  };

  const postUpdate = async (contractId) => {
    if (!newUpdate.trim()) return;
    setPosting(true);
    try {
      const { data } = await api.post('/work-updates', { contractId, message: newUpdate.trim() });
      setUpdates(prev => ({ ...prev, [contractId]: [...(prev[contractId] || []), data] }));
      setNewUpdate('');
      toast.success('Update posted');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post'); }
    finally { setPosting(false); }
  };

  if (loading) return <div className="page"><div className="card h-64 animate-pulse bg-surface-hover" /></div>;

  return (
    <div className="page max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Contracts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your job contracts & track progress</p>
        </div>
      </div>

      {contracts.length === 0 ? (
        <div className="card p-16 text-center">
          <FileText size={36} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No contracts yet</p>
          <p className="text-gray-600 text-sm mt-1">Contracts are generated when a provider is approved for a job.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map(c => {
            const isExpanded = expandedId === c._id;
            const timeline = updates[c._id] || [];
            const canSign = c.status === 'draft' && (
              (user.role === 'organization' && c.organizationId?._id === user._id && !c.signedByOrg) ||
              (user.role === 'provider' && c.providerId?._id === user._id && !c.signedByProvider)
            );
            const isActive = ['signed', 'active'].includes(c.status);

            return (
              <div key={c._id} className="card p-0 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                        <FileText size={18} className="text-brand-blue" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{c.title}</p>
                        <p className="text-xs text-gray-500 font-mono">{c.contractNumber}</p>
                      </div>
                    </div>
                    <span className={statusBadge[c.status]}>{c.status}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-sm font-semibold text-emerald-400">₨{c.amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Organization</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Avatar src={c.organizationId?.profileImage} name={c.organizationId?.name} size="xs" />
                        <span className="text-sm text-white truncate">{c.organizationId?.name}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Provider</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Avatar src={c.providerId?.profileImage} name={c.providerId?.name} size="xs" />
                        <span className="text-sm text-white truncate">{c.providerId?.name}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Deadline</p>
                      <p className="text-sm text-gray-300">{c.endDate ? new Date(c.endDate).toLocaleDateString() : '—'}</p>
                    </div>
                  </div>

                  {c.terms && (
                    <div className="bg-surface-hover rounded-xl p-4 mb-4">
                      <p className="text-xs text-gray-500 mb-1">Terms</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{c.terms}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs flex-wrap">
                    <span className="flex items-center gap-1">
                      {c.signedByOrg ? <CheckCircle size={12} className="text-emerald-400" /> : <Clock size={12} className="text-gray-500" />}
                      Org {c.signedByOrg ? 'Signed' : 'Pending'}
                    </span>
                    <span className="flex items-center gap-1">
                      {c.signedByProvider ? <CheckCircle size={12} className="text-emerald-400" /> : <Clock size={12} className="text-gray-500" />}
                      Provider {c.signedByProvider ? 'Signed' : 'Pending'}
                    </span>
                    {canSign && (
                      <button onClick={() => handleSign(c._id)} className="btn-primary text-xs px-3 py-1.5 ml-auto">
                        <Pen size={12} />Sign Contract
                      </button>
                    )}
                    {isActive && (
                      <button onClick={() => toggleTimeline(c._id)}
                        className="flex items-center gap-1 text-brand-blue hover:text-brand-blue/80 ml-auto transition-colors">
                        <MessageSquare size={12} />Work Progress
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Work Progress Timeline */}
                {isExpanded && isActive && (
                  <div className="border-t border-surface-border bg-surface-hover/30 p-5">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">Progress Timeline</p>

                    {timeline.length === 0 ? (
                      <p className="text-gray-600 text-sm text-center py-4">No updates yet. Post the first progress update.</p>
                    ) : (
                      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                        {timeline.map(u => (
                          <div key={u._id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-2 h-2 rounded-full mt-1.5 ${u.type === 'response' ? 'bg-purple-400' : 'bg-brand-blue'}`} />
                              <div className="w-px flex-1 bg-surface-border" />
                            </div>
                            <div className="flex-1 pb-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Avatar src={u.providerId?.profileImage} name={u.providerId?.name} size="xs" />
                                <span className="text-xs font-medium text-white">{u.providerId?.name}</span>
                                <span className={`text-[10px] capitalize ${updateTypeBadge[u.type] || 'text-gray-500'}`}>{u.type}</span>
                                <span className="text-[10px] text-gray-600 ml-auto">
                                  {new Date(u.createdAt).toLocaleDateString()} {new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300">{u.message}</p>
                              {u.files?.length > 0 && (
                                <div className="flex gap-2 mt-1">
                                  {u.files.map((f, i) => (
                                    <a key={i} href={f} target="_blank" rel="noreferrer"
                                      className="text-[10px] px-2 py-1 rounded bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20">
                                      📎 File {i + 1}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input className="input flex-1 text-sm" placeholder="Post a progress update..."
                        value={newUpdate} onChange={e => setNewUpdate(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && postUpdate(c._id)} />
                      <button onClick={() => postUpdate(c._id)} disabled={posting || !newUpdate.trim()}
                        className="btn-primary px-3 py-2 text-sm shrink-0">
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
