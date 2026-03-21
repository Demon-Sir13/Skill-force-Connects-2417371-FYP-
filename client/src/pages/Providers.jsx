import { useEffect, useState } from 'react';
import api from '../utils/api';
import ProviderCard from '../components/ProviderCard';
import { Search, Users, X, ChevronLeft, ChevronRight, Star, MapPin } from 'lucide-react';

const POPULAR_SKILLS = ['React', 'Node.js', 'Python', 'Design', 'Marketing', 'DevOps', 'Security', 'Cleaning'];

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skill, setSkill] = useState('');
  const [availability, setAvailability] = useState('');
  const [location, setLocation] = useState('');
  const [minRating, setMinRating] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const params = { page, limit: 12 };
      if (skill) params.skill = skill;
      if (availability) params.availability = availability;
      if (location) params.location = location;
      if (minRating) params.rating = minRating;
      api.get('/providers', { params })
        .then(({ data }) => {
          setProviders(data.providers || data);
          setTotal(data.total || 0);
          setTotalPages(data.pages || 1);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [skill, availability, location, minRating, page]);

  useEffect(() => { setPage(1); }, [skill, availability, location, minRating]);

  const clearAll = () => { setSkill(''); setAvailability(''); setLocation(''); setMinRating(''); };
  const hasFilters = skill || availability || location || minRating;

  return (
    <div className="page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Service Providers</h1>
        <p className="text-gray-500 text-sm">{total} providers available</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input pl-10" placeholder="Filter by skill..." value={skill} onChange={e => setSkill(e.target.value)} />
        </div>
        <div className="relative min-w-[160px]">
          <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input pl-10" placeholder="Location..." value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <select className="input w-40 bg-surface-input" value={availability} onChange={e => setAvailability(e.target.value)}>
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="busy">Busy</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <select className="input w-36 bg-surface-input" value={minRating} onChange={e => setMinRating(e.target.value)}>
          <option value="">Any Rating</option>
          <option value="4">4+ Stars</option>
          <option value="4.5">4.5+ Stars</option>
          <option value="3">3+ Stars</option>
        </select>
        {hasFilters && (
          <button onClick={clearAll} className="btn-ghost text-sm"><X size={14} />Clear</button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {POPULAR_SKILLS.map(s => (
          <button key={s} onClick={() => setSkill(skill === s ? '' : s)}
            className={`badge cursor-pointer transition-all ${skill === s ? 'badge-blue shadow-glow-sm' : 'badge-gray hover:badge-blue'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-52 animate-pulse bg-surface-hover" />)}
        </div>
      ) : providers.length === 0 ? (
        <div className="card p-16 text-center">
          <Users size={36} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No providers found{skill ? ` for "${skill}"` : ''}.</p>
          {hasFilters && <button onClick={clearAll} className="text-brand-blue text-sm hover:underline mt-2">Clear filters</button>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map(p => <ProviderCard key={p._id} provider={p} />)}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-ghost px-3 py-2 disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === i + 1 ? 'bg-gradient-brand text-white shadow-glow-sm' : 'text-gray-400 hover:text-white hover:bg-surface-hover'}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-ghost px-3 py-2 disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
