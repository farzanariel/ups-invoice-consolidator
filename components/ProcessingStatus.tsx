'use client';

import { Loader2 } from 'lucide-react';

interface ProcessingStatusProps {
  message?: string;
}

export default function ProcessingStatus({
  message = 'Processing…',
}: ProcessingStatusProps) {
  return (
    <div className="rounded-xl border border-border bg-surface px-5 py-4 flex items-center gap-4">
      <div className="w-9 h-9 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
        <Loader2 className="w-4.5 h-4.5 text-gold animate-spin" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink-1">{message}</p>
        <p className="text-xs text-ink-3 mt-0.5 font-mono">
          This may take a moment for large files
        </p>
      </div>
    </div>
  );
}
