'use client';

import { Download } from 'lucide-react';
import { ConsolidatedRow } from '@/lib/types';
import { exportCSV, downloadCSV } from '@/lib/csv-parser';

interface DownloadButtonProps {
  data: ConsolidatedRow[];
  filename: string;
  columnOrder: string[];
}

export default function DownloadButton({ data, filename, columnOrder }: DownloadButtonProps) {
  const handleDownload = () => {
    if (!data || data.length === 0) return;
    const csv = exportCSV(data, columnOrder);
    downloadCSV(csv, filename);
  };

  if (!data || data.length === 0) return null;

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2.5 px-5 py-2 bg-gold hover:bg-gold-bright text-black font-semibold text-sm rounded-md transition-colors duration-150"
    >
      <Download className="w-4 h-4" strokeWidth={2.5} />
      Download CSV
      <span className="ml-1 px-1.5 py-0.5 bg-black/15 rounded text-xs font-mono">
        {data.length.toLocaleString()} rows
      </span>
    </button>
  );
}
