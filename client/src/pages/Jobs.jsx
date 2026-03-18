import { useEffect, useState } from 'react';
import api from '../utils/api';
import JobCard from '../components/JobCard';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSEO } from '../utils/useSEO';
import { useDebounce } from '../utils/useDebounce';
import { SkeletonGrid } from '../components/Spinner';

const CATEGORIES = [
  'Healthcare', 'Security Services', 'Cleaning & Facility', 'Media & Marketing',
  'Construction', 'IT Services', 'Event Management', 'Manpower Agencies',
  'Design', 'Development', 'Administration', 'Electrical', 'Finance', 'Other',
];
const DISTRICTS = [
  'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan', 'Biratnagar',
  'Birgunj', 'Butwal', 'Dharan', 'Hetauda', 'Nepalgunj', 'Janakpur',
];
const STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [district, setDistrict] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search);

  useSEO({ title: 'Browse Jobs', description: 'Find freelance and contract jobs on SkillForce Nepal.' });

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (category) params.category = category;
    if (status) params.status = status;
    if (district) params.district = district;
    if (minBudget) params.minBudget = minBudget;
    if (maxBudget) params.maxBudget = maxBudget;
    api.get('/jobs', { params })
      .then(({ data }) => {
        setJobs(data.jobs || data);
        setTotal(data.total || 0);
        setTotalPages(data.pages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedSearch, category, status, district, minBudget, maxBudget, page]);

  useEffect(() => { setPage(1); }, [debouncedSearch, category, status, district, minBudget, maxBudget]);

  const clearFilters = () => { setSearch(''); setCategory(''); setStatus(''); setDistrict(''); setMinBudget(''); setMaxBudget(''); };
  const hasFilters = search || category || status || district || minBudget || maxBudget;

  return (
    <div className="page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Browse Jobs</h1>
          <p className="text-gray-500 text-sm mt-1">{total} opportunities available</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="btn-outline text-sm sm:hidden">
          <SlidersHorizontal size={15} />Filters
        </button>
      </div>

      <div className={`${showFilters ? 'flex' : 'hidden sm:flex'} flex-col sm:flex-row gap-3 mb-6`}>
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input pl-10" placeholder="Search jobs by title..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-44 bg-surface-input" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input sm:w-40 bg-surface-input" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className="input sm:w-40 bg-surface-input" value={district} onChange={e => setDistrict(e.target.value)}>
          <option value="">All Districts</option>
          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Budget range filter */}
      <div className={`${showFilters ? 'flex' : 'hidden sm:flex'} gap-3 mb-6`}>
        <input className="input w-32" type="number" placeholder="Min ₨" value={minBudget} onChange={e => setMinBudget(e.target.value)} />
        <input className="input w-32" type="number" placeholder="Max ₨" value={maxBudget} onChange={e => setMaxBudget(e.target.value)} />
        {hasFilters && (
          <button onClick={clearFilters} className="btn-ghost text-sm shrink-0"><X size={14} />Clear</button>
        )}
      </div>

      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {search && <span className="badge-blue">Search: {search}</span>}
          {category && <span className="badge-indigo">{category}</span>}
          {district && <span className="badge-blue">{district}</span>}
          {status && <span className="badge-yellow capitalize">{status}</span>}
          {(minBudget || maxBudget) && <span className="badge-green">₨{minBudget || '0'} - ₨{maxBudget || '∞'}</span>}
        </div>
      )}

      {loading ? (
        <SkeletonGrid count={6} className="h-48" />
      ) : jobs.length === 0 ? (
        <div className="card p-16 text-center">
          <Search size={36} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-2">No jobs found</p>
          {hasFilters && <button onClick={clearFilters} className="text-brand-blue text-sm hover:underline">Clear filters</button>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map(job => <JobCard key={job._id} job={job} />)}
          </div>

          {/* Pagination */}
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
