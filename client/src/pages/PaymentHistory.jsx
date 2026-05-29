import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  CreditCard, CheckCircle, XCircle, Clock, ArrowRight,
  Receipt, Crown, MessageSquare, RefreshCw,
} from 'lucide-react';

const STATUS_CFG = {
  completed: { cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', icon: CheckCircle, label: 'Completed' },
  pending:   { cls: 'bg-yellow-500/10  text-yellow-400  border border-yellow-500/20',  icon: Clock,        label: 'Pending'   },
  failed:    { cls: 'bg-red-500/10     text-red-400     border border-red-500/20',     icon: XCircle,      label: 'Failed'    },
  refunded:  { cls: 'bg-blue-500/10    text-blue-400    border border-blue-500/20',    icon: RefreshCw,    label: 'Refunded'  },
};

const TYPE_CFG = {
  subscription: { icon: Crown,          label: 'Subscription', color: 'text-yellow-400' },
  messaging:    { icon: MessageSquare,  label: 'Messaging',    color: 'text-brand-blue' },
  other:        { icon: CreditCard,     label: 'Payment',      color: 'text-gray-400'   },
};

function StatusBadge({ status }) {
  const cfg  = STATUS_CFG[status] || STATUS_CFG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${cfg.cls}`}>
      <Icon size={10} />{cfg.label}
    </span>
  );
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/payments/history')
      .then(({ data }) => setPayments(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = payments
    .filter(p => p.status === 'completed')
    .reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="page max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment History</h1>
          <p className="text-gray-500 text-sm mt-1">All your transactions on SkillForce</p>
        </div>
        <Link to="/subscriptions" className="btn-outline text-sm">
          <Crown size={14} />Manage Plan
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">Total Spent</p>
          <p className="text-xl font-bold text-emerald-400">₨{totalSpent.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">Transactions</p>
          <p className="text-xl font-bold text-white">{payments.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 mb-1">Completed</p>
          <p className="text-xl font-bold text-brand-blue">
            {payments.filter(p => p.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-16 animate-pulse bg-surface-hover" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="card p-16 text-center">
          <Receipt size={36} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 font-medium">No payments yet</p>
          <p className="text-gray-600 text-sm mt-1">Your transaction history will appear here.</p>
          <Link to="/subscriptions" className="btn-primary inline-flex mt-6">
            View Plans <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Date', 'Type', 'Description', 'Amount', 'Gateway', 'Status'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map(p => {
                  const typeCfg = TYPE_CFG[p.type] || TYPE_CFG.other;
                  const TypeIcon = typeCfg.icon;
                  const plan = p.meta?.plan;
                  return (
                    <tr key={p._id} className="border-b border-surface-border/50 hover:bg-surface-hover transition-colors">
                      <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                        <br />
                        <span className="text-gray-600">
                          {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <TypeIcon size={14} className={typeCfg.color} />
                          <span className="text-xs text-gray-300">{typeCfg.label}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs text-white font-medium">
                          {p.type === 'subscription'
                            ? `${plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : ''} Plan — 30 days`
                            : p.type === 'messaging'
                            ? 'Messaging Unlock'
                            : 'Payment'}
                        </p>
                        {p.purchaseOrderId && (
                          <p className="text-[10px] text-gray-600 font-mono mt-0.5 truncate max-w-[160px]">
                            {p.purchaseOrderId}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-sm font-semibold ${p.status === 'completed' ? 'text-emerald-400' : 'text-gray-400'}`}>
                          ₨{(p.amount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-gray-400 capitalize">
                          {p.paymentGateway === 'dev' ? '🛠 Dev' :
                           p.paymentGateway === 'khalti' ? '💜 Khalti' :
                           p.paymentGateway === 'esewa'  ? '💚 eSewa' :
                           p.paymentGateway || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
