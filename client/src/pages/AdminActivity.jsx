import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Activity, User, Briefcase, CreditCard, Shield, MessageSquare } from 'lucide-react';

const TYPE_CFG = {
  subscription_upgrade: { icon: CreditCard,    color: 'text-brand-blue',   bg: 'bg-brand-blue/10' },
  messaging_unlocked:   { icon: MessageSquare, color: 'text-brand-indigo', bg: 'bg-brand-indigo/10' },
  login:                { icon: User,          color: 'text-emerald-400',  bg: 'bg-emerald-400/10' },
  job_posted:           { icon: Briefcase,     color: 'text-yellow-400',   bg: 'bg-yellow-400/10' },
  user_suspended:       { icon: Shield,        color: 'text-red-400',      bg: 'bg-red-400/10' },
  default:              { icon: Activity,      color: 'text-gray-400',     bg: 'bg-gray-400/10' },
};

export default function AdminActivity() {
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/activity-logs')
      .then(({ data }) => setLogs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Activity Logs</h1>
        <p className="text-gray-500 text-sm mt-1">Recent platform activity and events</p>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="card h-16 animate-pulse bg-surface-hover" />)}</div>
      ) : logs.length === 0 ? (
        <div className="card p-16 text-center">
          <Activity size={36} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No activity logs yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log, i) => {
            const cfg = TYPE_CFG[log.action] || TYPE_CFG.default;
            const Icon = cfg.icon;
            return (
              <div key={log._id || i} className="card p-4 flex items-start gap-4 hover:border-white/[0.08] transition-colors">
                <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={15} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white capitalize">
                        {(log.action || 'activity').replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {log.userId?.name || log.userId || 'System'}
                        {log.meta?.plan && ` → ${log.meta.plan} plan`}
                        {log.meta?.amount && ` · ₨${log.meta.amount}`}
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-600 shrink-0">
                      {new Date(log.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
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
