'use client';

import { useState, useMemo, useRef } from 'react';
import FileUploader from '@/components/FileUploader';
import ProcessingStatus from '@/components/ProcessingStatus';
import ErrorAlert from '@/components/ErrorAlert';
import StatsCard from '@/components/StatsCard';
import DownloadButton from '@/components/DownloadButton';
import CollapsibleFileResult from '@/components/CollapsibleFileResult';
import { parseCSV } from '@/lib/csv-parser';
import { validateCSV } from '@/lib/validation';
import { consolidateRows, getConsolidatedHeaders } from '@/lib/consolidation';
import type {
  FileResult,
  ProcessingStats,
} from '@/lib/types';
import { RefreshCw, Package2, Plus, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme';

export default function Home() {
  const [fileResults, setFileResults] = useState<FileResult[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useTheme();

  const handleFilesUpload = async (files: File[]) => {
    setErrors([]);
    setWarnings([]);
    setIsProcessing(true);

    const newResults: FileResult[] = [];
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    for (const file of files) {
      try {
        const { data, error } = await parseCSV(file);

        if (error) {
          allErrors.push(`${file.name}: ${error}`);
          continue;
        }

        const validation = validateCSV(data);

        if (!validation.valid) {
          allErrors.push(...validation.errors.map((e) => `${file.name}: ${e}`));
          allWarnings.push(...validation.warnings.map((w) => `${file.name}: ${w}`));
          continue;
        }

        if (validation.warnings.length > 0) {
          allWarnings.push(...validation.warnings.map((w) => `${file.name}: ${w}`));
        }

        const { consolidated, removedRows, stats } = consolidateRows(data);

        if (stats.status === 'error') {
          allErrors.push(`${file.name}: ${stats.errorMessage || 'An error occurred during processing'}`);
          continue;
        }

        newResults.push({
          id: crypto.randomUUID(),
          filename: file.name,
          originalData: data,
          consolidatedData: consolidated,
          removedRows,
          columnOrder: getConsolidatedHeaders(consolidated),
          stats,
          warnings: validation.warnings,
          isCollapsed: false,
        });
      } catch (err) {
        allErrors.push(`${file.name}: ${err instanceof Error ? err.message : 'An unexpected error occurred'}`);
      }
    }

    if (allErrors.length > 0) setErrors(allErrors);
    if (allWarnings.length > 0) setWarnings(allWarnings);

    setFileResults((prev) => [...prev, ...newResults]);
    setIsProcessing(false);
  };

  const handleReset = () => {
    setFileResults([]);
    setActiveFilter(null);
    setErrors([]);
    setWarnings([]);
  };

  const toggleCollapse = (id: string) => {
    setFileResults((prev) =>
      prev.map((fr) =>
        fr.id === id ? { ...fr, isCollapsed: !fr.isCollapsed } : fr
      )
    );
  };

  const updateColumnOrder = (id: string, columnOrder: string[]) => {
    setFileResults((prev) =>
      prev.map((fr) =>
        fr.id === id ? { ...fr, columnOrder } : fr
      )
    );
  };

  const aggregatedStats = useMemo<ProcessingStats>(() => {
    if (fileResults.length === 0) {
      return {
        totalRows: 0,
        uniqueTrackings: 0,
        originalCharges: 0,
        keptCharges: 0,
        removedCharges: 0,
        maxChargesPerTracking: 0,
        totalNetAmount: 0,
        status: 'idle',
      };
    }

    return fileResults.reduce<ProcessingStats>(
      (acc, fr) => ({
        totalRows: acc.totalRows + fr.stats.totalRows,
        uniqueTrackings: acc.uniqueTrackings + fr.stats.uniqueTrackings,
        originalCharges: acc.originalCharges + fr.stats.originalCharges,
        keptCharges: acc.keptCharges + fr.stats.keptCharges,
        removedCharges: acc.removedCharges + fr.stats.removedCharges,
        maxChargesPerTracking: Math.max(acc.maxChargesPerTracking, fr.stats.maxChargesPerTracking),
        totalNetAmount: acc.totalNetAmount + fr.stats.totalNetAmount,
        status: 'success',
      }),
      {
        totalRows: 0,
        uniqueTrackings: 0,
        originalCharges: 0,
        keptCharges: 0,
        removedCharges: 0,
        maxChargesPerTracking: 0,
        totalNetAmount: 0,
        status: 'success',
      }
    );
  }, [fileResults]);

  const combinedData = useMemo(
    () => fileResults.flatMap((fr) => fr.consolidatedData),
    [fileResults]
  );

  const combinedColumnOrder = useMemo(
    () => getConsolidatedHeaders(combinedData),
    [combinedData]
  );

  const handleAddMoreFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFilesUpload(Array.from(files));
    }
    e.target.value = '';
  };

  const hasResults = fileResults.length > 0;

  return (
    <div className="min-h-screen bg-body text-ink-1">
      {/* Dot grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--c-dot-grid) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Header */}
      <header className="relative border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gold/15 rounded flex items-center justify-center">
              <Package2 className="w-4 h-4 text-gold-text" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-ink-1 tracking-tight text-sm">
              Invoice Consolidator
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-3 font-mono hidden sm:block">
              Processing happens entirely in your browser
            </span>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-border hover:border-border-strong hover:bg-surface-2 text-ink-3 hover:text-ink-1 transition-all duration-150"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Upload state */}
        {!hasResults && (
          <div className="max-w-xl mx-auto">
            <div className="mb-8 sm:mb-10 text-center">
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink-1 leading-tight mb-3">
                UPS Invoice <span className="text-gold-text">Consolidator</span>
              </h1>
              <p className="text-ink-2 text-base sm:text-lg leading-relaxed">
                Merge duplicate tracking rows into clean, single-row records.
              </p>
            </div>

            <FileUploader
              onFileSelect={handleFilesUpload}
              isProcessing={isProcessing}
            />

            {isProcessing && (
              <div className="mt-4">
                <ProcessingStatus message="Processing your CSVs..." />
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
        {hasResults && (
          <div className="space-y-5 animate-fade-in">
            <StatsCard
              stats={aggregatedStats}
              activeFilter={activeFilter}
              onFilterClick={setActiveFilter}
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-medium text-ink-2 hover:text-ink-1 border border-border hover:border-border-strong rounded-md transition-all duration-150 min-h-[44px] sm:min-h-0"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  onClick={() => addMoreInputRef.current?.click()}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-medium text-ink-2 hover:text-ink-1 border border-border hover:border-border-strong rounded-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-0"
                >
                  <Plus className="w-4 h-4" />
                  Add Files
                </button>
                <input
                  ref={addMoreInputRef}
                  type="file"
                  accept=".csv"
                  multiple
                  className="hidden"
                  onChange={handleAddMoreFiles}
                />
              </div>
              <DownloadButton
                data={combinedData}
                filename="consolidated_combined.csv"
                columnOrder={combinedColumnOrder}
              />
            </div>

            {isProcessing && (
              <ProcessingStatus message="Processing additional files..." />
            )}

            {errors.length > 0 && (
              <div className="animate-fade-in">
                <ErrorAlert type="error" messages={errors} onDismiss={() => setErrors([])} />
              </div>
            )}
            {warnings.length > 0 && (
              <div className="animate-fade-in">
                <ErrorAlert type="warning" messages={warnings} onDismiss={() => setWarnings([])} />
              </div>
            )}

            {fileResults.map((fr, index) => (
              <div
                key={fr.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <CollapsibleFileResult
                  fileResult={fr}
                  activeFilter={activeFilter}
                  isMultiFile={fileResults.length > 1}
                  onToggleCollapse={() => toggleCollapse(fr.id)}
                  onColumnOrderChange={(order) => updateColumnOrder(fr.id, order)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <span className="text-xs text-ink-3 font-mono">UPS Invoice Consolidator</span>
          <div className="flex items-center gap-4">
            {process.env.NEXT_PUBLIC_LAST_UPDATED && (
              <span className="text-xs text-ink-3 font-mono hidden sm:block">
                updated {new Date(process.env.NEXT_PUBLIC_LAST_UPDATED).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            <span className="text-xs text-ink-3">No data is ever uploaded to a server</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
