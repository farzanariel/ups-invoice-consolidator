'use client';

import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import ProcessingStatus from '@/components/ProcessingStatus';
import ErrorAlert from '@/components/ErrorAlert';
import StatsCard from '@/components/StatsCard';
import CSVPreview from '@/components/CSVPreview';
import DownloadButton from '@/components/DownloadButton';
import { parseCSV } from '@/lib/csv-parser';
import { validateCSV } from '@/lib/validation';
import { consolidateRows, getConsolidatedHeaders } from '@/lib/consolidation';
import { getConsolidatedFilename } from '@/lib/utils';
import type {
  UPSInvoiceRow,
  ConsolidatedRow,
  ProcessingStats,
} from '@/lib/types';
import { RefreshCw, Package2 } from 'lucide-react';

export default function Home() {
  const [originalData, setOriginalData] = useState<UPSInvoiceRow[] | null>(null);
  const [consolidatedData, setConsolidatedData] = useState<ConsolidatedRow[] | null>(null);
  const [removedRows, setRemovedRows] = useState<UPSInvoiceRow[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalFilename, setOriginalFilename] = useState<string>('');

  const handleFileUpload = async (file: File) => {
    setErrors([]);
    setWarnings([]);
    setConsolidatedData(null);
    setStats(null);
    setIsProcessing(true);
    setOriginalFilename(file.name);

    try {
      const { data, error } = await parseCSV(file);

      if (error) {
        setErrors([error]);
        setIsProcessing(false);
        return;
      }

      setOriginalData(data);

      const validation = validateCSV(data);

      if (!validation.valid) {
        setErrors(validation.errors);
        setWarnings(validation.warnings);
        setIsProcessing(false);
        return;
      }

      if (validation.warnings.length > 0) {
        setWarnings(validation.warnings);
      }

      const { consolidated, removedRows: removed, stats: processingStats } = consolidateRows(data);

      if (processingStats.status === 'error') {
        setErrors([processingStats.errorMessage || 'An error occurred during processing']);
        setIsProcessing(false);
        return;
      }

      setConsolidatedData(consolidated);
      setRemovedRows(removed);
      setColumnOrder(getConsolidatedHeaders(consolidated));
      setStats(processingStats);
      setIsProcessing(false);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'An unexpected error occurred']);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setOriginalData(null);
    setConsolidatedData(null);
    setRemovedRows([]);
    setActiveFilter(null);
    setStats(null);
    setErrors([]);
    setWarnings([]);
    setOriginalFilename('');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-ink-1">
      {/* Dot grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #1c1c1c 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Header */}
      <header className="relative border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#351c15] rounded flex items-center justify-center">
              <Package2 className="w-4 h-4 text-gold" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-ink-1 tracking-tight text-sm">
              Invoice Consolidator
            </span>
          </div>
          <span className="text-xs text-ink-3 font-mono hidden sm:block">
            Processing happens entirely in your browser
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Upload state */}
        {!consolidatedData && (
          <div className="max-w-xl mx-auto">
            <div className="mb-8 sm:mb-10 text-center">
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink-1 leading-tight mb-3">
                UPS Invoice <span className="text-gold">Consolidator</span>
              </h1>
              <p className="text-ink-2 text-base sm:text-lg leading-relaxed">
                Merge duplicate tracking rows into clean, single-row records.
              </p>
            </div>

            <FileUploader
              onFileSelect={handleFileUpload}
              isProcessing={isProcessing}
            />

            {isProcessing && (
              <div className="mt-4">
                <ProcessingStatus message="Processing your CSV..." />
              </div>
            )}

            {errors.length > 0 && (
              <div className="mt-4">
                <ErrorAlert type="error" messages={errors} onDismiss={() => setErrors([])} />
              </div>
            )}

            {warnings.length > 0 && (
              <div className="mt-4">
                <ErrorAlert type="warning" messages={warnings} onDismiss={() => setWarnings([])} />
              </div>
            )}
          </div>
        )}

        {/* Results state */}
        {consolidatedData && stats && (
          <div className="space-y-5">
            <StatsCard
            stats={stats}
            activeFilter={activeFilter}
            onFilterClick={setActiveFilter}
          />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ink-2 hover:text-ink-1 border border-border hover:border-border-strong rounded-md transition-all duration-150 w-full sm:w-auto justify-center sm:justify-start"
              >
                <RefreshCw className="w-4 h-4" />
                Process Another File
              </button>
              <DownloadButton
                data={consolidatedData}
                filename={getConsolidatedFilename(originalFilename)}
                columnOrder={columnOrder}
              />
            </div>

            {errors.length > 0 && (
              <ErrorAlert type="error" messages={errors} onDismiss={() => setErrors([])} />
            )}
            {warnings.length > 0 && (
              <ErrorAlert type="warning" messages={warnings} onDismiss={() => setWarnings([])} />
            )}

            <CSVPreview
              data={activeFilter === 'charges-removed' ? removedRows : consolidatedData}
              filterLabel={activeFilter === 'charges-removed' ? 'Charges Removed' : undefined}
              onClearFilter={activeFilter ? () => setActiveFilter(null) : undefined}
              columnOrder={columnOrder}
              onColumnOrderChange={setColumnOrder}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <span className="text-xs text-ink-3 font-mono">UPS Invoice Consolidator</span>
          <span className="text-xs text-ink-3">No data is ever uploaded to a server</span>
        </div>
      </footer>
    </div>
  );
}
