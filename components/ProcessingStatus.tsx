'use client';

import { Loader2 } from 'lucide-react';

interface ProcessingStatusProps {
  message?: string;
}

export default function ProcessingStatus({
  message = 'Processing...',
}: ProcessingStatusProps) {
  return (
    <div className="flex items-center justify-center gap-3 p-6 bg-white rounded-lg shadow-md">
      <Loader2 className="w-6 h-6 text-ups-gold animate-spin" />
      <p className="text-lg font-medium text-gray-700">{message}</p>
    </div>
  );
}
