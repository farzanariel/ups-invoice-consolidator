import {
  UPSInvoiceRow,
  ConsolidatedRow,
  ProcessingStats,
  Charge,
} from './types';
import {
  parseDimensions,
  formatAmount,
  getFirstNonEmpty,
  shouldIncludeCharge,
} from './utils';

/**
 * Group rows by tracking number
 */
function groupByTracking(rows: UPSInvoiceRow[]): Map<string, UPSInvoiceRow[]> {
  const groups = new Map<string, UPSInvoiceRow[]>();
  let noTrackingIdx = 0;

  for (const row of rows) {
    // Use Tracking Number, fallback to Lead Shipment Number
    const trackingNum =
      row['Tracking Number'] && row['Tracking Number'].trim() !== ''
        ? row['Tracking Number']
        : row['Lead Shipment Number'];

    // No tracking number — give it a unique internal key so it still gets output
    const key =
      !trackingNum || trackingNum.trim() === ''
        ? `__notracking_${noTrackingIdx++}`
        : trackingNum;

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key)!.push(row);
  }

  return groups;
}

/**
 * Main consolidation function
 */
export function consolidateRows(
  rows: UPSInvoiceRow[]
): {
  consolidated: ConsolidatedRow[];
  removedRows: UPSInvoiceRow[];
  stats: ProcessingStats;
} {
  const stats: ProcessingStats = {
    totalRows: rows.length,
    uniqueTrackings: 0,
    originalCharges: 0,
    keptCharges: 0,
    removedCharges: 0,
    maxChargesPerTracking: 0,
    totalNetAmount: 0,
    status: 'processing',
  };

  try {
    // Group rows by tracking number
    const grouped = groupByTracking(rows);
    stats.uniqueTrackings = [...grouped.keys()].filter(k => !k.startsWith('__notracking_')).length;

    const consolidated: ConsolidatedRow[] = [];
    const removedRows: UPSInvoiceRow[] = [];

    // Process each tracking group
    for (const [trackingNum, trackingRows] of grouped.entries()) {
      // Count original charges
      stats.originalCharges += trackingRows.length;

      // Filter charges (keep only non-zero)
      const filteredCharges = trackingRows.filter(shouldIncludeCharge);
      const removedCharges = trackingRows.filter((r) => !shouldIncludeCharge(r));
      stats.keptCharges += filteredCharges.length;
      stats.removedCharges += removedCharges.length;
      removedRows.push(...removedCharges);

      // Track max charges per tracking
      if (filteredCharges.length > stats.maxChargesPerTracking) {
        stats.maxChargesPerTracking = filteredCharges.length;
      }

      // Extract base columns from first row
      const firstRow = trackingRows[0];

      // Parse dimensions — scan all rows to find the first one with dimension data
      const dimString = getFirstNonEmpty(trackingRows, 'Detail Keyed Dim');
      const dimensions = parseDimensions(dimString);

      // Calculate Net Total (sum of all Net Amount values)
      const netTotal = trackingRows.reduce((sum, row) => {
        const amount = parseFloat(row['Net Amount'] || '0');
        return sum + amount;
      }, 0);

      // Build consolidated row with base columns
      const consolidatedRow: ConsolidatedRow = {
        'Account Number': getFirstNonEmpty(trackingRows, 'Account Number'),
        'Invoice Date': getFirstNonEmpty(trackingRows, 'Invoice Date'),
        'Invoice Number': getFirstNonEmpty(trackingRows, 'Invoice Number'),
        'Tracking Number': trackingNum.startsWith('__notracking_') ? '' : trackingNum,
        'Sender Postal': getFirstNonEmpty(trackingRows, 'Sender Postal'),
        'Receiver Postal': getFirstNonEmpty(trackingRows, 'Receiver Postal', {
          truncatePostal: true,
        }),
        'Billed Weight': getFirstNonEmpty(trackingRows, 'Billed Weight'),
        'Entered Weight': getFirstNonEmpty(trackingRows, 'Entered Weight', {
          skipZero: true,
        }),
        'Length': dimensions.length,
        'Width': dimensions.width,
        'Height': dimensions.height,
        'Total Shipment Cost': formatAmount(netTotal),
      };

      stats.totalNetAmount += netTotal;

      // Add filtered charges with dynamic column naming
      filteredCharges.forEach((chargeRow, index) => {
        const suffix = index === 0 ? '' : `.${index + 1}`;

        consolidatedRow[`Charge Description${suffix}`] =
          chargeRow['Charge Description'];
        consolidatedRow[`Incentive Amount${suffix}`] = formatAmount(
          chargeRow['Incentive Amount']
        );
        consolidatedRow[`Net Amount${suffix}`] = formatAmount(
          chargeRow['Net Amount']
        );
      });

      consolidated.push(consolidatedRow);
    }

    stats.status = 'success';

    return { consolidated, removedRows, stats };
  } catch (error) {
    stats.status = 'error';
    stats.errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return { consolidated: [], removedRows: [], stats };
  }
}

/**
 * Get all unique column headers from consolidated data
 */
export function getConsolidatedHeaders(data: ConsolidatedRow[]): string[] {
  const baseHeaders = [
    'Account Number',
    'Invoice Date',
    'Invoice Number',
    'Tracking Number',
    'Sender Postal',
    'Receiver Postal',
    'Billed Weight',
    'Entered Weight',
    'Length',
    'Width',
    'Height',
    'Total Shipment Cost',
  ];

  if (data.length === 0) {
    return baseHeaders;
  }

  // Collect all charge columns
  const chargeColumns = new Set<string>();
  data.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (
        key.startsWith('Charge Description') ||
        key.startsWith('Incentive Amount') ||
        key.startsWith('Net Amount')
      ) {
        chargeColumns.add(key);
      }
    });
  });

  // Sort charge columns to ensure proper ordering
  const sortedChargeColumns = Array.from(chargeColumns).sort((a, b) => {
    // Extract suffix number (e.g., ".2" from "Charge Description.2")
    const getNum = (str: string) => {
      const match = str.match(/\.(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    };

    const numA = getNum(a);
    const numB = getNum(b);

    if (numA !== numB) {
      return numA - numB;
    }

    // If same suffix, sort by column type
    const order = ['Charge Description', 'Incentive Amount', 'Net Amount'];
    const typeA = order.findIndex((t) => a.startsWith(t));
    const typeB = order.findIndex((t) => b.startsWith(t));

    return typeA - typeB;
  });

  return [...baseHeaders, ...sortedChargeColumns];
}
