import { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Circle, ChevronDown, Briefcase, Clock, WifiOff } from 'lucide-react';

const STATUS_CONFIG = {
  available: { label: 'Available', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', dot: 'bg-emerald-400', icon: Circle },
  busy:      { label: 'Busy',      color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  border: 'border-yellow-400/30',  dot: 'bg-yellow-400',  icon: Briefcase },
  unavailable: { label: 'Offline', color: 'text-gray-400',    bg: 'bg-gray-400/10',    border: 'border-gray-400/30',    dot: 'bg-gray-400',    icon: WifiOff },
};

const WORK_MODES = [
  { value: 'any',       label: 'Any Work Type' },
  { value: 'freelance', label: 'Freelance (One-time)' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'full-time', label: 'Full-Time' },
];

export default function AvailabilityToggle({ current = 'available', workMode = 'any', onUpdate }) {
  const [status, setStatus] = useState(current);
  const [mode, setMode] = useState(workMode);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.available;

  const handleChange = async (newStatus) => {
    setSaving(true);
    setOpen(false);
    try {
      const { data } = await api.put('/providers/availability', { availability: newStatus, workMode: mode });
      setStatus(newStatus);
      toast.success(`Status: ${STATUS_CONFIG[newStatus].label}`);
      onUpdate?.(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  const handleModeChange = async (newMode) => {
    try {
      await api.put('/providers/availability', { workMode: newMode });
      setMode(newMode);
      toast.success('Work mode updated');
    } catch {}
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Status toggle */}
      <div className="relative">
        <button onClick={() => setOpen(!open)} disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${cfg.bg} ${cfg.border} transition-all`}>
          <span className={`w-2 h-2 rounded-full ${cfg.dot} ${status === 'available' ? 'animate-pulse' : ''}`} />
          <span className={`text-sm font-semibold ${cfg.color}`}>{saving ? 'Saving...' : cfg.label}</span>
          <ChevronDown size={13} className={`${cfg.color} transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute top-full mt-1 left-0 w-48 card p-1 z-50 animate-fade-in shadow-card-hover">
            {Object.entries(STATUS_CONFIG).map(([key, c]) => (
              <button key={key} onClick={() => handleChange(key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-surface-hover ${status === key ? c.color + ' font-semibold' : 'text-gray-400'}`}>
                <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Work mode selector */}
      <select value={mode} onChange={e => handleModeChange(e.target.value)}
        className="input text-xs py-2 px-3 w-auto bg-surface-input">
        {WORK_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
      </select>
    </div>
  );
}
