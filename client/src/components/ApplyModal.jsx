import { useState } from 'react';
import { X, Send, ChevronRight, ChevronLeft, CheckCircle, User, FileText, Upload, Eye } from 'lucide-react';
import FileDropzone from './FileDropzone';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, label: 'About You',   icon: User },
  { id: 2, label: 'Documents',   icon: Upload },
  { id: 3, label: 'Review',      icon: Eye },
];

export default function ApplyModal({ job, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    coverLetter: '',
    portfolioLink: '',
    expectedSalary: '',
    availabilityDate: '',
  });
  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({});

  const handleFile = (name, file) => setFiles(prev => ({ ...prev, [name]: file }));
  const set = (f) => (e) => {
    setForm(prev => ({ ...prev, [f]: e.target.value }));
    if (errors[f]) setErrors(prev => ({ ...prev, [f]: '' }));
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.coverLetter.trim() || form.coverLetter.trim().length < 30)
      errs.coverLetter = 'Cover letter must be at least 30 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!files.resume) errs.resume = 'Resume is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  };

  const back = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('coverLetter', form.coverLetter.trim());
      fd.append('portfolioLink', form.portfolioLink);
      fd.append('expectedSalary', form.expectedSalary ? Number(form.expectedSalary) : 0);
      if (form.availabilityDate) fd.append('availabilityDate', form.availabilityDate);
      if (files.resume)      fd.append('resume',      files.resume);
      if (files.citizenship) fd.append('citizenship', files.citizenship);
      if (files.certificate) fd.append('certificate', files.certificate);

      await api.post(`/applications/${job._id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Application submitted successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden animate-scale-in"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-hover)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="font-semibold text-base" style={{ color: 'var(--text)' }}>
              Apply for Position
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {job.title}
            </p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center px-6 py-4 gap-2"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--hover)' }}>
          {STEPS.map((s, i) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                    style={{
                      background: done ? 'rgba(16,185,129,0.15)' : active ? 'rgba(14,165,233,0.15)' : 'var(--border)',
                      color: done ? '#34d399' : active ? 'var(--brand-blue)' : 'var(--text-muted)',
                      border: `1px solid ${done ? 'rgba(16,185,129,0.3)' : active ? 'rgba(14,165,233,0.3)' : 'var(--border)'}`,
                    }}>
                    {done ? <CheckCircle size={13} /> : s.id}
                  </div>
                  <span className="text-xs font-medium hidden sm:block"
                    style={{ color: active ? 'var(--text)' : 'var(--text-muted)' }}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px mx-2" style={{ background: 'var(--border)' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">

          {/* STEP 1 — Cover Letter + Details */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="label">
                  Cover Letter <span className="text-red-400">*</span>
                </label>
                <textarea
                  className={`input min-h-[120px] resize-y ${errors.coverLetter ? 'input-error' : ''}`}
                  placeholder="Tell the organization why you're the right fit for this role. Mention your relevant experience, skills, and availability..."
                  value={form.coverLetter}
                  onChange={set('coverLetter')}
                />
                {errors.coverLetter && (
                  <p className="field-error">{errors.coverLetter}</p>
                )}
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  {form.coverLetter.length} characters
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Expected Salary (NPR)</label>
                  <input
                    className="input"
                    type="number"
                    placeholder="e.g. 50000"
                    value={form.expectedSalary}
                    onChange={set('expectedSalary')}
                  />
                </div>
                <div>
                  <label className="label">Available From</label>
                  <input
                    className="input"
                    type="date"
                    value={form.availabilityDate}
                    onChange={set('availabilityDate')}
                  />
                </div>
              </div>

              <div>
                <label className="label">Portfolio / Work Link</label>
                <input
                  className="input"
                  placeholder="https://github.com/... or https://behance.net/..."
                  value={form.portfolioLink}
                  onChange={set('portfolioLink')}
                />
              </div>
            </div>
          )}

          {/* STEP 2 — Document Uploads */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-xl text-sm"
                style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)', color: 'var(--brand-blue)' }}>
                Upload your documents to strengthen your application. Resume is required.
              </div>

              <FileDropzone
                label="Resume / CV"
                name="resume"
                type="resume"
                onFile={handleFile}
                required
                hint="Your most recent CV or resume"
              />
              {errors.resume && <p className="field-error -mt-2">{errors.resume}</p>}

              <FileDropzone
                label="Citizenship / National ID"
                name="citizenship"
                type="citizenship"
                onFile={handleFile}
                hint="Optional — helps with verification"
              />

              <FileDropzone
                label="Certificate / Qualification"
                name="certificate"
                type="certificate"
                onFile={handleFile}
                hint="Optional — relevant certifications"
              />
            </div>
          )}

          {/* STEP 3 — Review */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl" style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                  Application Summary
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Cover Letter</p>
                    <p className="text-sm leading-relaxed line-clamp-4" style={{ color: 'var(--text-secondary)' }}>
                      {form.coverLetter}
                    </p>
                  </div>
                  {form.expectedSalary && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Expected Salary</span>
                      <span className="text-sm font-semibold text-emerald-400">
                        ₨{Number(form.expectedSalary).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {form.availabilityDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Available From</span>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(form.availabilityDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {form.portfolioLink && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Portfolio</span>
                      <a href={form.portfolioLink} target="_blank" rel="noreferrer"
                        className="text-xs text-brand-blue hover:underline truncate max-w-[200px]">
                        {form.portfolioLink}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents summary */}
              <div className="p-4 rounded-xl" style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                  Documents
                </p>
                <div className="space-y-2">
                  {[
                    { key: 'resume', label: 'Resume / CV', required: true },
                    { key: 'citizenship', label: 'Citizenship / ID', required: false },
                    { key: 'certificate', label: 'Certificate', required: false },
                  ].map(({ key, label, required }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                      {files[key] ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle size={11} />{files[key].name.slice(0, 20)}...
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: required ? '#f87171' : 'var(--text-disabled)' }}>
                          {required ? 'Missing — required' : 'Not uploaded'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl text-xs"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', color: '#34d399' }}>
                ✓ By submitting, you confirm this information is accurate and you are available for this role.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={step === 1 ? onClose : back}
            className="btn-ghost text-sm"
          >
            {step === 1 ? (
              <><X size={14} />Cancel</>
            ) : (
              <><ChevronLeft size={14} />Back</>
            )}
          </button>

          {step < 3 ? (
            <button onClick={next} className="btn-primary text-sm">
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary text-sm"
            >
              {submitting
                ? <><span className="spinner-sm" />Submitting...</>
                : <><Send size={14} />Submit Application</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
