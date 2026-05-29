import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Package, Send, FileText, ExternalLink, RotateCcw } from 'lucide-react';

const STATUS_CFG = {
  submitted:          { cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',       label: 'Submitted' },
  approved:           { cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', label: 'Approved' },
  rejected:           { cls: 'bg-red-500/10 text-red-400 border border-red-500/20',           label: 'Rejected' },
  revision_requested: { cls: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',  label: 'Revision Needed' },
};

export default function ProviderDeliveries() {
  const [contracts, setContracts] = useState([]);
  const [deliveries, setDeliveries] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [submitting, setSubmitting] = useState(null);

  useEffect(() => {
    api.get('/contracts/my')
      .then(({ data }) => setContracts(data.filter(c => ['active', 'overdue', 'pending_review', 'completed'].includes(c.status))))
      .catch(() => toast.error('Failed to load contracts'))
      .finally(() => setLoading(false));
  }, []);

  const loadDeliveries = async (contractId) => {
    if (deliveries[contractId]) { setExpanded(expanded === contractId ? null : contractId); return; }
    try {
      const { data } = await api.get(`/delivery/${contractId}`);
      setDeliveries(prev => ({ ...prev, [contractId]: data }));
      setExpanded(contractId);
    } catch { toast.error('Failed to load deliveries'); }
  };

  const handleSubmit = async (contractId) => {
    const note = window.prompt('Add a delivery note (optional):') ?? '';
    setSubmitting(contractId);
    try {
      await api.post(`/delivery/${contractId}`, { deliveryNote: note });
      toast.success('Delivery submitted for review!');
      const { data } = await api.get(`/delivery/${contractId}`);
      setDeliveries(prev => ({ ...prev, [contractId]: data }));
      setExpanded(contractId);
      // Refresh contracts
      const { data: updated } = await api.get('/contracts/my');
      setContracts(updated.filter(c => ['active', 'overdue', 'pending_review', 'completed'].includes(c.status)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setSubmitting(null); }
  };

  return (
    <div className="page max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Deliveries</h1>
        <p className="text-gray-500 text-sm mt-1">Submit and track your work deliveries</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card h-20 animate-pulse bg-surface-hover" />)}</div>
      ) : contracts.length === 0 ? (
        <div className="card p-16 text-center">
          <Package size={36} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No active contracts</p>
          <p className="text-gray-600 text-sm mt-1">Deliveries appear when you have active contracts.</p>
          <Link to="/my-assigned-jobs" className="btn-outline inline-flex mt-6 text-sm">View Assigned Work</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map(c => {
            const canSubmit = ['active', 'overdue'].includes(c.status);
            return (
              <div key={c._id} className="card p-0 overflow-hidden">
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                      <FileText size={16} className="text-brand-blue" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{c.title}</p>
                      <p className="text-xs text-gray-500">{c.organizationId?.name} · ₨{c.amount?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canSubmit && (
                      <button
                        onClick={() => handleSubmit(c._id)}
                        disabled={submitting === c._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blue hover:bg-brand-blue/80 text-white text-xs font-semibold transition-colors disabled:opacity-50">
                        <Send size={11} />
                        {submitting === c._id ? 'Submitting...' : 'Submit Work'}
                      </button>
                    )}
                    <button onClick={() => loadDeliveries(c._id)}
                      className="text-xs text-gray-500 hover:text-white px-2 py-1.5 rounded-lg hover:bg-surface-hover transition-colors">
                      {expanded === c._id ? 'Hide' : 'History'}
                    </button>
                  </div>
                </div>

                {expanded === c._id && (
                  <div className="border-t border-surface-border p-5 bg-surface-hover/30">
                    {!deliveries[c._id] || deliveries[c._id].length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">No submissions yet. Submit your work above.</p>
                    ) : (
                      <div className="space-y-3">
                        {deliveries[c._id].map(sub => {
                          const cfg = STATUS_CFG[sub.status] || STATUS_CFG.submitted;
                          return (
                            <div key={sub._id} className="p-4 rounded-xl border border-surface-border bg-surface-bg">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div>
                                  <p className="text-sm font-semibold text-white">Submission #{sub.submissionNumber}</p>
                                  <p className="text-xs text-gray-500">{new Date(sub.submittedAt).toLocaleString()}</p>
                                </div>
                                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                              </div>
                              {sub.deliveryNote && <p className="text-xs text-gray-400 mb-2">"{sub.deliveryNote}"</p>}
                              {sub.revisionNote && (
                                <div className="flex items-start gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-2">
                                  <RotateCcw size={11} className="text-yellow-400 shrink-0 mt-0.5" />
                                  <p className="text-xs text-yellow-300">Revision: {sub.revisionNote}</p>
                                </div>
                              )}
                              {sub.files?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {sub.files.map((f, i) => (
                                    <a key={i} href={f.url} target="_blank" rel="noreferrer"
                                      className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20">
                                      <ExternalLink size={9} />{f.originalName || `File ${i + 1}`}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
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
