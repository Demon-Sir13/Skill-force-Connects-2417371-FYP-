import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Briefcase, Search, Trash2, Eye } from 'lucide-react';

const STATUS_BADGE = {
  open:          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  'in-progress': 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  completed:     'bg-gray-500/10 text-gray-400 border border-gray-500/20',
};

export default function AdminJobs() {
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    api.get('/admin/jobs')
      .then(({ data }) => setJobs(Array.isArray(data) ? data : (data.jobs || [])))
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/jobs/${id}`);
      setJobs(prev => prev.filter(j => j._id !== id));
      toast.success('Job deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const filtered = jobs.filter(j => {
    const matchSearch = !search || j.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === 'all' || j.status === filter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="page max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Jobs</h1>
          <p className="text-gray-500 text-sm mt-1">{jobs.length} total jobs on the platform</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input pl-9 w-full text-sm" placeholder="Search jobs…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['all', 'open', 'in-progress', 'completed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === s ? 'bg-brand-blue text-white' : 'bg-surface-hover text-gray-400 hover:text-white border border-surface-border'
              }`}>{s}</button>
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
                  {['Title', 'Organization', 'Budget', 'Status', 'Posted', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(j => (
                  <tr key={j._id} className="border-b border-surface-border/50 hover:bg-surface-hover transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-white text-sm truncate max-w-[200px]">{j.title}</p>
                      <p className="text-[10px] text-gray-500">{j.category}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">{j.organizationId?.name || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-emerald-400 font-semibold">₨{j.budget?.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[j.status] || ''}`}>{j.status}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {new Date(j.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        <Link to={`/jobs/${j._id}`} className="text-[10px] px-2 py-1 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 flex items-center gap-1">
                          <Eye size={10} />View
                        </Link>
                        <button onClick={() => handleDelete(j._id)} className="text-[10px] px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center gap-1">
                          <Trash2 size={10} />Delete
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
