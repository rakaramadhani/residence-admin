'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getEmergencyAlert, EmergencyAlert } from '@/utils/emergency-fetcher';
import EmergencyAlertModal from '@/components/emergency-alert-modal';
import { subscribeToEmergencyChanges, EmergencyRealtimePayload } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface EmergencyContextType {
  currentAlert: EmergencyAlert | null;
  hasAlert: boolean;
  isLoading: boolean;
  checkEmergencyAlert: () => Promise<void>;
  handleEmergency: () => void;
  isRealtimeConnected: boolean;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (context === undefined) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};

interface EmergencyProviderProps {
  children: React.ReactNode;
}

export function EmergencyProvider({ children }: EmergencyProviderProps) {
  const [currentAlert, setCurrentAlert] = useState<EmergencyAlert | null>(null);
  const [hasAlert, setHasAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastAlertId, setLastAlertId] = useState<string | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  
  // Ref untuk menyimpan subscription channel
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Check if user is admin and logged in
  const isAdmin = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('adminToken');
    return !!token;
  }, []);

  // Fungsi untuk check emergency alert (manual trigger)
  const checkEmergencyAlert = useCallback(async () => {
    if (!isAdmin()) return;

    try {
      setIsLoading(true);
      const response = await getEmergencyAlert();
      
      if (response.hasAlert && response.data) {
        // Cek apakah ini alert baru (berbeda dari yang terakhir)
        if (response.data.id !== lastAlertId) {
          setCurrentAlert(response.data);
          setHasAlert(true);
          setIsModalOpen(true);
          setLastAlertId(response.data.id);
        }
      } else {
        setCurrentAlert(null);
        setHasAlert(false);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Emergency alert check failed:', error);
      setCurrentAlert(null);
      setHasAlert(false);
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, lastAlertId]);

  // Handler untuk realtime events
  const handleRealtimeEmergency = useCallback(async (payload: EmergencyRealtimePayload) => {
    console.log('🚨 Emergency realtime event detected:', payload);
    
    // Fetch data terbaru ketika ada emergency baru
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      await checkEmergencyAlert();
    }
  }, [checkEmergencyAlert]);

  // Fungsi untuk handle emergency (redirect ke halaman emergency)
  const handleEmergency = useCallback(() => {
    setCurrentAlert(null);
    setHasAlert(false);
    setIsModalOpen(false);
    
    // Redirect ke halaman emergency untuk tindak lanjut
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/emergency';
    }
  }, []);

  // Setup Supabase Realtime Subscription
  useEffect(() => {
    if (!isAdmin()) return;

    console.log('🔗 Setting up emergency realtime subscription...');

    try {
      // Subscribe to emergency table changes
      const channel = subscribeToEmergencyChanges(handleRealtimeEmergency);
      channelRef.current = channel;

      // Listen to subscription status
      channel
        .on('system', {}, (payload) => {
          console.log('Realtime system event:', payload);
          if (payload.event === 'CONNECT') {
            setIsRealtimeConnected(true);
            console.log('✅ Emergency realtime connected');
          } else if (payload.event === 'DISCONNECT') {
            setIsRealtimeConnected(false);
            console.log('❌ Emergency realtime disconnected');
          }
        });

      // Initial check for existing emergency
      checkEmergencyAlert();

    } catch (error) {
      console.error('Failed to setup realtime subscription:', error);
      setIsRealtimeConnected(false);
    }

    // Cleanup subscription on unmount
    return () => {
      if (channelRef.current) {
        console.log('🧹 Cleaning up emergency realtime subscription');
        channelRef.current.unsubscribe();
        channelRef.current = null;
        setIsRealtimeConnected(false);
      }
    };
  }, [isAdmin, handleRealtimeEmergency, checkEmergencyAlert]);

  // Listen untuk visibility change (ketika user kembali ke tab)
  useEffect(() => {
    if (!isAdmin()) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Re-check emergency ketika kembali ke tab
        checkEmergencyAlert();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkEmergencyAlert, isAdmin]);

  const value: EmergencyContextType = {
    currentAlert,
    hasAlert,
    isLoading,
    checkEmergencyAlert,
    handleEmergency,
    isRealtimeConnected,
  };

  return (
    <EmergencyContext.Provider value={value}>
      {children}
      
      {/* Emergency Alert Modal */}
      <EmergencyAlertModal
        isOpen={isModalOpen}
        onHandle={handleEmergency}
        emergency={currentAlert}
      />
      
      {/* Realtime Connection Indicator (untuk debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className={`px-3 py-1 text-xs rounded-full ${
            isRealtimeConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isRealtimeConnected ? '🟢 Realtime Connected' : '🔴 Realtime Disconnected'}
          </div>
        </div>
      )}
    </EmergencyContext.Provider>
  );
} 