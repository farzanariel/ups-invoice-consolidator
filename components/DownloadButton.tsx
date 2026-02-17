'use client';

import { Download, FileSpreadsheet } from 'lucide-react';
import { ConsolidatedRow } from '@/lib/types';
import { exportCSV, downloadCSV, downloadXLSX } from '@/lib/csv-parser';

interface DownloadButtonProps {
  data: ConsolidatedRow[];
  filename: string;
  columnOrder: string[];
}

export default function DownloadButton({ data, filename, columnOrder }: DownloadButtonProps) {
  const handleCSV = () => {
    if (!data || data.length === 0) return;
    const csv = exportCSV(data, columnOrder);
    downloadCSV(csv, filename);
  };

  const handleXLSX = () => {
    if (!data || data.length === 0) return;
    downloadXLSX(data, columnOrder, filename);
  };

  if (!data || data.length === 0) return null;

  const rowBadge = (
    <span className="px-1.5 py-0.5 bg-black/15 rounded text-xs font-mono">
      {data.length.toLocaleString()} rows
    </span>
  );

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCSV}
        className="flex items-center gap-2.5 px-5 py-2 bg-gold hover:bg-gold-bright text-black font-semibold text-sm rounded-md transition-colors duration-150"
      >
        <Download className="w-4 h-4" strokeWidth={2.5} />
        Download CSV
        {rowBadge}
      </button>

      <button
        onClick={handleXLSX}
        className="flex items-center gap-2.5 px-5 py-2 bg-surface hover:bg-surface-2 text-ink-1 font-semibold text-sm rounded-md border border-border hover:border-border-strong transition-all duration-150"
      >
        <FileSpreadsheet className="w-4 h-4" strokeWidth={2} />
        Download XLSX
      </button>
    </div>
  );
}
