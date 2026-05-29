import { ShieldCheck, ShieldAlert, Clock, Shield } from 'lucide-react';

const CONFIGS = {
  verified:   { icon: ShieldCheck, label: 'Verified',      cls: 'badge-green' },
  approved:   { icon: ShieldCheck, label: 'Verified',      cls: 'badge-green' },
  pending:    { icon: Clock,       label: 'Pending Review', cls: 'badge-yellow' },
  rejected:   { icon: ShieldAlert, label: 'Rejected',      cls: 'badge-red' },
  unverified: { icon: Shield,      label: 'Unverified',    cls: 'badge-gray' },
};

export default function VerificationBadge({ status = 'unverified', size = 'sm' }) {
  const cfg = CONFIGS[status] || CONFIGS.unverified;
  const Icon = cfg.icon;
  const isLg = size === 'lg';

  return (
    <span className={`${cfg.cls} ${isLg ? 'text-xs px-3 py-1.5' : 'text-[10px] px-2 py-0.5'}`}>
      <Icon size={isLg ? 12 : 10} />
      {cfg.label}
    </span>
  );
}
