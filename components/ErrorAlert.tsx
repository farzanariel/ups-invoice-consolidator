'use client';

import { AlertCircle, AlertTriangle, X } from 'lucide-react';

interface ErrorAlertProps {
  type: 'error' | 'warning';
  messages: string[];
  onDismiss?: () => void;
}

export default function ErrorAlert({
  type,
  messages,
  onDismiss,
}: ErrorAlertProps) {
  if (!messages || messages.length === 0) {
    return null;
  }

  const isError = type === 'error';

  return (
    <div
      className={`rounded-lg p-4 ${
        isError
          ? 'bg-red-50 border border-red-200'
          : 'bg-yellow-50 border border-yellow-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {isError ? (
            <AlertCircle className="w-5 h-5 text-red-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          )}
        </div>

        <div className="flex-1">
          <h3
            className={`text-sm font-semibold ${
              isError ? 'text-red-800' : 'text-yellow-800'
            }`}
          >
            {isError ? 'Error' : 'Warning'}
          </h3>

          <div className="mt-2 space-y-1">
            {messages.map((message, index) => (
              <p
                key={index}
                className={`text-sm ${
                  isError ? 'text-red-700' : 'text-yellow-700'
                }`}
              >
                {message}
              </p>
            ))}
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 p-1 rounded-md hover:bg-opacity-20 transition-colors ${
              isError
                ? 'text-red-600 hover:bg-red-600'
                : 'text-yellow-600 hover:bg-yellow-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
