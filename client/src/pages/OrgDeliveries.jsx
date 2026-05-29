import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Package, CheckCircle, XCircle, RotateCcw, FileText, ExternalLink } from 'lucide-react';
import Avatar from '../components/Avatar';

const STATUS_CFG = {
  submitted:          { cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',    label: 'Submitted' },
  approved:           { cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', label: 'Approved' },
  rejected:           { cls: 'bg-red-500/10 text-red-400 border border-red-500/20',       label: 'Rejected' },
  revision_requested: { cls: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20', label: 'Revision' },
};

export default function OrgDeliveries() {
  const [contracts, setContracts] = useState([]);
  const [deliveries, setDeliveries] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/contracts/my')
      .then(({ data }) => setContracts(data.filter(c => ['pending_review', 'active', 'completed'].includes(c.status))))
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

  const handleApprove = async (submissionId, contractId) => {
    if (!window.confirm('Approve this delivery and release payment?')) return;
    try {
      await api.put(`/delivery/${submissionId}/approve`);
      toast.success('Delivery approved. Payment released.');
      const { data } = await api.get(`/delivery/${contractId}`);
      setDeliveries(prev => ({ ...prev, [contractId]: data }));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRevision = async (submissionId, contractId) => {
    const note = window.prompt('Describe what needs revision:');
    if (!note?.trim()) return;
    try {
      await api.put(`/delivery/${submissionId}/revision`, { revisionNote: note });
      toast.success('Revision requested.');
      const { data } = await api.get(`/delivery/${contractId}`);
      setDeliveries(prev => ({ ...prev, [contractId]: data }));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="page max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Deliveries</h1>
        <p className="text-gray-500 text-sm mt-1">Review work submitted by providers</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card h-20 animate-pulse bg-surface-hover" />)}</div>
      ) : contracts.length === 0 ? (
        <div className="card p-16 text-center">
          <Package size={36} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No deliveries yet</p>
          <p className="text-gray-600 text-sm mt-1">Deliveries appear when providers submit work on active contracts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map(c => (
            <div key={c._id} className="card p-0 overflow-hidden">
              <button onClick={() => loadDeliveries(c._id)}
                className="w-full flex items-center justify-between p-5 hover:bg-surface-hover transition-colors text-left">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                    <FileText size={16} className="text-brand-blue" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{c.title}</p>
                    <p className="text-xs text-gray-500">{c.providerId?.name} · ₨{c.amount?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize ${
                    c.status === 'pending_review' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    c.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>{c.status.replace('_', ' ')}</span>
                  <span className="text-gray-600 text-xs">{expanded === c._id ? '▲' : '▼'}</span>
                </div>
              </button>

              {expanded === c._id && (
                <div className="border-t border-surface-border p-5 bg-surface-hover/30">
                  {!deliveries[c._id] || deliveries[c._id].length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No submissions yet for this contract.</p>
                  ) : (
                    <div className="space-y-4">
                      {deliveries[c._id].map(sub => {
                        const cfg = STATUS_CFG[sub.status] || STATUS_CFG.submitted;
                        return (
                          <div key={sub._id} className="p-4 rounded-xl border border-surface-border bg-surface-bg">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <p className="text-sm font-semibold text-white">Submission #{sub.submissionNumber}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{new Date(sub.submittedAt).toLocaleString()}</p>
                              </div>
                              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                            </div>
                            {sub.deliveryNote && (
                              <p className="text-xs text-gray-400 mb-3 bg-surface-hover p-3 rounded-lg">"{sub.deliveryNote}"</p>
                            )}
                            {sub.files?.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {sub.files.map((f, i) => (
                                  <a key={i} href={f.url} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 border border-brand-blue/20">
                                    <ExternalLink size={10} />{f.originalName || `File ${i + 1}`}
                                  </a>
                                ))}
                              </div>
                            )}
                            {sub.status === 'submitted' && (
                              <div className="flex gap-2">
                                <button onClick={() => handleApprove(sub._id, c._id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold transition-colors">
                                  <CheckCircle size={12} />Approve & Release Payment
                                </button>
                                <button onClick={() => handleRevision(sub._id, c._id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-hover hover:bg-surface-border text-gray-300 text-xs font-semibold border border-surface-border transition-colors">
                                  <RotateCcw size={12} />Request Revision
                                </button>
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
          ))}
        </div>
      )}
    </div>
  );
}
