'use client';

import React, { useEffect, useRef } from 'react';
import { 
  ExclamationTriangleIcon, 
  MapPinIcon, 
  UserIcon,
  PhoneIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { EmergencyAlert } from '@/utils/emergency-fetcher';

interface EmergencyAlertModalProps {
  isOpen: boolean;
  onHandle: () => void;
  emergency: EmergencyAlert | null;
}

export default function EmergencyAlertModal({ 
  isOpen, 
  onHandle, 
  emergency 
}: EmergencyAlertModalProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (isOpen && emergency) {
      // Play alarm sound
      playAlarmSound();
      
      // Auto vibration if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    }

    return () => {
      // Stop alarm when modal closes
      stopAlarmSound();
    };
  }, [isOpen, emergency]);

  const playAlarmSound = () => {
    try {
      // Create audio context for alarm sound
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as never)['webkitAudioContext'];
        audioContextRef.current = new AudioContextClass();
        
        const createBeep = () => {
          if (!audioContextRef.current) return;
          
          const oscillator = audioContextRef.current.createOscillator();
          const gainNode = audioContextRef.current.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContextRef.current.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
          
          oscillator.start();
          oscillator.stop(audioContextRef.current.currentTime + 0.2);
          
          // Schedule next beep
          setTimeout(createBeep, 500);
        };
        
        createBeep();
      }
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  };

  const stopAlarmSound = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (oscillatorRef.current) {
      oscillatorRef.current = null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const openMapLocation = (latitude: number, longitude: number) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  };

  const handleEmergency = () => {
    stopAlarmSound();
    onHandle();
  };

  if (!isOpen || !emergency) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop dengan efek flashing */}
        <div 
          className="fixed inset-0 transition-opacity animate-pulse"
          style={{
            background: 'linear-gradient(45deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
            animation: 'flash 1s infinite alternate'
          }}
        >
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-bounce">
          {/* Header dengan warning - tanpa tombol close */}
          <div className="bg-red-600 px-4 py-3">
            <div className="flex items-center justify-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-white animate-pulse mr-3" />
              <h3 className="text-lg font-bold text-white">
                🚨 EMERGENCY ALERT 🚨
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="space-y-4">
              {/* Pelapor Info */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <UserIcon className="h-5 w-5 text-red-600 mr-2" />
                  <h4 className="font-semibold text-red-900">Pelapor</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Nama: </span>
                    {emergency.user?.username || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Email: </span>
                    {emergency.user?.email || 'N/A'}
                  </div>
                  {emergency.user?.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-1" />
                      <span className="font-medium">HP: </span>
                      <a 
                        href={`tel:${emergency.user.phone}`}
                        className="text-blue-600 hover:underline ml-1"
                      >
                        {emergency.user.phone}
                      </a>
                    </div>
                  )}
                  {emergency.user?.cluster && (
                    <div>
                      <span className="font-medium">Cluster: </span>
                      {emergency.user.cluster}
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Details */}
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">Kategori: </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                    {emergency.kategori || 'Tidak dikategorikan'}
                  </span>
                </div>

                {emergency.detail_kejadian && (
                  <div>
                    <span className="font-semibold text-gray-700">Detail Kejadian: </span>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                      {emergency.detail_kejadian}
                    </p>
                  </div>
                )}

                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-semibold text-gray-700">Waktu: </span>
                  <span className="ml-1 text-sm">
                    {formatDate(emergency.created_at)}
                  </span>
                </div>

                {/* Location */}
                <div>
                  <button
                    onClick={() => openMapLocation(emergency.latitude, emergency.longitude)}
                    className="flex items-center w-full p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <MapPinIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <div className="text-left">
                      <div className="font-semibold text-blue-900">Lihat Lokasi di Maps</div>
                      <div className="text-sm text-blue-700">
                        {emergency.latitude.toFixed(6)}, {emergency.longitude.toFixed(6)}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions - Hanya satu tombol */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-center">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-3 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm animate-pulse"
              onClick={handleEmergency}
            >
              🚑 BERI TINDAKAN
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes flash {
          0% { opacity: 0.8; }
          100% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
} 