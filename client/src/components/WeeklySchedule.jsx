import { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DEFAULT_SCHEDULE = DAYS.map(day => ({
  day, startTime: '09:00', endTime: '17:00',
  available: !['Saturday','Sunday'].includes(day),
}));

export default function WeeklySchedule({ initial = [] }) {
  const [schedule, setSchedule] = useState(
    initial.length > 0 ? initial : DEFAULT_SCHEDULE
  );
  const [saving, setSaving] = useState(false);

  const toggle = (day) => setSchedule(s => s.map(d => d.day === day ? { ...d, available: !d.available } : d));
  const setTime = (day, field, val) => setSchedule(s => s.map(d => d.day === day ? { ...d, [field]: val } : d));

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/providers/schedule', { weeklySchedule: schedule });
      toast.success('Schedule saved');
    } catch { toast.error('Failed to save schedule'); }
    finally { setSaving(false); }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white">Weekly Availability Schedule</p>
        <button onClick={save} disabled={saving} className="btn-primary text-xs px-3 py-1.5">
          <Save size={12} />{saving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>
      <div className="space-y-2">
        {schedule.map(slot => (
          <div key={slot.day} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${slot.available ? 'bg-emerald-400/5 border border-emerald-400/20' : 'bg-surface-hover border border-surface-border'}`}>
            <button onClick={() => toggle(slot.day)}
              className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${slot.available ? 'bg-emerald-400' : 'bg-gray-600'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${slot.available ? 'left-5' : 'left-0.5'}`} />
            </button>
            <span className={`text-sm font-medium w-24 ${slot.available ? 'text-white' : 'text-gray-500'}`}>{slot.day}</span>
            {slot.available ? (
              <div className="flex items-center gap-2 ml-auto">
                <input type="time" value={slot.startTime} onChange={e => setTime(slot.day, 'startTime', e.target.value)}
                  className="input text-xs py-1 px-2 w-24" />
                <span className="text-gray-500 text-xs">to</span>
                <input type="time" value={slot.endTime} onChange={e => setTime(slot.day, 'endTime', e.target.value)}
                  className="input text-xs py-1 px-2 w-24" />
              </div>
            ) : (
              <span className="text-xs text-gray-600 ml-auto">Not available</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
