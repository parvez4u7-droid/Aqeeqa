import React, { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Trash2, Upload } from 'lucide-react';
import { uploadMediaFile } from '../../lib/api';
import { MediaAttachmentRef, MediaKind } from '../../types/wedding';

interface MediaUploaderFieldProps {
  label: string;
  kind: MediaKind;
  accept: string;
  value: MediaAttachmentRef | null | undefined;
  onChange: (ref: MediaAttachmentRef | null) => void;
  helperText?: string;
}

export const MediaUploaderField: React.FC<MediaUploaderFieldProps> = ({
  label,
  kind,
  accept,
  value,
  onChange,
  helperText,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const uploaded = await uploadMediaFile(file, kind);
      onChange(uploaded);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'File upload failed.';
      setError(msg);
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-stone-800">{label}</p>
          {helperText && <p className="text-[11px] text-stone-500">{helperText}</p>}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{uploading ? 'Uploading...' : value ? 'Replace' : 'Upload'}</span>
          </button>

          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              title="Remove media"
              className="p-1.5 rounded-lg border border-stone-300 bg-white hover:bg-red-50 text-stone-600 hover:text-red-700 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => void handleFileChange(e)}
        className="hidden"
      />

      {value && (
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-stone-200">
          {kind === 'image' && (
            <img
              src={value.url}
              alt={label}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-md object-cover bg-stone-100 shrink-0"
            />
          )}
          {kind === 'video' && (
            <video
              src={value.url}
              muted
              playsInline
              className="w-16 h-12 rounded-md object-cover bg-stone-900 shrink-0"
            />
          )}
          {kind === 'audio' && (
            <audio controls src={value.url} className="h-8 max-w-[200px] shrink-0" />
          )}

          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-stone-800 truncate flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
              <span className="truncate">{value.originalName || value.url}</span>
            </p>
            <p className="text-[10px] text-stone-500 font-mono truncate">
              Ref: {value.attachmentId}
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-700 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
