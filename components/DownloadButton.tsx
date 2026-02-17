'use client';

import { Download } from 'lucide-react';
import { ConsolidatedRow } from '@/lib/types';
import { exportCSV, downloadCSV } from '@/lib/csv-parser';

interface DownloadButtonProps {
  data: ConsolidatedRow[];
  filename: string;
}

export default function DownloadButton({
  data,
  filename,
}: DownloadButtonProps) {
  const handleDownload = () => {
    if (!data || data.length === 0) {
      return;
    }

    const csv = exportCSV(data);
    downloadCSV(csv, filename);
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-3 px-6 py-3 bg-ups-gold hover:bg-ups-yellow text-ups-brown font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
    >
      <Download className="w-5 h-5" />
      Download Consolidated CSV
      <span className="ml-2 px-2 py-1 bg-ups-brown/10 rounded text-sm">
        {data.length} rows
      </span>
    </button>
  );
}
