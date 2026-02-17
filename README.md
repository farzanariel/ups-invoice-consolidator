# UPS Invoice Consolidator

A modern web application for consolidating UPS invoice CSV files. Merge multiple rows per tracking number into a single consolidated row - all processing happens in your browser.

## Features

- 🚀 **Pure Frontend** - All processing happens in your browser, no server required
- 📊 **Smart Consolidation** - Groups rows by tracking number and intelligently merges data
- 🎯 **Charge Filtering** - Automatically removes zero-amount charges
- 📈 **Real-time Statistics** - See processing metrics instantly
- 📄 **CSV Preview** - Paginated table view with 50 rows per page
- 💾 **Easy Export** - Download consolidated CSV with one click
- 🎨 **UPS Branding** - Clean interface with official UPS colors

## How It Works

1. **Upload** - Drag and drop or click to browse for your UPS invoice CSV
2. **Process** - Application automatically:
   - Groups rows by tracking number (or lead shipment number)
   - Parses dimensions from "Detail Keyed Dim" field
   - Filters out charges where both Incentive Amount = 0 AND Net Amount = 0
   - Calculates Net Total for each tracking
   - Consolidates all charges into a single row
3. **Review** - View statistics and preview the consolidated data
4. **Download** - Export your consolidated CSV file

## Consolidation Logic

### Base Columns
- Account Number, Invoice Date, Invoice Number
- Tracking Number (uses "Tracking Number" field, falls back to "Lead Shipment Number")
- Sender/Receiver Postal Codes (receiver postal truncated to 5 digits)
- Billed Weight, Entered Weight (skips zero values)
- Dimensions: Length, Width, Height (parsed from "Detail Keyed Dim")
- Net Total (sum of all Net Amount values)

### Dynamic Charge Columns
- First charge: "Charge Description", "Incentive Amount", "Net Amount"
- Subsequent charges: "Charge Description.2", "Incentive Amount.2", "Net Amount.2", etc.
- Only includes charges where Incentive Amount ≠ 0 OR Net Amount ≠ 0

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Other Platforms
The application works on any static hosting platform:
- Netlify
- Cloudflare Pages
- AWS Amplify
- GitHub Pages (with Next.js static export)

## Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **CSV Parsing**: PapaParse
- **File Upload**: react-dropzone
- **Icons**: lucide-react

## Project Structure

```
refour-nextjs/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main consolidator page
│   └── globals.css         # Tailwind + UPS colors
├── components/
│   ├── FileUploader.tsx    # Drag-and-drop upload
│   ├── ProcessingStatus.tsx # Progress indicator
│   ├── CSVPreview.tsx      # Paginated table preview
│   ├── DownloadButton.tsx  # CSV export
│   ├── StatsCard.tsx       # Statistics display
│   └── ErrorAlert.tsx      # Error/warning display
├── lib/
│   ├── consolidation.ts    # Core consolidation logic
│   ├── csv-parser.ts       # PapaParse wrapper
│   ├── validation.ts       # CSV validation
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Helper functions
└── public/                 # Static assets
```

## Validation

The application validates:
- Required columns: Tracking Number, Lead Shipment Number, Net Amount, Charge Description
- Non-empty CSV files
- At least one valid tracking number
- Large file warnings (>10k rows)

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Privacy & Security

- All CSV processing happens locally in your browser
- No data is uploaded to any server
- Files never leave your device
- Safe for sensitive invoice data

## Example Output

**Input**: 834 rows with multiple charges per tracking number
**Output**: 245 consolidated rows (one per tracking number)

Each consolidated row contains:
- All base shipment information
- Parsed dimensions (Length, Width, Height)
- Net Total (sum of all charges)
- Individual charge details (filtered to non-zero amounts only)

## License

MIT License - feel free to use and modify as needed.
