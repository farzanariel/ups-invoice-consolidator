'use client';

import { ProcessingStats } from '@/lib/types';
import {
  FileText,
  Package,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';

interface StatsCardProps {
  stats: ProcessingStats;
}

export default function StatsCard({ stats }: StatsCardProps) {
  const statItems = [
    {
      label: 'Original Rows',
      value: stats.totalRows.toLocaleString(),
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Consolidated Rows',
      value: stats.uniqueTrackings.toLocaleString(),
      icon: Package,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Charges Kept',
      value: stats.keptCharges.toLocaleString(),
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Charges Removed',
      value: stats.removedCharges.toLocaleString(),
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Max Charges/Tracking',
      value: stats.maxChargesPerTracking.toString(),
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-ups-brown text-white px-6 py-4">
        <h2 className="text-xl font-semibold">Processing Summary</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-6">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-ups-gold transition-colors"
            >
              <div className={`p-2 rounded-lg ${item.bg}`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {item.value}
                </p>
                <p className="text-xs text-gray-600 mt-1">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
