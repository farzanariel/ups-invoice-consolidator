// Raw row from input CSV
export interface UPSInvoiceRow {
  'Account Number': string;
  'Invoice Date': string;
  'Invoice Number': string;
  'Tracking Number': string;
  'Lead Shipment Number': string;
  'Sender Postal': string;
  'Receiver Postal': string;
  'Billed Weight': string;
  'Entered Weight': string;
  'Detail Keyed Dim': string;
  'Charge Description': string;
  'Incentive Amount': string;
  'Net Amount': string;
  [key: string]: string;
}

// Consolidated output row
export interface ConsolidatedRow {
  'Account Number': string;
  'Invoice Date': string;
  'Invoice Number': string;
  'Tracking Number': string;
  'Sender Postal': string;
  'Receiver Postal': string;
  'Billed Weight': string;
  'Entered Weight': string;
  'Length': string;
  'Width': string;
  'Height': string;
  'Net Total': string;
  [key: string]: string; // Dynamic charge columns
}

// Processing statistics
export interface ProcessingStats {
  totalRows: number;
  uniqueTrackings: number;
  originalCharges: number;
  keptCharges: number;
  removedCharges: number;
  maxChargesPerTracking: number;
  status: 'idle' | 'processing' | 'success' | 'error';
  errorMessage?: string;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Dimension structure
export interface Dimensions {
  length: string;
  width: string;
  height: string;
}

// Charge information
export interface Charge {
  description: string;
  incentiveAmount: string;
  netAmount: string;
}
