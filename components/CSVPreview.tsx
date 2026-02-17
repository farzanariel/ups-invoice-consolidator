'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getConsolidatedHeaders } from '@/lib/consolidation';

interface CSVPreviewProps {
  data: Record<string, string>[];
  rowsPerPage?: number;
  filterLabel?: string;
  onClearFilter?: () => void;
  columnOrder?: string[];
  onColumnOrderChange?: (order: string[]) => void;
}

export default function CSVPreview({
  data,
  rowsPerPage = 50,
  filterLabel,
  onClearFilter,
  columnOrder,
  onColumnOrderChange,
}: CSVPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  // Ref mirrors dragSourceIndex for synchronous reads inside drop handler
  const dragSourceRef = useRef<number | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  if (!data || data.length === 0) return null;

  const headers = filterLabel
    ? Array.from(new Set(data.flatMap((row) => Object.keys(row))))
    : (columnOrder ?? getConsolidatedHeaders(data as Parameters<typeof getConsolidatedHeaders>[0]));

  const isDraggable = !filterLabel && !!onColumnOrderChange;

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, data.length);
  const currentData = data.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleDragStart = (index: number) => {
    dragSourceRef.current = index;
    setDragSourceIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (dropIndex: number) => {
    const src = dragSourceRef.current;
    if (src === null || src === dropIndex) {
      setDragSourceIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newOrder = [...headers];
    const [moved] = newOrder.splice(src, 1);
    newOrder.splice(dropIndex, 0, moved);
    onColumnOrderChange!(newOrder);
    dragSourceRef.current = null;
    setDragSourceIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    dragSourceRef.current = null;
    setDragSourceIndex(null);
    setDragOverIndex(null);
  };

  const colClass = (i: number) => {
    if (dragSourceIndex === i) return 'opacity-30';
    if (dragOverIndex === i && dragSourceIndex !== i) return 'bg-gold/10';
    return '';
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
          {isDraggable && (
            <span className="text-xs text-ink-3 font-mono">
              drag columns to reorder
            </span>
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
              {headers.map((header, i) => (
                <th
                  key={header}
                  draggable={isDraggable}
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDrop={() => handleDrop(i)}
                  onDragEnd={handleDragEnd}
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap font-mono select-none transition-all duration-100 border-r border-border ${
                    isDraggable ? 'cursor-grab active:cursor-grabbing' : ''
                  } ${
                    dragOverIndex === i && dragSourceIndex !== i
                      ? 'text-gold bg-gold/10'
                      : dragSourceIndex === i
                      ? 'text-ink-3 opacity-30'
                      : 'text-ink-3 hover:bg-surface-2 hover:text-ink-2'
                  }`}
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
                className={`border-b border-border/50 transition-colors duration-100 ${
                  rowIndex % 2 === 0 ? 'bg-[#0d0d0d]' : 'bg-surface'
                } ${dragSourceIndex === null ? 'hover:bg-surface-2' : ''}`}
              >
                {headers.map((header, colIndex) => (
                  <td
                    key={`${startIndex + rowIndex}-${header}`}
                    className={`px-4 py-2.5 text-xs text-ink-2 whitespace-nowrap font-mono transition-all duration-100 ${colClass(colIndex)}`}
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
