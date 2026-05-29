import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { ShieldCheck, XCircle, Zap, FileText } from 'lucide-react';

export default function VerifyContract() {
  const { contractNumber } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/contracts/verify/${contractNumber}`)
      .then(({ data }) => setData(data))
      .catch(() => setData({ valid: false }))
      .finally(() => setLoading(false));
  }, [contractNumber]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-4 shadow-glow-sm">
            <Zap size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Contract Verification</h1>
          <p className="text-gray-500 text-sm mt-1">SkillForce Connect — Official Verification</p>
        </div>

        <div className="card p-7">
          {loading ? (
            <div className="flex justify-center py-8"><span className="spinner-lg" /></div>
          ) : data?.valid ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck size={24} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-400">Authentic Contract</p>
                  <p className="text-xs text-gray-400">Verified by SkillForce Connect</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Contract ID', value: data.contractNumber },
                  { label: 'Job Title', value: data.title },
                  { label: 'Organization', value: data.organization },
                  { label: 'Provider', value: data.provider },
                  { label: 'Amount', value: `₨${data.amount?.toLocaleString()}` },
                  { label: 'Status', value: data.status },
                  { label: 'Issued', value: new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-surface-border/50 last:border-0">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
                    <span className="text-sm font-medium text-white capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <XCircle size={28} className="text-red-400" />
              </div>
              <h3 className="font-semibold text-white">Contract Not Found</h3>
              <p className="text-gray-400 text-sm">This contract number is invalid or does not exist in our system.</p>
            </div>
          )}

          <div className="divider my-5" />
          <Link to="/" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
            <Zap size={13} />Back to SkillForce Connect
          </Link>
        </div>
      </div>
    </div>
  );
}
