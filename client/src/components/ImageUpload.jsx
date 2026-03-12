import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Avatar from './Avatar';

export default function ImageUpload({ currentImage, name, onUploaded, size = 'xl' }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const { data } = await api.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Photo updated');
      onUploaded?.(data.imageUrl);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={() => inputRef.current?.click()}>
      <Avatar src={currentImage} name={name} size={size} className="ring-2 ring-surface-border group-hover:ring-brand-blue/50 transition-all" />
      <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        {uploading ? (
          <Loader2 size={20} className="text-white animate-spin" />
        ) : (
          <Camera size={20} className="text-white" />
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  );
}
