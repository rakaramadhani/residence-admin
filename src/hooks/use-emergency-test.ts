'use client';

import { useEmergency } from '@/contexts/emergency-context';

// Hook untuk testing emergency alert system dengan realtime
export const useEmergencyTest = () => {
  const emergency = useEmergency();

  const triggerManualCheck = () => {
    console.log('Triggering manual emergency check...');
    emergency.checkEmergencyAlert();
  };

  const logEmergencyStatus = () => {
    console.log('Emergency Status:', {
      hasAlert: emergency.hasAlert,
      isLoading: emergency.isLoading,
      isRealtimeConnected: emergency.isRealtimeConnected,
      alertId: emergency.currentAlert?.id,
      kategori: emergency.currentAlert?.kategori,
      pelapor: emergency.currentAlert?.user?.username
    });
  };

  const simulateEmergencyAction = () => {
    console.log('Simulating emergency action (redirect to emergency page)...');
    emergency.handleEmergency();
  };

  const checkRealtimeConnection = () => {
    console.log('Realtime Connection Status:', {
      connected: emergency.isRealtimeConnected,
      status: emergency.isRealtimeConnected ? '✅ Connected' : '❌ Disconnected'
    });
  };

  return {
    triggerManualCheck,
    logEmergencyStatus,
    simulateEmergencyAction,
    checkRealtimeConnection
  };
}; 