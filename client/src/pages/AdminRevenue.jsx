import { useEffect, useState } from 'react';
import api from '../utils/api';
import { DollarSign, TrendingUp, CreditCard, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminRevenue() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/payments/all')
      .then(({ data }) => setPayments(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed  = payments.filter(p => p.status === 'completed');
  const totalRev   = completed.reduce((s, p) => s + (p.amount || 0), 0);
  const subRev     = completed.filter(p => p.type === 'subscription').reduce((s, p) => s + (p.amount || 0), 0);
  const msgRev     = completed.filter(p => p.type === 'messaging').reduce((s, p) => s + (p.amount || 0), 0);

  // Monthly breakdown
  const monthly = {};
  completed.forEach(p => {
    const key = new Date(p.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
    monthly[key] = (monthly[key] || 0) + (p.amount || 0);
  });
  const monthlyData = Object.entries(monthly).slice(-6).map(([name, amount]) => ({ name, amount }));

  return (
    <div className="page max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Revenue</h1>
        <p className="text-gray-500 text-sm mt-1">Platform revenue overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue',    value: `₨${totalRev.toLocaleString()}`,  icon: DollarSign,  color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Subscriptions',    value: `₨${subRev.toLocaleString()}`,    icon: CreditCard,  color: 'text-brand-blue',  bg: 'bg-brand-blue/10' },
          { label: 'Messaging',        value: `₨${msgRev.toLocaleString()}`,    icon: TrendingUp,  color: 'text-brand-indigo',bg: 'bg-brand-indigo/10' },
          { label: 'Transactions',     value: completed.length,                  icon: Users,       color: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {monthlyData.length > 0 && (
        <div className="card p-5 mb-6">
          <p className="text-sm font-semibold text-white mb-4">Monthly Revenue (Last 6 Months)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#11161E', border: '1px solid #1E293B', borderRadius: 10, fontSize: 12 }}
                formatter={v => [`₨${v.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#0EA5E9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-surface-border">
          <p className="text-sm font-semibold text-white">Recent Transactions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {['User', 'Type', 'Amount', 'Gateway', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 30).map(p => (
                <tr key={p._id} className="border-b border-surface-border/50 hover:bg-surface-hover transition-colors">
                  <td className="px-5 py-3 text-xs text-gray-300">{p.userId?.name || '—'}</td>
                  <td className="px-5 py-3 text-xs text-gray-400 capitalize">{p.type}</td>
                  <td className="px-5 py-3 text-xs font-semibold text-emerald-400">₨{p.amount?.toLocaleString()}</td>
                  <td className="px-5 py-3 text-xs text-gray-500 capitalize">{p.paymentGateway}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      p.status === 'pending'   ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
