import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Users, Shield, CheckCircle, XCircle, Search, Ban } from 'lucide-react';
import Avatar from '../components/Avatar';

const ROLE_BADGE = {
  organization: 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20',
  provider:     'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  admin:        'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20',
};

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    api.get('/admin/users')
      .then(({ data }) => setUsers(data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleSuspend = async (id, suspended) => {
    try {
      if (suspended) {
        await api.put(`/admin/users/${id}/unsuspend`);
      } else {
        const reason = window.prompt('Reason for suspension:') || 'Policy violation';
        await api.put(`/admin/users/${id}/suspend`, { reason });
      }
      setUsers(prev => prev.map(u => u._id === id ? { ...u, suspended: !suspended } : u));
      toast.success(suspended ? 'User unsuspended' : 'User suspended');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleVerify = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/verify`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, verified: data.verified } : u));
      toast.success(data.verified ? 'User verified' : 'Verification removed');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole   = filter === 'all' || u.role === filter;
    return matchSearch && matchRole;
  });

  return (
    <div className="page max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} total registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input pl-9 w-full text-sm"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'organization', 'provider', 'admin'].map(r => (
            <button key={r} onClick={() => setFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === r ? 'bg-brand-blue text-white' : 'bg-surface-hover text-gray-400 hover:text-white border border-surface-border'
              }`}>{r}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="card h-16 animate-pulse bg-surface-hover" />)}</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id} className="border-b border-surface-border/50 hover:bg-surface-hover transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.profileImage} name={u.name} size="sm" />
                        <div>
                          <p className="font-medium text-white text-sm flex items-center gap-1.5">
                            {u.name}
                            {u.verified && <CheckCircle size={11} className="text-brand-blue" />}
                          </p>
                          <p className="text-[10px] text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize ${ROLE_BADGE[u.role] || ''}`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                        u.suspended ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>{u.suspended ? 'Suspended' : 'Active'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        <button onClick={() => handleVerify(u._id)}
                          className={`text-[10px] px-2 py-1 rounded-lg transition-colors ${
                            u.verified ? 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20' : 'bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20'
                          }`}>
                          {u.verified ? 'Unverify' : 'Verify'}
                        </button>
                        <button onClick={() => handleSuspend(u._id, u.suspended)}
                          className={`text-[10px] px-2 py-1 rounded-lg transition-colors ${
                            u.suspended ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          }`}>
                          {u.suspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
