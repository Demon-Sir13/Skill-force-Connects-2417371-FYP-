import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  FileText, CheckCircle, Clock, Pen, Send, ChevronDown, ChevronUp,
  MessageSquare, AlertTriangle, ShieldCheck, RotateCcw, BadgeCheck,
  ThumbsUp, XCircle, QrCode,
} from 'lucide-react';
import Avatar from '../components/Avatar';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  draft:          { label: 'Draft',           cls: 'badge-yellow',                icon: Clock },
  signed:         { label: 'Signed',          cls: 'badge-blue',                  icon: Pen },
  active:         { label: 'Active',          cls: 'badge-green',                 icon: CheckCircle },
  pending_review: { label: 'Pending Review',  cls: 'bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-2.5 py-0.5 text-xs font-semibold', icon: ShieldCheck },
  completed:      { label: 'Completed',       cls: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full px-2.5 py-0.5 text-xs font-semibold', icon: BadgeCheck },
  overdue:        { label: 'Overdue',         cls: 'bg-red-500/20 text-red-300 border border-red-500/30 rounded-full px-2.5 py-0.5 text-xs font-semibold', icon: AlertTriangle },
  cancelled:      { label: 'Cancelled',       cls: 'badge-red',                   icon: XCircle },
};

const updateTypeBadge = {
  update: 'text-brand-blue', milestone: 'text-yellow-400',
  completion: 'text-emerald-400', response: 'text-purple-400',
};

// ── Signature Block ───────────────────────────────────────────────────────────
function SignatureBlock({ label, signed, signatureInput, signedAt, signedIp, onSign, canSign }) {
  const [input, setInput] = useState('');
  const [open, setOpen]   = useState(false);

  if (signed && signatureInput) {
    return (
      <div className="flex-1 min-w-0 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">{label}</p>
        {/* Cursive signature display */}
        <p
          className="text-2xl text-emerald-400 mb-1 truncate"
          style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive" }}
        >
          {signatureInput}
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <ShieldCheck size={11} className="text-emerald-500 shrink-0" />
          <span className="text-[10px] text-gray-500">
            Digitally verified
            {signedAt ? ` on ${new Date(signedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}` : ''}
            {signedIp ? ` via IP ${signedIp}` : ''}
          </span>
        </div>
      </div>
    );
  }

  if (signed && !signatureInput) {
    // Signed but no input captured (legacy data)
    return (
      <div className="flex-1 min-w-0 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span className="text-sm text-emerald-400 font-medium">Signed</span>
        </div>
        {signedAt && (
          <p className="text-[10px] text-gray-500 mt-1">
            {new Date(signedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    );
  }

  // Not signed
  return (
    <div className="flex-1 min-w-0 rounded-xl border border-surface-border bg-surface-hover/40 p-4">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">{label}</p>
      {canSign ? (
        open ? (
          <div className="space-y-2">
            <input
              className="input text-sm w-full"
              placeholder="Type your full name to sign…"
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => { onSign(input); setOpen(false); }}
                disabled={!input.trim()}
                className="btn-primary text-xs px-3 py-1.5 flex-1"
              >
                <Pen size={11} /> Confirm Signature
              </button>
              <button onClick={() => setOpen(false)} className="btn-ghost text-xs px-3 py-1.5">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 text-xs text-brand-blue hover:text-brand-blue/80 font-medium transition-colors"
          >
            <Pen size={12} /> Signature Required — Click to Sign
          </button>
        )
      ) : (
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-gray-500" />
          <span className="text-xs text-gray-500">Awaiting signature</span>
        </div>
      )}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 ${cfg.cls}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Contracts() {
  const { user } = useAuth();
  const [contracts, setContracts]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [updates, setUpdates]       = useState({});
  const [newUpdate, setNewUpdate]   = useState('');
  const [posting, setPosting]       = useState(false);
  const [submitting, setSubmitting] = useState(null);
  const [qrData, setQrData]         = useState(null); // { qr, verifyUrl }

  const showQR = async (contractId) => {
    try {
      const { data } = await api.get(`/contracts/${contractId}/qr`);
      setQrData(data);
    } catch { toast.error('Failed to generate QR'); }
  };

  useEffect(() => {
    api.get('/contracts/my')
      .then(({ data }) => setContracts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Sign ──────────────────────────────────────────────────────────────────
  const handleSign = async (id, signatureInput) => {
    try {
      const { data } = await api.put(`/contracts/${id}/sign`, { signatureInput });
      setContracts(prev => prev.map(c => c._id === id ? data : c));
      toast.success('Contract signed successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to sign'); }
  };

  // ── Provider: Submit Work ─────────────────────────────────────────────────
  const handleSubmitWork = async (id) => {
    const note = window.prompt('Add a submission note (optional):') ?? '';
    setSubmitting(id);
    try {
      const { data } = await api.put(`/contracts/${id}/submit-work`, { note });
      setContracts(prev => prev.map(c => c._id === id ? data : c));
      toast.success('Work submitted for review!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit'); }
    finally { setSubmitting(null); }
  };

  // ── Org: Approve Work ─────────────────────────────────────────────────────
  const handleApproveWork = async (id) => {
    if (!window.confirm('Accept work and release payment? This cannot be undone.')) return;
    setSubmitting(id);
    try {
      const { data } = await api.put(`/contracts/${id}/approve-work`);
      setContracts(prev => prev.map(c => c._id === id ? data : c));
      toast.success('Work accepted! Payment released.');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to approve'); }
    finally { setSubmitting(null); }
  };

  // ── Org: Request Revision ─────────────────────────────────────────────────
  const handleRequestRevision = async (id) => {
    const note = window.prompt('Describe what needs to be revised:');
    if (!note?.trim()) return;
    setSubmitting(id);
    try {
      const { data } = await api.put(`/contracts/${id}/request-revision`, { note });
      setContracts(prev => prev.map(c => c._id === id ? data : c));
      toast.success('Revision requested. Provider has been notified.');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to request revision'); }
    finally { setSubmitting(null); }
  };

  // ── Work Progress Timeline ────────────────────────────────────────────────
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

  if (loading) return (
    <div className="page">
      <div className="card h-64 animate-pulse bg-surface-hover" />
    </div>
  );

  return (
    <div className="page max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Contracts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your job contracts &amp; track progress</p>
        </div>
      </div>

      {/* QR Modal */}
      {qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setQrData(null)}>
          <div className="card p-7 max-w-xs w-full text-center animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-white mb-1">Contract QR Code</h3>
            <p className="text-xs text-gray-500 mb-4">Scan to verify authenticity</p>
            <img src={qrData.qr} alt="Contract QR" className="mx-auto rounded-xl w-48 h-48" />
            <p className="text-[10px] text-gray-600 mt-3 break-all">{qrData.verifyUrl}</p>
            <button onClick={() => setQrData(null)} className="btn-outline w-full mt-4 text-sm">Close</button>
          </div>
        </div>
      )}

      {contracts.length === 0 ? (
        <div className="card p-16 text-center">
          <FileText size={36} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No contracts yet</p>
          <p className="text-gray-600 text-sm mt-1">
            Contracts are generated when a provider is approved for a job.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map(c => {
            const isExpanded = expandedId === c._id;
            const timeline   = updates[c._id] || [];
            const isOrg      = user.role === 'organization';
            const isProv     = user.role === 'provider';
            const myId       = user._id;

            // Signature permissions
            const canOrgSign  = isOrg  && c.organizationId?._id === myId && !c.signedByOrg  && ['draft','signed'].includes(c.status);
            const canProvSign = isProv && c.providerId?._id     === myId && !c.signedByProvider && ['draft','signed'].includes(c.status);

            // Workflow action permissions
            const canSubmitWork     = isProv && c.status === 'active'         && c.providerId?._id === myId;
            const canApproveWork    = isOrg  && c.status === 'pending_review' && c.organizationId?._id === myId;
            const canRequestRevision= isOrg  && c.status === 'pending_review' && c.organizationId?._id === myId;
            const showTimeline      = ['active', 'pending_review', 'completed', 'overdue'].includes(c.status);

            const isActioning = submitting === c._id;

            return (
              <div key={c._id} className="card p-0 overflow-hidden">
                <div className="p-5">

                  {/* ── Header ── */}
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
                    <div className="flex items-center gap-2">
                      <button onClick={() => showQR(c._id)}
                        className="btn-ghost p-2 rounded-lg" title="Verify QR">
                        <QrCode size={15} className="text-gray-500 hover:text-brand-blue" />
                      </button>
                      <StatusBadge status={c.status} />
                    </div>
                  </div>

                  {/* ── Meta grid ── */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-sm font-semibold text-emerald-400">
                        ₨{c.amount?.toLocaleString()}
                      </p>
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
                      <p className={`text-sm ${c.status === 'overdue' ? 'text-red-400 font-semibold' : 'text-gray-300'}`}>
                        {c.endDate ? new Date(c.endDate).toLocaleDateString() : '—'}
                        {c.status === 'overdue' && <span className="ml-1 text-[10px]">(Overdue)</span>}
                      </p>
                    </div>
                  </div>

                  {/* ── Terms ── */}
                  {c.terms && (
                    <div className="bg-surface-hover rounded-xl p-4 mb-4">
                      <p className="text-xs text-gray-500 mb-1">Terms</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{c.terms}</p>
                    </div>
                  )}

                  {/* ── Pending Review Banner (Org view) ── */}
                  {c.status === 'pending_review' && isOrg && (
                    <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck size={18} className="text-purple-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-purple-300 mb-1">
                            Work Submitted for Your Approval
                          </p>
                          {c.workSubmissionNote && (
                            <p className="text-xs text-gray-400 mb-3">
                              Provider note: "{c.workSubmissionNote}"
                            </p>
                          )}
                          {c.workSubmittedAt && (
                            <p className="text-[10px] text-gray-500 mb-3">
                              Submitted {new Date(c.workSubmittedAt).toLocaleString()}
                            </p>
                          )}
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => handleApproveWork(c._id)}
                              disabled={isActioning}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              <ThumbsUp size={13} />
                              Accept &amp; Release Payment
                            </button>
                            <button
                              onClick={() => handleRequestRevision(c._id)}
                              disabled={isActioning}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-hover hover:bg-surface-border text-gray-300 text-xs font-semibold border border-surface-border transition-colors disabled:opacity-50"
                            >
                              <RotateCcw size={13} />
                              Request Revision
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Pending Review Banner (Provider view) ── */}
                  {c.status === 'pending_review' && isProv && (
                    <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={16} className="text-purple-400 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-purple-300">
                            Work submitted — awaiting organization approval
                          </p>
                          {c.workSubmittedAt && (
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              Submitted {new Date(c.workSubmittedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Revision Note Banner ── */}
                  {c.status === 'active' && c.revisionRequests > 0 && c.lastRevisionNote && (
                    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <RotateCcw size={15} className="text-yellow-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-yellow-300 mb-1">
                            Revision #{c.revisionRequests} requested
                          </p>
                          <p className="text-xs text-gray-400">"{c.lastRevisionNote}"</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Overdue Banner ── */}
                  {c.status === 'overdue' && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle size={16} className="text-red-400 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-red-300">Contract Overdue</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            The deadline passed on {c.endDate ? new Date(c.endDate).toLocaleDateString() : '—'}.
                            {isProv ? ' Please submit your work immediately.' : ' Contact the provider to resolve.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Action Row ── */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Provider: Submit Work */}
                    {canSubmitWork && (
                      <button
                        onClick={() => handleSubmitWork(c._id)}
                        disabled={isActioning}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue/80 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        <Send size={13} />
                        Submit Work for Approval
                      </button>
                    )}

                    {/* Overdue provider can still submit */}
                    {isProv && c.status === 'overdue' && c.providerId?._id === myId && (
                      <button
                        onClick={() => handleSubmitWork(c._id)}
                        disabled={isActioning}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        <Send size={13} />
                        Submit Overdue Work
                      </button>
                    )}

                    {/* Timeline toggle */}
                    {showTimeline && (
                      <button
                        onClick={() => toggleTimeline(c._id)}
                        className="flex items-center gap-1 text-brand-blue hover:text-brand-blue/80 text-xs ml-auto transition-colors"
                      >
                        <MessageSquare size={12} />
                        Work Progress
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Work Progress Timeline ── */}
                {isExpanded && showTimeline && (
                  <div className="border-t border-surface-border bg-surface-hover/30 p-5">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">
                      Progress Timeline
                    </p>
                    {timeline.length === 0 ? (
                      <p className="text-gray-600 text-sm text-center py-4">
                        No updates yet. Post the first progress update.
                      </p>
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
                                <span className={`text-[10px] capitalize ${updateTypeBadge[u.type] || 'text-gray-500'}`}>
                                  {u.type}
                                </span>
                                <span className="text-[10px] text-gray-600 ml-auto">
                                  {new Date(u.createdAt).toLocaleDateString()}{' '}
                                  {new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                      <input
                        className="input flex-1 text-sm"
                        placeholder="Post a progress update…"
                        value={newUpdate}
                        onChange={e => setNewUpdate(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && postUpdate(c._id)}
                      />
                      <button
                        onClick={() => postUpdate(c._id)}
                        disabled={posting || !newUpdate.trim()}
                        className="btn-primary px-3 py-2 text-sm shrink-0"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Signatures & Execution Section ── */}
                <div className="border-t border-surface-border bg-surface-hover/20 p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ShieldCheck size={12} />
                    Signatures &amp; Execution
                  </p>
                  <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                    <SignatureBlock
                      label="Organization Signature"
                      signed={c.signedByOrg}
                      signatureInput={c.orgSignatureInput}
                      signedAt={c.orgSignedAt}
                      signedIp={c.orgSignedIp}
                      canSign={canOrgSign}
                      onSign={(sig) => handleSign(c._id, sig)}
                    />
                    <SignatureBlock
                      label="Provider Signature"
                      signed={c.signedByProvider}
                      signatureInput={c.providerSignatureInput}
                      signedAt={c.providerSignedAt}
                      signedIp={c.providerSignedIp}
                      canSign={canProvSign}
                      onSign={(sig) => handleSign(c._id, sig)}
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
