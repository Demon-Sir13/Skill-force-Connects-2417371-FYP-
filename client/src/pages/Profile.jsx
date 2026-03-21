import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Building2, Wrench, Save, Plus, X, Link as LinkIcon, CheckCircle, MapPin, Phone, Globe, Award, BookOpen } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

function completeness(profile, isOrg) {
  if (isOrg) {
    const checks = [!!profile?.companyName, !!profile?.description, !!profile?.industry, !!profile?.location, !!profile?.phone];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }
  const checks = [
    !!profile?.skills?.length, !!profile?.experience?.trim(), !!profile?.bio?.trim(),
    !!profile?.location, !!profile?.phone, !!profile?.hourlyRate,
    !!profile?.portfolioLinks?.filter(Boolean).length,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

const SUGGESTED_SKILLS = ['React', 'Node.js', 'Python', 'Graphic Design', 'Security', 'Cleaning', 'Nursing', 'Electrical', 'Marketing', 'Figma'];

export default function Profile() {
  const { user, updateUser: updateAuthUser } = useAuth();
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const isOrg = user?.role === 'organization';
  const getUrl = isOrg ? `/organizations/${user?._id}` : `/providers/${user?._id}`;
  const putUrl = isOrg ? '/organizations/me' : '/providers/me';

  useEffect(() => {
    if (!user) return;
    api.get(getUrl).then(({ data }) => setProfile(data)).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await api.put(putUrl, profile); toast.success('Profile updated'); }
    catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const set = f => e => setProfile({ ...profile, [f]: e.target.value });
  const addSkill = (s) => {
    const skill = (s || skillInput).trim();
    if (!skill || profile.skills?.includes(skill)) return;
    setProfile({ ...profile, skills: [...(profile.skills || []), skill] });
    setSkillInput('');
  };
  const removeSkill = s => setProfile({ ...profile, skills: profile.skills.filter(x => x !== s) });

  if (loading) return <div className="page max-w-3xl"><div className="card h-64 animate-pulse bg-surface-hover" /></div>;

  const pct = completeness(profile, isOrg);

  return (
    <div className="page max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <ImageUpload currentImage={user?.profileImage} name={user?.name} size="xl"
          onUploaded={(url) => updateAuthUser({ profileImage: url })} />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {isOrg
              ? <span className="badge-indigo flex items-center gap-1"><Building2 size={11} />{user?.orgType === 'service_provider' ? 'Service Provider Org' : 'Hiring Organization'}</span>
              : <span className="badge-blue flex items-center gap-1"><Wrench size={11} />Individual Provider</span>}
            <span className="text-gray-500 text-xs">{user?.email}</span>
          </div>
          {user?.trustScore != null && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">Trust Score:</span>
              <div className="w-20 h-1.5 rounded-full bg-surface-border overflow-hidden">
                <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${user.trustScore}%` }} />
              </div>
              <span className="text-xs font-semibold text-brand-blue">{user.trustScore}/100</span>
            </div>
          )}
        </div>
      </div>

      {/* Completeness bar */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-white">Profile Completeness</p>
          <span className={`text-sm font-bold ${pct === 100 ? 'text-emerald-400' : 'text-brand-blue'}`}>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-surface-border overflow-hidden">
          <div className="h-full rounded-full bg-gradient-brand transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        {pct < 100 && <p className="text-xs text-gray-500 mt-2">Complete your profile to get more opportunities.</p>}
        {pct === 100 && <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><CheckCircle size={12} />Profile complete!</p>}
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {isOrg ? (
          <>
            <div className="card p-7 flex flex-col gap-5">
              <h2 className="font-semibold text-white flex items-center gap-2"><Building2 size={16} className="text-brand-indigo" />Organization Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div><label className="label">Company Name</label><input className="input" value={profile.companyName || ''} onChange={set('companyName')} /></div>
                <div><label className="label">Industry</label><input className="input" placeholder="e.g. Healthcare" value={profile.industry || ''} onChange={set('industry')} /></div>
                <div><label className="label">Location</label><input className="input" placeholder="e.g. Kathmandu" value={profile.location || ''} onChange={set('location')} /></div>
                <div><label className="label">Phone</label><input className="input" placeholder="+977-01-XXXXXXX" value={profile.phone || ''} onChange={set('phone')} /></div>
                <div><label className="label">Website</label><input className="input" placeholder="https://company.com.np" value={profile.website || ''} onChange={set('website')} /></div>
                <div><label className="label">Established Year</label><input className="input" type="number" placeholder="2020" value={profile.establishedYear || ''} onChange={e => setProfile({ ...profile, establishedYear: parseInt(e.target.value) || '' })} /></div>
                <div><label className="label">Employee Count</label><input className="input" placeholder="e.g. 50-100" value={profile.employeeCount || ''} onChange={set('employeeCount')} /></div>
                <div><label className="label">PAN Number</label><input className="input" placeholder="Tax registration" value={profile.panNumber || ''} onChange={set('panNumber')} /></div>
              </div>
              <div><label className="label">Description</label><textarea className="input min-h-[110px] resize-y" placeholder="Tell about your organization..." value={profile.description || ''} onChange={set('description')} /></div>
              <div>
                <label className="label">{user?.orgType === 'service_provider' ? 'Services Offered' : 'Required Skills'} (comma separated)</label>
                <input className="input" placeholder="e.g. Security, Cleaning, Staffing"
                  value={(user?.orgType === 'service_provider' ? profile.servicesOffered : profile.requiredSkills || []).join(', ')}
                  onChange={e => {
                    const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setProfile({ ...profile, [user?.orgType === 'service_provider' ? 'servicesOffered' : 'requiredSkills']: arr });
                  }} />
              </div>
              <div>
                <label className="label">Service Areas (comma separated)</label>
                <input className="input" placeholder="e.g. Kathmandu, Lalitpur, Bhaktapur"
                  value={(profile.serviceAreas || []).join(', ')}
                  onChange={e => setProfile({ ...profile, serviceAreas: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Bio & Contact */}
            <div className="card p-7 flex flex-col gap-5">
              <h2 className="font-semibold text-white flex items-center gap-2"><User size={16} className="text-brand-blue" />About You</h2>
              <div><label className="label">Bio</label><textarea className="input min-h-[80px] resize-y" placeholder="Short bio about yourself..." value={profile.bio || ''} onChange={set('bio')} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div><label className="label">Location</label><input className="input" placeholder="e.g. Kathmandu" value={profile.location || ''} onChange={set('location')} /></div>
                <div><label className="label">Phone</label><input className="input" placeholder="+977-98XXXXXXXX" value={profile.phone || ''} onChange={set('phone')} /></div>
                <div><label className="label">Hourly Rate (NPR)</label><input className="input" type="number" placeholder="1500" value={profile.hourlyRate || ''} onChange={e => setProfile({ ...profile, hourlyRate: parseInt(e.target.value) || 0 })} /></div>
                <div>
                  <label className="label">Availability</label>
                  <select className="input bg-surface-input" value={profile.availability || 'available'} onChange={e => setProfile({ ...profile, availability: e.target.value })}>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div><label className="label">Education</label><input className="input" placeholder="e.g. BSc CSIT, TU" value={profile.education || ''} onChange={set('education')} /></div>
                <div><label className="label">Languages (comma separated)</label><input className="input" placeholder="Nepali, English, Hindi" value={(profile.languages || []).join(', ')} onChange={e => setProfile({ ...profile, languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></div>
              </div>
            </div>

            {/* Skills */}
            <div className="card p-7 flex flex-col gap-5">
              <h2 className="font-semibold text-white flex items-center gap-2"><Wrench size={16} className="text-brand-blue" />Skills</h2>
              <div className="flex flex-wrap gap-2 min-h-[36px]">
                {profile.skills?.length > 0 ? profile.skills.map(s => (
                  <span key={s} className="badge-blue flex items-center gap-1.5 text-sm px-3 py-1">{s}
                    <button type="button" onClick={() => removeSkill(s)} className="hover:text-white transition-colors ml-0.5"><X size={11} /></button>
                  </span>
                )) : <p className="text-gray-500 text-sm">No skills added yet.</p>}
              </div>
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="Type a skill and press Enter" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                <button type="button" onClick={() => addSkill()} className="btn-outline px-4 shrink-0"><Plus size={15} />Add</button>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Suggested:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_SKILLS.filter(s => !profile.skills?.includes(s)).map(s => (
                    <button key={s} type="button" onClick={() => addSkill(s)} className="badge-gray hover:badge-blue cursor-pointer transition-all text-xs flex items-center gap-1"><Plus size={10} />{s}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="card p-7 flex flex-col gap-4">
              <h2 className="font-semibold text-white flex items-center gap-2"><BookOpen size={16} className="text-brand-indigo" />Experience</h2>
              <textarea className="input min-h-[130px] resize-y" placeholder="Describe your background, years of experience, notable projects..." value={profile.experience || ''} onChange={set('experience')} />
            </div>

            {/* Portfolio Links */}
            <div className="card p-7 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white flex items-center gap-2"><LinkIcon size={16} className="text-brand-blue" />Portfolio Links</h2>
                <button type="button" onClick={() => setProfile({ ...profile, portfolioLinks: [...(profile.portfolioLinks || []), ''] })} className="btn-ghost text-xs border border-surface-border px-3 py-1.5 rounded-lg"><Plus size={13} />Add</button>
              </div>
              {profile.portfolioLinks?.length > 0 ? profile.portfolioLinks.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <input className="input flex-1" placeholder="https://github.com/project" value={link}
                    onChange={e => { const l = [...profile.portfolioLinks]; l[i] = e.target.value; setProfile({ ...profile, portfolioLinks: l }); }} />
                  <button type="button" onClick={() => setProfile({ ...profile, portfolioLinks: profile.portfolioLinks.filter((_, idx) => idx !== i) })}
                    className="btn-ghost px-3 border border-surface-border rounded-xl"><X size={14} /></button>
                </div>
              )) : <p className="text-gray-500 text-sm">Add links to your GitHub, portfolio, or past work.</p>}
            </div>
          </>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full py-3.5 text-base">
          {saving ? <span className="flex items-center gap-2"><span className="spinner-sm" />Saving...</span>
            : <span className="flex items-center gap-2"><Save size={16} />Save Profile</span>}
        </button>
      </form>
    </div>
  );
}
