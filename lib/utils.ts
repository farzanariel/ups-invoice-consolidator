import { Dimensions, UPSInvoiceRow } from './types';

/**
 * Parse dimension string like "8.0x  8.0x  6.0" into structured object
 */
export function parseDimensions(dimString: string): Dimensions {
  const defaultDims: Dimensions = { length: '', width: '', height: '' };

  if (!dimString || dimString.trim() === '') {
    return defaultDims;
  }

  // Split by 'x' and clean up whitespace
  const parts = dimString.split('x').map(p => p.trim()).filter(p => p !== '');

  if (parts.length >= 3) {
    return {
      length: parts[0],
      width: parts[1],
      height: parts[2],
    };
  }

  return defaultDims;
}

/**
 * Format monetary amount to 2 decimal places
 */
export function formatAmount(value: string | number): string {
  if (value === '' || value === null || value === undefined) {
    return '';
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return '';
  }

  return num.toFixed(2);
}

/**
 * Get first non-empty value from rows for a specific column
 */
export function getFirstNonEmpty(
  rows: UPSInvoiceRow[],
  column: keyof UPSInvoiceRow,
  options?: { skipZero?: boolean; truncatePostal?: boolean }
): string {
  for (const row of rows) {
    const value = row[column];

    if (value && value.trim() !== '') {
      // Skip zero values for Entered Weight
      if (options?.skipZero && parseFloat(value) === 0) {
        continue;
      }

      // Truncate postal codes to 5 digits
      if (options?.truncatePostal && value.length > 5) {
        return value.substring(0, 5);
      }

      return value;
    }
  }

  return '';
}

/**
 * Check if a charge should be included based on amounts
 */
export function shouldIncludeCharge(row: UPSInvoiceRow): boolean {
  const incentive = parseFloat(row['Incentive Amount'] || '0');
  const netAmount = parseFloat(row['Net Amount'] || '0');

  // Include if either value is non-zero
  return incentive !== 0 || netAmount !== 0;
}

/**
 * Clean filename for download
 */
export function getConsolidatedFilename(originalFilename: string): string {
  // Remove .csv extension if present
  const nameWithoutExt = originalFilename.replace(/\.csv$/i, '');

  return `consolidated_${nameWithoutExt}.csv`;
}
