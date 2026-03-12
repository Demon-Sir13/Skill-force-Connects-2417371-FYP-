import { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { X, Star } from 'lucide-react';

export default function RateProviderModal({ job, onClose, onRated }) {
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(false);

  const provider = job.assignedProviderId;

  const handleSubmit = async () => {
    if (!rating) return toast.error('Please select a rating');
    setLoading(true);
    try {
      await api.post(`/jobs/${job._id}/rate`, { rating });
      toast.success(`Rated ${provider?.name} ${rating} ★`);
      onRated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  const display = hovered || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm card p-0 overflow-hidden shadow-card animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <h2 className="font-semibold text-white">Rate Provider</h2>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg"><X size={18} /></button>
        </div>

        <div className="px-6 py-6 flex flex-col items-center gap-6">
          {/* Provider info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold shadow-glow-sm">
              {provider?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white">{provider?.name}</p>
              <p className="text-xs text-gray-500 truncate max-w-[180px]">{job.title}</p>
            </div>
          </div>

          {/* Stars */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110 active:scale-95">
                  <Star
                    size={36}
                    className={`transition-colors ${n <= display ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                  />
                </button>
              ))}
            </div>
            <p className={`text-sm font-medium transition-colors ${display ? 'text-yellow-400' : 'text-gray-500'}`}>
              {display ? labels[display] : 'Select a rating'}
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 w-full">
            <button onClick={onClose} className="btn-ghost flex-1 border border-surface-border">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={!rating || loading}
              className="btn-primary flex-1">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Submit Rating'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
