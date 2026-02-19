'use client';

import { ProcessingStats } from '@/lib/types';

interface StatsCardProps {
  stats: ProcessingStats;
  activeFilter: string | null;
  onFilterClick: (filter: string | null) => void;
}

export default function StatsCard({ stats, activeFilter, onFilterClick }: StatsCardProps) {
  const reductionPct =
    stats.totalRows > 0
      ? Math.round((1 - stats.uniqueTrackings / stats.totalRows) * 100)
      : 0;

  const items = [
    {
      label: 'Original Rows',
      value: stats.totalRows.toLocaleString(),
      color: 'text-ink-2',
      filter: null,
    },
    {
      label: 'Consolidated',
      value: stats.uniqueTrackings.toLocaleString(),
      color: 'text-success',
      filter: null,
    },
    {
      label: 'Charges Kept',
      value: stats.keptCharges.toLocaleString(),
      color: 'text-gold',
      filter: null,
    },
    {
      label: 'Rows Removed',
      value: stats.removedCharges.toLocaleString(),
      color: 'text-danger',
      filter: 'charges-removed',
    },
    {
      label: 'Max / Tracking',
      value: stats.maxChargesPerTracking.toString(),
      color: 'text-ink-2',
      filter: null,
    },
    {
      label: 'Total Amount',
      value: `$${stats.totalNetAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: 'text-ink-1',
      filter: null,
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-3 uppercase tracking-widest font-mono">
          Processing Summary
        </span>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-xs text-ink-2 font-mono">
            {reductionPct}% row reduction
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-6 divide-border [&>*]:border-b [&>*]:border-border sm:[&>*]:border-b-0 [&>*:nth-child(odd)]:border-r [&>*:nth-child(odd)]:border-border sm:[&>*:nth-child(odd)]:border-r-0 sm:divide-x">
        {items.map((item, i) => {
          const isActive = activeFilter === item.filter && item.filter !== null;
          const isClickable = item.filter !== null;

          return (
            <div
              key={i}
              onClick={() => {
                if (!isClickable) return;
                onFilterClick(isActive ? null : item.filter);
              }}
              className={`px-4 py-3 sm:py-4 transition-colors duration-150 ${
                isClickable
                  ? 'cursor-pointer hover:bg-surface-2'
                  : ''
              } ${isActive ? 'bg-surface-2 ring-1 ring-inset ring-danger/30' : ''}`}
            >
              <p className={`text-xl font-bold font-mono tabular-nums ${item.color}`}>
                {item.value}
              </p>
              <p className="text-xs text-ink-3 mt-1.5 uppercase tracking-wider flex items-center gap-1.5">
                {item.label}
                {isActive && (
                  <span className="text-[10px] normal-case tracking-normal font-sans text-danger">
                    · clear
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
