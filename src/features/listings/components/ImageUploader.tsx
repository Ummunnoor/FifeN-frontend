import { useRef, useState } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/Button';
import { FieldError } from '@/shared/components/FieldError';

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

interface ImageUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
}

/** Client-side image picker that mirrors the backend limits: 1–5 files, JPEG/PNG/WebP, ≤5MB each. */
export function ImageUploader({ files, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();

  function addFiles(selected: FileList | null) {
    if (!selected) return;
    const incoming = Array.from(selected);

    for (const file of incoming) {
      if (!ACCEPTED.includes(file.type)) {
        setError('Only JPEG, PNG, or WebP images are allowed.');
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(`"${file.name}" is larger than 5MB.`);
        return;
      }
    }
    if (files.length + incoming.length > MAX_FILES) {
      setError(`You can upload at most ${MAX_FILES} images.`);
      return;
    }
    setError(undefined);
    onChange([...files, ...incoming]);
  }

  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">Images</span>
      <div className="flex flex-wrap gap-3">
        {files.map((file, index) => (
          <div key={`${file.name}-${index}`} className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200">
            <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => removeAt(index)}
              className="absolute right-0.5 top-0.5 rounded-full bg-slate-900/60 p-0.5 text-white hover:bg-slate-900"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
        {files.length < MAX_FILES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-accent-400 hover:text-accent-500"
          >
            <PhotoIcon className="h-6 w-6" />
            <span className="text-xs">Add</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <p className="mt-1.5 text-xs text-slate-500">Up to {MAX_FILES} images — JPEG, PNG, or WebP, max 5MB each.</p>
      <FieldError message={error} />
      {files.length === 0 && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-2"
          onClick={() => inputRef.current?.click()}
        >
          Choose images
        </Button>
      )}
    </div>
  );
}
