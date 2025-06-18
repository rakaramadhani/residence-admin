import { messaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';
import { useEffect, useState } from 'react';

interface FCMTokenHookResult {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  generateToken: () => Promise<void>;
}

export const useFCMToken = (userId?: string): FCMTokenHookResult => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateToken = async () => {
    if (!messaging) {
      setError('Firebase messaging not supported');
      return;
    }

    if (!userId) {
      setError('User ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Generate FCM token
        const fcmToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY
        });

        if (fcmToken) {
          setToken(fcmToken);
          
          // Send token to backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notification/fcm`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,
              token: fcmToken
            })
          });

          if (!response.ok) {
            throw new Error('Failed to save FCM token to backend');
          }

          console.log('FCM token saved successfully');
        } else {
          throw new Error('No registration token available');
        }
      } else {
        throw new Error('Notification permission denied');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error generating FCM token:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && messaging) {
      generateToken();
    }
  }, [userId]);

  return {
    token,
    isLoading,
    error,
    generateToken
  };
}; 