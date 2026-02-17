'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileSpreadsheet, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

export default function FileUploader({
  onFileSelect,
  isProcessing,
  disabled = false,
}: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0 && !disabled && !isProcessing) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect, disabled, isProcessing]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
    disabled: disabled || isProcessing,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative rounded-xl p-6 sm:p-10 text-center cursor-pointer
        border transition-all duration-200
        ${isDragActive
          ? 'border-gold bg-gold/5'
          : 'border-border hover:border-border-strong bg-surface hover:bg-surface-2'
        }
        ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={isDragActive ? { boxShadow: '0 0 0 1px #ffb500, 0 0 24px rgba(255,181,0,0.12)' } : {}}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-5">
        {/* Icon container */}
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200 ${
            isDragActive ? 'bg-gold/20' : 'bg-surface-3'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-7 h-7 text-gold animate-spin" />
          ) : (
            <FileSpreadsheet
              className={`w-7 h-7 transition-colors duration-200 ${
                isDragActive ? 'text-gold' : 'text-ink-2'
              }`}
            />
          )}
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          {isProcessing ? (
            <p className="font-medium text-ink-1">Processing your file…</p>
          ) : isDragActive ? (
            <p className="font-semibold text-gold">Drop to process</p>
          ) : (
            <>
              <p className="font-medium text-ink-1">
                Drop your UPS invoice CSV here
              </p>
              <p className="text-sm text-ink-2">
                or{' '}
                <span className="text-gold underline underline-offset-2 cursor-pointer">
                  click to browse
                </span>
              </p>
            </>
          )}
        </div>

        {/* Format badge */}
        {!isProcessing && !isDragActive && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-3 rounded-md border border-border">
            <span className="text-xs text-ink-3 font-mono">.csv</span>
            <span className="text-xs text-ink-3">files only</span>
          </div>
        )}
      </div>
    </div>
  );
}
