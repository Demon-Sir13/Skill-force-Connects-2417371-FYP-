import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function ChangePassword() {
  const { changePassword } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const toggle = f => setShow(s => ({ ...s, [f]: !s[f] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm)
      return toast.error('New passwords do not match');
    setLoading(true);
    try {
      await changePassword(form.currentPassword, form.newPassword);
      toast.success('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const PwField = ({ label, field, placeholder }) => (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input className="input pr-11" type={show[field] ? 'text' : 'password'} placeholder={placeholder}
          value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} required />
        <button type="button" onClick={() => toggle(field)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
          {show[field] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-4 shadow-glow-blue">
            <Lock size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Change Password</h1>
          <p className="text-gray-500 text-sm mt-1">Keep your account secure</p>
        </div>

        <div className="card p-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <PwField label="Current Password"    field="currentPassword" placeholder="Your current password" />
            <PwField label="New Password"         field="newPassword"     placeholder="Min 6 characters" />
            <PwField label="Confirm New Password" field="confirm"         placeholder="Repeat new password" />

            <div className="bg-surface-input border border-surface-border rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck size={16} className="text-brand-blue mt-0.5 shrink-0" />
              <p className="text-xs text-gray-500 leading-relaxed">
                Use at least 8 characters with a mix of uppercase letters and numbers for a strong password.
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-1">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </span>
              ) : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
