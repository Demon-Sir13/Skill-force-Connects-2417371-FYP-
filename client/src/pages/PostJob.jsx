import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Briefcase, DollarSign, Calendar, Tag, FileText, ArrowRight, AlertCircle, MapPin, Zap, Clock, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'Healthcare', 'Security Services', 'Cleaning & Facility', 'Media & Marketing',
  'Construction', 'IT Services', 'Event Management', 'Manpower Agencies',
  'Design', 'Development', 'Administration', 'Electrical', 'Finance', 'Other',
];
const DISTRICTS = [
  'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan', 'Biratnagar',
  'Birgunj', 'Butwal', 'Dharan', 'Hetauda', 'Janakpur', 'Nepalgunj',
  'Dhangadhi', 'Itahari', 'Damak', 'Remote',
];
const URGENCY = ['low', 'medium', 'high', 'urgent'];
const JOB_TYPES = ['one-time', 'recurring', 'contract', 'part-time', 'full-time'];
const TODAY = new Date().toISOString().split('T')[0];

const urgencyColors = {
  low: 'text-gray-400', medium: 'text-brand-blue', high: 'text-yellow-400', urgent: 'text-red-400',
};

function validate(form) {
  const errs = {};
  if (!form.title.trim() || form.title.trim().length < 5) errs.title = 'Title must be at least 5 characters';
  if (form.title.trim().length > 120) errs.title = 'Title must be under 120 characters';
  if (!form.description.trim() || form.description.trim().length < 20) errs.description = 'Description must be at least 20 characters';
  if (!form.budget || isNaN(form.budget) || Number(form.budget) < 1) errs.budget = 'Enter a valid budget (min ₨1)';
  if (Number(form.budget) > 10_000_000) errs.budget = 'Budget cannot exceed ₨10,000,000';
  if (!form.deadline) errs.deadline = 'Deadline is required';
  else if (form.deadline <= TODAY) errs.deadline = 'Deadline must be in the future';
  return errs;
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="field-error mt-1"><AlertCircle size={12} />{msg}</p>;
}

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'Development', budget: '', deadline: '',
    district: 'Kathmandu', urgency: 'medium', jobType: 'one-time', skillsRequired: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = useCallback((f) => (e) => {
    setForm(prev => ({ ...prev, [f]: e.target.value }));
    setErrors(prev => ({ ...prev, [f]: '' }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const tid = toast.loading('Publishing job…');
    try {
      const skills = form.skillsRequired.split(',').map(s => s.trim()).filter(Boolean);
      await api.post('/jobs', {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        budget: Number(form.budget),
        deadline: form.deadline,
        district: form.district,
        location: form.district,
        urgency: form.urgency,
        jobType: form.jobType,
        skillsRequired: skills,
      });
      toast.success('Job published successfully!', { id: tid });
      navigate('/my-jobs');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to post job';
      toast.error(msg, { id: tid });
      if (err.response?.status === 409) setErrors({ title: msg });
    } finally {
      setLoading(false);
    }
  };

  const charCount = form.description.length;
  const budgetNum = Number(form.budget);

  return (
    <div className="page max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-sm">
            <Briefcase size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Post a New Job</h1>
        </div>
        <p className="text-gray-500 text-sm pl-[52px]">Fill in the details to attract the best providers.</p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          {/* Title */}
          <div>
            <label className="label" htmlFor="job-title">Job Title</label>
            <div className="relative">
              <FileText size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input id="job-title" className={`${errors.title ? 'input-error' : 'input'} pl-10`}
                placeholder="e.g. Build a React Dashboard" maxLength={120}
                value={form.title} onChange={set('title')} />
            </div>
            <div className="flex justify-between items-start mt-1">
              <FieldError msg={errors.title} />
              <span className={`text-[11px] ml-auto ${form.title.length > 100 ? 'text-yellow-400' : 'text-gray-600'}`}>{form.title.length}/120</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0" htmlFor="job-desc">Description</label>
              <button type="button" onClick={async () => {
                try {
                  const { data } = await api.get(`/jobs/generate-description/${encodeURIComponent(form.category)}`);
                  setForm(prev => ({
                    ...prev,
                    title: prev.title || data.title,
                    description: data.description,
                    skills: data.skills?.join(', ') || prev.skills,
                  }));
                  toast.success('AI description generated!');
                } catch { toast.error('Failed to generate'); }
              }} className="flex items-center gap-1.5 text-[11px] text-brand-blue hover:text-brand-blue/80 transition-colors">
                <Sparkles size={12} />Generate with AI
              </button>
            </div>
            <textarea id="job-desc" className={`${errors.description ? 'input-error' : 'input'} min-h-[140px] resize-y leading-relaxed`}
              placeholder="Describe the scope, requirements, deliverables, and any specific skills needed…"
              value={form.description} onChange={set('description')} />
            <div className="flex justify-between items-start mt-1">
              <FieldError msg={errors.description} />
              <span className={`text-[11px] ml-auto ${charCount < 20 ? 'text-gray-600' : 'text-emerald-500'}`}>
                {charCount} chars {charCount < 20 ? `(${20 - charCount} more needed)` : '✓'}
              </span>
            </div>
          </div>

          {/* Category + Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label" htmlFor="job-category">Category</label>
              <div className="relative">
                <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <select id="job-category" className="input pl-10 bg-surface-input appearance-none"
                  value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="job-budget">Budget (NPR)</label>
              <div className="relative">
                <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input id="job-budget" className={`${errors.budget ? 'input-error' : 'input'} pl-10`}
                  type="number" min="1" max="10000000" placeholder="5000"
                  value={form.budget} onChange={set('budget')} />
              </div>
              <FieldError msg={errors.budget} />
            </div>
          </div>

          {/* District + Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label" htmlFor="job-district">District</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <select id="job-district" className="input pl-10 bg-surface-input appearance-none"
                  value={form.district} onChange={set('district')}>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="job-deadline">Deadline</label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input id="job-deadline" className={`${errors.deadline ? 'input-error' : 'input'} pl-10`}
                  type="date" min={TODAY} value={form.deadline} onChange={set('deadline')} />
              </div>
              <FieldError msg={errors.deadline} />
            </div>
          </div>

          {/* Urgency + Job Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label" htmlFor="job-urgency">Urgency</label>
              <div className="relative">
                <Zap size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <select id="job-urgency" className="input pl-10 bg-surface-input appearance-none"
                  value={form.urgency} onChange={set('urgency')}>
                  {URGENCY.map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="job-type">Job Type</label>
              <div className="relative">
                <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <select id="job-type" className="input pl-10 bg-surface-input appearance-none"
                  value={form.jobType} onChange={set('jobType')}>
                  {JOB_TYPES.map(t => <option key={t} value={t}>{t.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="label" htmlFor="job-skills">Required Skills (comma separated)</label>
            <input id="job-skills" className="input" placeholder="e.g. React, Node.js, Figma"
              value={form.skillsRequired} onChange={set('skillsRequired')} />
            {form.skillsRequired && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.skillsRequired.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                  <span key={s} className="badge-blue text-[11px]">{s}</span>
                ))}
              </div>
            )}
          </div>

          {/* Live preview */}
          {form.title.trim().length >= 5 && (
            <div className="bg-surface-input border border-surface-border rounded-xl p-4 flex items-center gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0">
                <Briefcase size={14} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{form.title}</p>
                <p className="text-xs text-gray-500">
                  {form.category} · {form.district}
                  {budgetNum > 0 ? ` · ₨${budgetNum.toLocaleString()}` : ''}
                  {form.deadline ? ` · Due ${new Date(form.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-semibold capitalize ${urgencyColors[form.urgency]}`}>{form.urgency}</span>
                <span className="badge-green">Open</span>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2">
            {loading
              ? <><span className="spinner-sm" />Publishing…</>
              : <><span>Publish Job</span><ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
