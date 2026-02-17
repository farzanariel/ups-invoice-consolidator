import Papa from 'papaparse';
import { UPSInvoiceRow, ConsolidatedRow } from './types';
import { getConsolidatedHeaders } from './consolidation';

/**
 * Parse CSV file into array of objects
 */
export function parseCSV(
  file: File
): Promise<{ data: UPSInvoiceRow[]; error?: string }> {
  return new Promise((resolve) => {
    Papa.parse<UPSInvoiceRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          resolve({
            data: [],
            error: `CSV parsing errors: ${results.errors
              .map((e) => e.message)
              .join(', ')}`,
          });
        } else {
          resolve({ data: results.data });
        }
      },
      error: (error) => {
        resolve({
          data: [],
          error: `Failed to parse CSV: ${error.message}`,
        });
      },
    });
  });
}

/**
 * Export consolidated data to CSV string
 */
export function exportCSV(data: ConsolidatedRow[]): string {
  if (data.length === 0) {
    return '';
  }

  // Get headers in correct order
  const headers = getConsolidatedHeaders(data);

  // Convert data to array format with headers
  const csv = Papa.unparse({
    fields: headers,
    data: data.map((row) => {
      // Ensure all headers are present, even if empty
      return headers.map((header) => row[header] || '');
    }),
  });

  return csv;
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL
  URL.revokeObjectURL(url);
}
