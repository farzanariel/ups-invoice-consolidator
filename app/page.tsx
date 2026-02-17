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
import { consolidateRows } from '@/lib/consolidation';
import { getConsolidatedFilename } from '@/lib/utils';
import type {
  UPSInvoiceRow,
  ConsolidatedRow,
  ProcessingStats,
} from '@/lib/types';
import { RefreshCw } from 'lucide-react';

export default function Home() {
  const [originalData, setOriginalData] = useState<UPSInvoiceRow[] | null>(
    null
  );
  const [consolidatedData, setConsolidatedData] = useState<
    ConsolidatedRow[] | null
  >(null);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalFilename, setOriginalFilename] = useState<string>('');

  const handleFileUpload = async (file: File) => {
    // Reset state
    setErrors([]);
    setWarnings([]);
    setConsolidatedData(null);
    setStats(null);
    setIsProcessing(true);
    setOriginalFilename(file.name);

    try {
      // Parse CSV
      const { data, error } = await parseCSV(file);

      if (error) {
        setErrors([error]);
        setIsProcessing(false);
        return;
      }

      setOriginalData(data);

      // Validate CSV
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

      // Consolidate rows
      const { consolidated, stats: processingStats } = consolidateRows(data);

      if (processingStats.status === 'error') {
        setErrors([
          processingStats.errorMessage || 'An error occurred during processing',
        ]);
        setIsProcessing(false);
        return;
      }

      // Set results
      setConsolidatedData(consolidated);
      setStats(processingStats);
      setIsProcessing(false);
    } catch (err) {
      setErrors([
        err instanceof Error ? err.message : 'An unexpected error occurred',
      ]);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setOriginalData(null);
    setConsolidatedData(null);
    setStats(null);
    setErrors([]);
    setWarnings([]);
    setOriginalFilename('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-ups-brown text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold">UPS Invoice Consolidator</h1>
          <p className="text-ups-gold mt-2">
            Consolidate multiple invoice rows per tracking number into a single
            row
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* File Upload */}
          {!consolidatedData && (
            <FileUploader
              onFileSelect={handleFileUpload}
              isProcessing={isProcessing}
            />
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <ErrorAlert
              type="error"
              messages={errors}
              onDismiss={() => setErrors([])}
            />
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <ErrorAlert
              type="warning"
              messages={warnings}
              onDismiss={() => setWarnings([])}
            />
          )}

          {/* Processing Status */}
          {isProcessing && <ProcessingStatus message="Processing your CSV..." />}

          {/* Results */}
          {consolidatedData && stats && (
            <>
              {/* Stats Card */}
              <StatsCard stats={stats} />

              {/* Action Buttons */}
              <div className="flex gap-4 items-center">
                <DownloadButton
                  data={consolidatedData}
                  filename={getConsolidatedFilename(originalFilename)}
                />

                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg shadow-md border border-gray-300 hover:border-ups-gold transition-all duration-200"
                >
                  <RefreshCw className="w-5 h-5" />
                  Process Another File
                </button>
              </div>

              {/* CSV Preview */}
              <CSVPreview data={consolidatedData} />
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-ups-brown text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-300">
            UPS Invoice Consolidator - All processing happens in your browser
          </p>
        </div>
      </footer>
    </div>
  );
}
