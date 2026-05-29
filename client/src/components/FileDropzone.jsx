import { useRef, useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

const ACCEPT = {
  resume: {
    types: '.pdf,.doc,.docx',
    label: 'PDF, DOC or DOCX',
    mime: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  citizenship: {
    types: '.pdf,.jpg,.jpeg,.png',
    label: 'PDF, JPG or PNG',
    mime: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  certificate: {
    types: '.pdf,.jpg,.jpeg,.png',
    label: 'PDF, JPG or PNG',
    mime: ['application/pdf', 'image/jpeg', 'image/png'],
  },
};

export default function FileDropzone({
  label,
  name,
  type = 'resume',
  onFile,
  required = false,
  hint,
}) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const config = ACCEPT[type] || ACCEPT.resume;

  const validate = (f) => {
    if (!f) return 'No file selected';
    if (f.size > 5 * 1024 * 1024) return 'File must be under 5MB';
    if (!config.mime.includes(f.type)) return `Only ${config.label} allowed`;
    return '';
  };

  const handle = (f) => {
    const err = validate(f);
    if (err) { setError(err); return; }
    setError('');
    setFile(f);
    onFile?.(name, f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handle(e.dataTransfer.files[0]);
  };

  const remove = (e) => {
    e.stopPropagation();
    setFile(null);
    setError('');
    onFile?.(name, null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const isImage = file?.type?.startsWith('image/');
  const sizeKB = file ? (file.size / 1024).toFixed(0) : 0;

  return (
    <div>
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !file && inputRef.current?.click()}
        style={{
          background: dragging ? 'rgba(14,165,233,0.04)' : 'var(--input)',
          borderColor: dragging ? 'rgba(14,165,233,0.5)' : error ? 'rgba(239,68,68,0.4)' : file ? 'rgba(16,185,129,0.3)' : 'var(--border)',
          cursor: file ? 'default' : 'pointer',
        }}
        className={`relative border-2 border-dashed rounded-xl transition-all duration-200
          ${!file ? 'hover:border-brand-blue/40' : ''}
          ${dragging ? 'scale-[1.01]' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={config.types}
          className="hidden"
          onChange={(e) => handle(e.target.files[0])}
        />

        {!file ? (
          <div className="flex flex-col items-center gap-2 py-5 px-4 text-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--hover)' }}>
              <Upload size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Drop file here or{' '}
                <span style={{ color: 'var(--brand-blue)' }}>browse</span>
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {config.label} · Max 5MB
              </p>
              {hint && <p className="text-[10px] mt-1" style={{ color: 'var(--text-disabled)' }}>{hint}</p>}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3">
            {/* File icon / preview */}
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)' }}>
              {isImage
                ? <ImageIcon size={16} style={{ color: 'var(--brand-blue)' }} />
                : <FileText size={16} style={{ color: 'var(--brand-blue)' }} />
              }
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                {file.name}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {sizeKB} KB · {file.type.split('/')[1]?.toUpperCase()}
              </p>
            </div>

            {/* Success + remove */}
            <CheckCircle size={15} className="text-emerald-400 shrink-0" />
            <button
              type="button"
              onClick={remove}
              className="p-1.5 rounded-lg transition-colors shrink-0"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  );
}
