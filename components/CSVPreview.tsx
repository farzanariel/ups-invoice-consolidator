'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getConsolidatedHeaders } from '@/lib/consolidation';

interface CSVPreviewProps {
  data: Record<string, string>[];
  rowsPerPage?: number;
  filterLabel?: string;
  onClearFilter?: () => void;
}

export default function CSVPreview({
  data,
  rowsPerPage = 50,
  filterLabel,
  onClearFilter,
}: CSVPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  if (!data || data.length === 0) return null;

  // If filter is active, use all keys from all rows (raw headers).
  // For the default consolidated view, use getConsolidatedHeaders for correct ordering.
  const headers = filterLabel
    ? Array.from(new Set(data.flatMap((row) => Object.keys(row))))
    : getConsolidatedHeaders(data as Parameters<typeof getConsolidatedHeaders>[0]);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, data.length);
  const currentData = data.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="px-6 py-3.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-ink-3 uppercase tracking-widest font-mono">
            Data Preview
          </span>
          {filterLabel && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-danger/10 border border-danger/25 text-danger text-xs font-mono">
              {filterLabel}
              {onClearFilter && (
                <button
                  onClick={onClearFilter}
                  className="ml-0.5 hover:text-danger/70 transition-colors"
                  aria-label="Clear filter"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
        <span className="text-xs text-ink-2 font-mono">
          {(startIndex + 1).toLocaleString()}–{endIndex.toLocaleString()} of{' '}
          {data.length.toLocaleString()} rows
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-border bg-surface">
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-medium text-ink-3 uppercase tracking-wider whitespace-nowrap font-mono"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, rowIndex) => (
              <tr
                key={startIndex + rowIndex}
                className={`border-b border-border/50 hover:bg-surface-2 transition-colors duration-100 ${
                  rowIndex % 2 === 0 ? 'bg-[#0d0d0d]' : 'bg-surface'
                }`}
              >
                {headers.map((header) => (
                  <td
                    key={`${startIndex + rowIndex}-${header}`}
                    className="px-4 py-2.5 text-xs text-ink-2 whitespace-nowrap font-mono"
                  >
                    {row[header] || (
                      <span className="text-ink-3">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-border flex items-center justify-between bg-surface">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink-2 border border-border rounded-md hover:border-border-strong hover:text-ink-1 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <span className="text-xs text-ink-3 font-mono">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink-2 border border-border rounded-md hover:border-border-strong hover:text-ink-1 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
