/**
 * AvailabilityToggle Component
 * 
 * Allows providers to update their availability status in real-time.
 * Calls PUT /api/providers/availability on every change.
 * 
 * Props:
 *   current   - current availability from DB ('available' | 'busy' | 'unavailable')
 *   workMode  - current work mode from DB
 *   onUpdate  - callback with updated profile data after save
 */
import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ChevronDown, Briefcase, WifiOff, CheckCircle } from 'lucide-react';

// Status configuration — color, label, dot color for each state
const STATUS_CONFIG = {
  available:   { label: 'Available', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400', pulse: true },
  busy:        { label: 'Busy',      color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30',  dot: 'bg-yellow-400',  pulse: false },
  unavailable: { label: 'Offline',   color: 'text-gray-400',    bg: 'bg-gray-500/10',    border: 'border-gray-500/30',    dot: 'bg-gray-500',    pulse: false },
};

const WORK_MODES = [
  { value: 'any',       label: 'Any Work Type' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'full-time', label: 'Full-Time' },
];

export default function AvailabilityToggle({ current = 'available', workMode = 'any', onUpdate }) {
  // Sync internal state when parent prop changes (e.g. after profile loads from API)
  const [status, setStatus] = useState(current);
  const [mode, setMode] = useState(workMode);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const dropRef = useRef(null);

  // KEY FIX: sync with parent when prop changes
  useEffect(() => { setStatus(current); }, [current]);
  useEffect(() => { setMode(workMode); }, [workMode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.available;

  /**
   * handleChange — called when user picks a new status from dropdown
   * Sends PUT /api/providers/availability to backend
   * Updates local state optimistically, reverts on error
   */
  const handleChange = async (newStatus) => {
    if (newStatus === status) { setOpen(false); return; }
    const prev = status;
    setStatus(newStatus); // optimistic update
    setOpen(false);
    setSaving(true);
    try {
      const { data } = await api.put('/providers/availability', {
        availability: newStatus,
        workMode: mode,
      });
      toast.success(`Status updated: ${STATUS_CONFIG[newStatus].label}`, { icon: '✅' });
      onUpdate?.(data); // notify parent with full updated profile
    } catch (err) {
      setStatus(prev); // revert on error
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  /**
   * handleModeChange — updates work mode preference
   */
  const handleModeChange = async (newMode) => {
    const prev = mode;
    setMode(newMode);
    try {
      await api.put('/providers/availability', { workMode: newMode });
      toast.success('Work mode updated');
    } catch {
      setMode(prev);
      toast.error('Failed to update work mode');
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* ── Status Dropdown ── */}
      <div className="relative" ref={dropRef}>
        <button
          onClick={() => !saving && setOpen(!open)}
          disabled={saving}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border font-medium
            transition-all duration-200 hover:opacity-90 active:scale-95
            ${cfg.bg} ${cfg.border} ${saving ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {/* Animated status dot */}
          <span className="relative flex h-2.5 w-2.5">
            {cfg.pulse && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-60`} />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cfg.dot}`} />
          </span>
          <span className={`text-sm ${cfg.color}`}>
            {saving ? 'Saving...' : cfg.label}
          </span>
          <ChevronDown
            size={14}
            className={`${cfg.color} transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown menu */}
        {open && (
          <div className="absolute top-full mt-2 left-0 w-52 bg-surface-card border border-surface-border rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50 overflow-hidden animate-fade-in">
            <div className="p-1.5">
              {Object.entries(STATUS_CONFIG).map(([key, c]) => (
                <button
                  key={key}
                  onClick={() => handleChange(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                    transition-all duration-150 hover:bg-surface-hover
                    ${status === key ? 'bg-surface-hover' : ''}`}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    {c.pulse && status === key && (
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.dot} opacity-60`} />
                    )}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${c.dot}`} />
                  </span>
                  <span className={status === key ? c.color + ' font-semibold' : 'text-gray-400'}>
                    {c.label}
                  </span>
                  {status === key && <CheckCircle size={13} className={`ml-auto ${c.color}`} />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Work Mode Selector ── */}
      <select
        value={mode}
        onChange={e => handleModeChange(e.target.value)}
        className="input text-xs py-2 px-3 bg-surface-input border border-surface-border rounded-xl
          text-gray-300 focus:border-brand-blue/50 transition-colors cursor-pointer"
        style={{ width: 'auto', minWidth: '130px' }}
      >
        {WORK_MODES.map(m => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
    </div>
  );
}
