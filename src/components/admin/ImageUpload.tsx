'use client';
import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, Image as ImageIcon, X, Loader2, CheckCircle2, Link2, ExternalLink } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Product Image',
  required = false,
}: ImageUploadProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid format. Please select a JPG, PNG, WEBP, or GIF image.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      onChange(data.url);
      toast.success('Image uploaded to Supabase Storage!');
    } catch (err: any) {
      console.error('Image upload failed:', err);
      toast.error(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="form-group sm:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <label className="form-label mb-0">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium inline-flex items-center gap-1 transition-colors"
        >
          <Link2 size={13} />
          {showManualUrl ? 'Switch to file upload' : 'Enter image URL manually'}
        </button>
      </div>

      {showManualUrl ? (
        <div className="space-y-3">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... or /images/products/..."
            className="form-input"
            required={required && !value}
          />
          {value && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <img
                src={value}
                alt="Product preview"
                className="w-14 h-18 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{value}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Manual URL specified</p>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={handleInputChange}
            className="hidden"
          />

          {value ? (
            /* Uploaded Image Preview Card */
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10 dark:border-emerald-500/20 backdrop-blur-sm transition-all">
              <div className="relative group shrink-0">
                <img
                  src={value}
                  alt="Uploaded preview"
                  className="w-24 h-32 object-cover rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                  }}
                />
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 size={13} />
                  <span>Ready & Stored in Supabase</span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md font-mono" title={value}>
                  {value}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="btn btn-secondary btn-sm text-xs py-1.5 px-3"
                  >
                    Change Image
                  </button>
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm text-xs py-1.5 px-2.5 inline-flex items-center gap-1"
                  >
                    <ExternalLink size={13} />
                    View Original
                  </a>
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={isUploading}
                    className="btn btn-ghost btn-sm text-xs py-1.5 px-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Drag & Drop / Click Upload Area */
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: isDragging
                  ? '2px dashed #2563eb'
                  : '2px dashed rgba(203, 213, 225, 0.9)',
                background: isDragging
                  ? 'rgba(59, 130, 246, 0.05)'
                  : isUploading
                  ? 'rgba(241, 245, 249, 0.5)'
                  : 'rgba(255, 255, 255, 0.6)',
              }}
              className="relative flex flex-col items-center justify-center p-8 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-slate-800/50 transition-all duration-200 group text-center"
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <Loader2 size={36} className="text-blue-600 animate-spin" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Uploading to Supabase Storage...
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Generating permanent CDN image URL
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
                    <Upload size={24} />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Click to select an image, or drag & drop here
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    PNG, JPG, JPEG, WEBP or GIF (Max: 5MB)
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
