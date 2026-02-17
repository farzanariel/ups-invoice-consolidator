'use client';

import { AlertCircle, AlertTriangle, X } from 'lucide-react';

interface ErrorAlertProps {
  type: 'error' | 'warning';
  messages: string[];
  onDismiss?: () => void;
}

export default function ErrorAlert({ type, messages, onDismiss }: ErrorAlertProps) {
  if (!messages || messages.length === 0) return null;

  const isError = type === 'error';

  return (
    <div
      className={`rounded-xl border p-4 ${
        isError
          ? 'border-danger/30 bg-[rgba(248,113,113,0.05)]'
          : 'border-gold/30 bg-[rgba(255,181,0,0.05)]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
            isError ? 'bg-danger/10' : 'bg-gold/10'
          }`}
        >
          {isError ? (
            <AlertCircle className="w-4 h-4 text-danger" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-gold" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${isError ? 'text-danger' : 'text-gold'}`}>
            {isError ? 'Error' : 'Warning'}
          </h3>
          <div className="mt-1.5 space-y-1">
            {messages.map((msg, i) => (
              <p key={i} className="text-sm text-ink-2">
                {msg}
              </p>
            ))}
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-ink-3 hover:text-ink-2 hover:bg-surface-3 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
