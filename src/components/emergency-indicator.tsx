'use client';

import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useEmergency } from '@/contexts/emergency-context';

export default function EmergencyIndicator() {
  const { hasAlert, currentAlert, handleEmergency } = useEmergency();

  if (!hasAlert || !currentAlert) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={handleEmergency}
        className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse border-2 border-red-700 hover:bg-red-700 transition-colors"
        title="Klik untuk menangani emergency"
      >
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="h-5 w-5 animate-bounce" />
          <div>
            <div className="font-bold text-sm">🚨 EMERGENCY!</div>
            <div className="text-xs">
              {currentAlert.user?.username || 'Pengguna'} - {currentAlert.kategori || 'Darurat'}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
} 