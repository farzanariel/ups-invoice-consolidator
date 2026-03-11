'use client';

import { Download, FileSpreadsheet } from 'lucide-react';
import { ConsolidatedRow } from '@/lib/types';
import { exportCSV, downloadCSV, downloadXLSX } from '@/lib/csv-parser';

interface DownloadButtonProps {
  data: ConsolidatedRow[];
  filename: string;
  columnOrder: string[];
  variant?: 'primary' | 'neutral';
  iconOnly?: boolean;
}

export default function DownloadButton({ data, filename, columnOrder, variant = 'primary', iconOnly = false }: DownloadButtonProps) {
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

  if (iconOnly) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleXLSX}
          title="Download XLSX"
          className="w-8 h-8 flex items-center justify-center rounded-md border border-border hover:border-border-strong bg-surface hover:bg-surface-2 text-ink-2 hover:text-ink-1 transition-all duration-150"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
        <button
          onClick={handleCSV}
          title="Download CSV"
          className="w-8 h-8 flex items-center justify-center rounded-md border border-border hover:border-border-strong bg-surface hover:bg-surface-2 text-ink-2 hover:text-ink-1 transition-all duration-150"
        >
          <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  const rowBadge = (
    <span className="px-1.5 py-0.5 bg-black/15 rounded text-xs font-mono">
      {data.length.toLocaleString()} rows
    </span>
  );

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
      <button
        onClick={handleXLSX}
        className="flex items-center justify-center gap-2.5 px-5 py-2 bg-surface hover:bg-surface-2 text-ink-1 font-semibold text-sm rounded-md border border-border hover:border-border-strong transition-all duration-150"
      >
        <FileSpreadsheet className="w-4 h-4" strokeWidth={2} />
        Download XLSX
      </button>

      <button
        onClick={handleCSV}
        className={`flex items-center justify-center gap-2.5 px-5 py-2 font-semibold text-sm rounded-md transition-colors duration-150 ${
          variant === 'neutral'
            ? 'bg-surface hover:bg-surface-2 text-ink-1 border border-border hover:border-border-strong'
            : 'bg-gold hover:bg-gold-bright text-black'
        }`}
      >
        <Download className="w-4 h-4" strokeWidth={2.5} />
        Download CSV
        {rowBadge}
      </button>
    </div>
  );
}
