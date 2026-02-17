'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2 } from 'lucide-react';

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
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
    disabled: disabled || isProcessing,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-all duration-200 ease-in-out
        ${
          isDragActive
            ? 'border-ups-gold bg-ups-gold/10 scale-[1.02]'
            : 'border-gray-300 hover:border-ups-gold/60 hover:bg-gray-50'
        }
        ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-4">
        {isProcessing ? (
          <Loader2 className="w-16 h-16 text-ups-gold animate-spin" />
        ) : (
          <Upload
            className={`w-16 h-16 ${
              isDragActive ? 'text-ups-gold' : 'text-gray-400'
            }`}
          />
        )}

        <div className="space-y-2">
          {isProcessing ? (
            <p className="text-lg font-medium text-gray-700">
              Processing your file...
            </p>
          ) : isDragActive ? (
            <p className="text-lg font-medium text-ups-gold">
              Drop your CSV file here
            </p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-700">
                Drop your UPS invoice CSV here
              </p>
              <p className="text-sm text-gray-500">
                or click to browse files
              </p>
            </>
          )}
        </div>

        {!isProcessing && (
          <p className="text-xs text-gray-400 mt-2">
            Accepted format: .csv files only
          </p>
        )}
      </div>
    </div>
  );
}
