import { Link } from 'react-router-dom';

export default function EmptyState({ icon: Icon, title, description, action, actionLabel, actionTo }) {
  return (
    <div className="card p-14 text-center flex flex-col items-center gap-3 animate-fade-in-up">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
          style={{ background: 'var(--hover)' }}>
          <Icon size={24} className="text-gray-500" />
        </div>
      )}
      <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{title}</h3>
      {description && (
        <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>
      )}
      {action && actionTo && (
        <Link to={actionTo} className="btn-primary mt-2 text-sm">{actionLabel || action}</Link>
      )}
      {action && !actionTo && (
        <button onClick={action} className="btn-outline mt-2 text-sm">{actionLabel}</button>
      )}
    </div>
  );
}
