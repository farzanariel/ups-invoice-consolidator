import { UPSInvoiceRow, ValidationResult } from './types';

const REQUIRED_COLUMNS = [
  'Tracking Number',
  'Lead Shipment Number',
  'Net Amount',
  'Charge Description',
];

const LARGE_FILE_THRESHOLD = 10000;

/**
 * Validate CSV data before processing
 */
export function validateCSV(data: UPSInvoiceRow[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if empty
  if (!data || data.length === 0) {
    errors.push('CSV file is empty. Please upload a file with data.');
    return { valid: false, errors, warnings };
  }

  // Check for required columns
  const firstRow = data[0];
  const presentColumns = Object.keys(firstRow);

  const missingColumns = REQUIRED_COLUMNS.filter(
    (col) => !presentColumns.includes(col)
  );

  if (missingColumns.length > 0) {
    errors.push(
      `Missing required columns: ${missingColumns.join(', ')}. Please ensure your CSV has the correct UPS invoice format.`
    );
  }

  // Check if at least one row has a tracking number
  const hasTracking = data.some(
    (row) =>
      (row['Tracking Number'] && row['Tracking Number'].trim() !== '') ||
      (row['Lead Shipment Number'] && row['Lead Shipment Number'].trim() !== '')
  );

  if (!hasTracking) {
    errors.push(
      'No tracking numbers found in the CSV. Please check your data.'
    );
  }

  // Warn about large files
  if (data.length > LARGE_FILE_THRESHOLD) {
    warnings.push(
      `Large file detected (${data.length.toLocaleString()} rows). Processing may take longer than usual.`
    );
  }

  // Check for common column name issues
  const trackingColVariants = presentColumns.filter((col) =>
    col.toLowerCase().includes('tracking')
  );

  if (trackingColVariants.length > 1) {
    warnings.push(
      `Multiple tracking-related columns found: ${trackingColVariants.join(', ')}. Using "Tracking Number" column.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
