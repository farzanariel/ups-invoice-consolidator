'use client';

import { ChevronRight } from 'lucide-react';
import StatsCard from './StatsCard';
import CSVPreview from './CSVPreview';
import DownloadButton from './DownloadButton';
import { getConsolidatedFilename } from '@/lib/utils';
import type { FileResult } from '@/lib/types';

interface CollapsibleFileResultProps {
  fileResult: FileResult;
  activeFilter: string | null;
  isMultiFile: boolean;
  onToggleCollapse: () => void;
  onColumnOrderChange: (columnOrder: string[]) => void;
}

export default function CollapsibleFileResult({
  fileResult,
  activeFilter,
  isMultiFile,
  onToggleCollapse,
  onColumnOrderChange,
}: CollapsibleFileResultProps) {
  const {
    filename,
    consolidatedData,
    removedRows,
    columnOrder,
    stats,
    isCollapsed,
  } = fileResult;

  const isFilterActive = activeFilter === 'charges-removed';

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div
        onClick={onToggleCollapse}
        className="px-4 sm:px-6 py-3 cursor-pointer hover:bg-surface-2"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <ChevronRight
              className="w-4 h-4 text-ink-3 shrink-0"
              style={{
                transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                transition: 'transform 0.2s ease-out',
              }}
            />
            <span className="font-mono text-sm text-ink-1 truncate">{filename}</span>
            <span className="text-xs text-ink-3 font-mono shrink-0">
              {stats.uniqueTrackings} rows
            </span>
          </div>
          {isMultiFile && (
            <div
              className="pl-7 sm:pl-0 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <DownloadButton
                data={consolidatedData}
                filename={getConsolidatedFilename(filename)}
                columnOrder={columnOrder}
                iconOnly
              />
            </div>
          )}
        </div>
      </div>

      {/* Animated collapsible body */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: isCollapsed ? '0fr' : '1fr',
          transition: 'grid-template-rows 0.3s ease-out',
        }}
      >
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          <div className="border-t border-border space-y-5 p-4 sm:p-6">
            {isMultiFile && (
              <StatsCard
                stats={stats}
                activeFilter={activeFilter}
                onFilterClick={() => {}}
                variant="neutral"
              />
            )}
            <CSVPreview
              data={isFilterActive ? removedRows : consolidatedData}
              filterLabel={isFilterActive ? 'Rows Removed' : undefined}
              columnOrder={columnOrder}
              onColumnOrderChange={onColumnOrderChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
