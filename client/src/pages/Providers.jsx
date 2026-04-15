/**
 * Providers Browse Page
 * 
 * Lists all service providers with real-time filtering by:
 * - Availability status (available / busy / offline)
 * - Work mode (freelance / part-time / full-time)
 * - Skills, location, rating
 * 
 * Filters update results instantly without page refresh.
 */
import { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import ProviderCard from '../components/ProviderCard';
import { Search, Users, X, ChevronLeft, ChevronRight, MapPin, RefreshCw } from 'lucide-react';
import { useDebounce } from '../utils/useDebounce';

const POPULAR_SKILLS = ['React', 'Node.js', 'Security', 'Cleaning', 'Nursing', 'Electrical', 'Design', 'Marketing'];

// Availability filter buttons config
const AVAIL_FILTERS = [
  { value: '',            label: 'All Providers',   dot: 'bg-gray-500',    active: 'bg-white/[0.06] border-white/[0.12] text-white' },
  { value: 'available',  label: '🟢 Available Now', dot: 'bg-emerald-400', active: 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400' },
  { value: 'busy',       label: '🟡 Busy',          dot: 'bg-yellow-400',  active: 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' },
  { value: 'unavailable',label: '⚫ Offline',        dot: 'bg-gray-500',    active: 'bg-gray-500/10 border-gray-500/30 text-gray-400' },
];

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter state
  const [skill, setSkill] = useState('');
  const [availability, setAvailability] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [location, setLocation] = useState('');
  const [minRating, setMinRating] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounce text inputs to avoid too many API calls
  const debouncedSkill = useDebounce(skill, 400);
  const debouncedLocation = useDebounce(location, 400);

  /**
   * fetchProviders — calls GET /api/providers with current filters
   * Called on every filter change
   */
  const fetchProviders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = { page, limit: 12 };
      if (debouncedSkill) params.skill = debouncedSkill;
      if (availability) params.availability = availability;
      if (workMode) params.workMode = workMode;
      if (debouncedLocation) params.location = debouncedLocation;
      if (minRating) params.rating = minRating;

      const { data } = await api.get('/providers', { params });
      setProviders(data.providers || data);
      setTotal(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch {
      // silent fail — keep existing results
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSkill, availability, workMode, debouncedLocation, minRating, page]);

  // Fetch when filters change
  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [debouncedSkill, availability, workMode, debouncedLocation, minRating]);

  const clearAll = () => {
    setSkill(''); setAvailability(''); setWorkMode('');
    setLocation(''); setMinRating(''); setPage(1);
  };
  const hasFilters = skill || availability || workMode || location || minRating;

  return (
    <div className="page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Service Providers</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {loading ? 'Loading...' : `${total} providers found`}
          </p>
        </div>
        <button onClick={() => fetchProviders(true)} disabled={refreshing}
          className="btn-ghost text-sm border border-surface-border">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Availability Quick Filters ── */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {AVAIL_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setAvailability(f.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200
              ${availability === f.value
                ? f.active
                : 'border-surface-border text-gray-500 hover:border-white/[0.1] hover:text-gray-300'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Search & Filters ── */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input pl-10" placeholder="Search by skill..."
            value={skill} onChange={e => setSkill(e.target.value)} />
        </div>
        <div className="relative min-w-[150px]">
          <MapPin size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input pl-10" placeholder="Location..."
            value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <select className="input w-36 bg-surface-input" value={workMode} onChange={e => setWorkMode(e.target.value)}>
          <option value="">All Work Types</option>
          <option value="freelance">Freelance</option>
          <option value="part-time">Part-Time</option>
          <option value="full-time">Full-Time</option>
        </select>
        <select className="input w-32 bg-surface-input" value={minRating} onChange={e => setMinRating(e.target.value)}>
          <option value="">Any Rating</option>
          <option value="4">4+ Stars</option>
          <option value="4.5">4.5+ Stars</option>
          <option value="3">3+ Stars</option>
        </select>
        {hasFilters && (
          <button onClick={clearAll} className="btn-ghost text-sm">
            <X size={13} />Clear All
          </button>
        )}
      </div>

      {/* ── Popular Skills ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {POPULAR_SKILLS.map(s => (
          <button key={s} onClick={() => setSkill(skill === s ? '' : s)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200
              ${skill === s
                ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue'
                : 'border-surface-border text-gray-500 hover:border-white/[0.1] hover:text-gray-300'
              }`}>
            {s}
          </button>
        ))}
      </div>

      {/* ── Results ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-surface-card border border-surface-border">
              <div className="h-1 bg-surface-hover" />
              <div className="h-14 bg-surface-hover" />
              <div className="p-4 -mt-6 space-y-3">
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-xl bg-surface-hover animate-pulse" />
                  <div className="flex-1 space-y-2 pt-6">
                    <div className="h-3 bg-surface-hover rounded animate-pulse w-3/4" />
                    <div className="h-2 bg-surface-hover rounded animate-pulse w-1/2" />
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, j) => <div key={j} className="h-5 w-16 bg-surface-hover rounded animate-pulse" />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="card p-16 text-center">
          <Users size={36} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-1">No providers found</p>
          <p className="text-gray-600 text-sm">
            {availability === 'available' ? 'No providers are available right now.' : 'Try adjusting your filters.'}
          </p>
          {hasFilters && (
            <button onClick={clearAll} className="text-brand-blue text-sm hover:underline mt-3">
              Clear all filters
            </button>
          )}
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
              {[...Array(Math.min(totalPages, 7))].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
                    ${page === i + 1 ? 'bg-gradient-brand text-white shadow-glow-sm' : 'text-gray-400 hover:text-white hover:bg-surface-hover'}`}>
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
