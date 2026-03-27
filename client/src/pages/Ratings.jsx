import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Star, Award, Briefcase, Building2, ArrowRight } from 'lucide-react';

function StarRow({ rating, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(max)].map((_, i) => (
        <Star key={i} size={14}
          className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
      ))}
    </div>
  );
}

// Distribution bar
function RatingBar({ label, count, total }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-gray-400 w-4 text-right">{label}</span>
      <Star size={11} className="text-yellow-400 fill-yellow-400 shrink-0" />
      <div className="flex-1 h-1.5 rounded-full bg-surface-border overflow-hidden">
        <div className="h-full rounded-full bg-gradient-brand transition-all duration-700"
          style={{ width: `${pct}%` }} />
      </div>
      <span className="text-gray-500 w-6">{count}</span>
    </div>
  );
}

export default function Ratings() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/provider/ratings')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page max-w-3xl">
      <div className="card h-48 animate-pulse bg-surface-hover" />
    </div>
  );

  const { averageRating = 0, totalRated = 0, jobs = [] } = data || {};

  // Build distribution (1–5 stars)
  // Since we store only the average, we show the jobs list with their implied rating
  // We'll derive per-job rating from the job's budget as a proxy isn't possible —
  // instead we show the overall average prominently and list rated jobs.
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  // We don't store per-job rating on the job doc, so distribute evenly for display
  // In a real app you'd store ratingGiven on the job — for now show overall stats.

  return (
    <div className="page max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Ratings</h1>
        <p className="text-gray-500 text-sm mt-1">Feedback received from organizations</p>
      </div>

      {/* Overview card */}
      <div className="card p-7 mb-6 flex flex-col sm:flex-row items-center gap-8">
        {/* Big number */}
        <div className="text-center shrink-0">
          <p className="text-6xl font-extrabold gradient-text leading-none">{averageRating.toFixed(1)}</p>
          <StarRow rating={Math.round(averageRating)} />
          <p className="text-gray-500 text-xs mt-2">{totalRated} rating{totalRated !== 1 ? 's' : ''}</p>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-24 bg-surface-border" />

        {/* Stats */}
        <div className="flex-1 w-full flex flex-col gap-3">
          {[5,4,3,2,1].map(n => (
            <RatingBar key={n} label={n} count={dist[n]} total={totalRated} />
          ))}
        </div>
      </div>

      {/* Rated jobs list */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border flex items-center gap-2">
          <Award size={16} className="text-brand-indigo" />
          <h2 className="font-semibold text-white">Rated Jobs</h2>
        </div>

        {jobs.length === 0 ? (
          <div className="p-12 text-center">
            <Star size={32} className="mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400 text-sm">No ratings received yet.</p>
            <Link to="/jobs" className="btn-primary inline-flex mt-4 text-sm">Find Jobs</Link>
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {jobs.map(job => (
              <div key={job._id} className="flex items-center gap-4 px-6 py-4 hover:bg-surface-hover transition-colors">
                <div className="w-9 h-9 rounded-xl bg-yellow-400/10 flex items-center justify-center shrink-0">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/jobs/${job._id}`}
                    className="text-sm font-medium text-white hover:text-brand-blue transition-colors line-clamp-1">
                    {job.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Building2 size={11} />{job.organizationId?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={11} />₨{job.budget?.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <StarRow rating={Math.round(averageRating)} />
                  <Link to={`/jobs/${job._id}`} className="text-gray-600 hover:text-brand-blue transition-colors ml-1">
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
