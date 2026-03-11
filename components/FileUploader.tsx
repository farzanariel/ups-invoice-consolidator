'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileSpreadsheet, Loader2, X, ArrowRight } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (files: File[]) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

export default function FileUploader({
  onFileSelect,
  isProcessing,
  disabled = false,
}: FileUploaderProps) {
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0 && !disabled && !isProcessing) {
        setStagedFiles((prev) => {
          const existingNames = new Set(prev.map((f) => f.name));
          const newFiles = acceptedFiles.filter((f) => !existingNames.has(f.name));
          return [...prev, ...newFiles];
        });
      }
    },
    [disabled, isProcessing]
  );

  const removeFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProcess = () => {
    if (stagedFiles.length > 0) {
      onFileSelect(stagedFiles);
      setStagedFiles([]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: true,
    disabled: disabled || isProcessing,
  });

  const hasStaged = stagedFiles.length > 0;

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          relative rounded-xl text-center cursor-pointer
          border transition-all duration-200
          ${hasStaged ? 'p-4 sm:p-6' : 'p-6 sm:p-10'}
          ${isDragActive
            ? 'border-gold bg-gold/5'
            : 'border-border hover:border-border-strong bg-surface hover:bg-surface-2'
          }
          ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={isDragActive ? { boxShadow: '0 0 0 1px var(--c-gold), 0 0 24px color-mix(in srgb, var(--c-gold) 12%, transparent)' } : {}}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-5">
          {/* Icon container */}
          {!hasStaged && (
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isDragActive ? 'bg-gold/20' : 'bg-surface-3'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="w-7 h-7 text-gold-text animate-spin" />
              ) : (
                <FileSpreadsheet
                  className={`w-7 h-7 transition-colors duration-200 ${
                    isDragActive ? 'text-gold-text' : 'text-ink-2'
                  }`}
                />
              )}
            </div>
          )}

          {/* Text */}
          <div className="space-y-1.5">
            {isProcessing ? (
              <p className="font-medium text-ink-1">Processing your files…</p>
            ) : isDragActive ? (
              <p className="font-semibold text-gold-text">Drop to add</p>
            ) : hasStaged ? (
              <p className="text-sm text-ink-2">
                Drop more CSVs or{' '}
                <span className="text-gold-text underline underline-offset-2 cursor-pointer">
                  click to browse
                </span>
              </p>
            ) : (
              <>
                <p className="font-medium text-ink-1">
                  Drop your UPS invoice CSVs here
                </p>
                <p className="text-sm text-ink-2">
                  or{' '}
                  <span className="text-gold-text underline underline-offset-2 cursor-pointer">
                    click to browse
                  </span>
                </p>
              </>
            )}
          </div>

          {/* Format badge */}
          {!isProcessing && !isDragActive && !hasStaged && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-3 rounded-md border border-border">
              <span className="text-xs text-ink-3 font-mono">.csv</span>
              <span className="text-xs text-ink-3">files only</span>
            </div>
          )}
        </div>
      </div>

      {/* Staged file list + process button */}
      {hasStaged && !isProcessing && (
        <>
          <div className="rounded-lg border border-border bg-surface divide-y divide-border animate-fade-in">
            {stagedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between px-3 sm:px-4 py-2.5 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileSpreadsheet className="w-4 h-4 text-ink-3 shrink-0" />
                  <span className="text-sm font-mono text-ink-1 truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-ink-3 font-mono shrink-0">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-3 text-ink-3 hover:text-danger transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleProcess}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg bg-gold text-black hover:bg-gold-bright transition-colors duration-150 animate-fade-in min-h-[44px]"
          >
            Process {stagedFiles.length} {stagedFiles.length === 1 ? 'file' : 'files'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}
