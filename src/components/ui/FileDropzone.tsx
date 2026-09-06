import { useRef, useState, type DragEvent } from 'react';

export default function FileDropzone({
  onFile,
  accept = '.csv,.xlsx,.xls',
  fileName,
}: {
  onFile: (file: File) => void;
  accept?: string;
  fileName?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed px-6 py-10 text-center transition-colors ${
        isDragging ? 'border-brand-500 bg-brand-50' : 'border-ledger-200 bg-ledger-50/50 hover:border-brand-400'
      }`}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-brand-500">
        <path d="M12 3v12m0-12 4 4m-4-4-4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {fileName ? (
        <p className="text-sm font-medium text-ink-900">{fileName}</p>
      ) : (
        <>
          <p className="text-sm font-medium text-ink-900">Drop your Excel or CSV file here</p>
          <p className="text-xs text-ink-600">or click to browse - registration number, UTME number, full name, department, and score columns required</p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
    </div>
  );
}
