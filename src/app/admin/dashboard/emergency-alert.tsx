"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@supabase/supabase-js";
import { AlertTriangle, Clock, MapPin, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Emergency, fetchEmergencyAlert } from "./fetcher";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not defined");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface EmergencyAlertModalProps {
  onViewDetails: (emergency: Emergency) => void;
}

export function EmergencyAlertModal({ onViewDetails }: EmergencyAlertModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [emergency, setEmergency] = useState<Emergency | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkEmergencyAlert = async () => {
    try {
      const response = await fetchEmergencyAlert();
      if (response.hasAlert && response.data) {
        setEmergency(response.data);
        setIsOpen(true);
      }
      setLastChecked(new Date());
    } catch (error) {
      console.error("Error checking emergency alert:", error);
    }
  };

  useEffect(() => {
    // Initial check
    checkEmergencyAlert();

    // Supabase Realtime Subscription instead of polling
    const subscription = supabase
      .channel("emergency_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Emergency" },
        async (payload) => {
          console.log("Emergency changed (Alert):", payload);
          await checkEmergencyAlert();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleViewDetails = () => {
    if (emergency) {
      onViewDetails(emergency);
      setIsOpen(false);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-red-200 bg-red-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            ALERT DARURAT!
          </DialogTitle>
          <DialogDescription className="text-red-600">
            Ada laporan darurat yang memerlukan perhatian segera
          </DialogDescription>
        </DialogHeader>
        
        {emergency && (
          <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{emergency.user.username || emergency.user.email}</span>
              <span className="text-gray-500">
                {emergency.user.cluster && `• ${emergency.user.cluster}`}
                {emergency.user.nomor_rumah && ` No. ${emergency.user.nomor_rumah}`}
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Waktu: {formatTime(emergency.created_at)}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>
                Koordinat: {emergency.latitude.toFixed(6)}, {emergency.longitude.toFixed(6)}
              </span>
            </div>

            {/* Category */}
            {emergency.kategori && (
              <div className="text-sm">
                <span className="font-medium">Kategori: </span>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                  {emergency.kategori}
                </span>
              </div>
            )}

            {/* Detail */}
            {emergency.detail_kejadian && (
              <div className="text-sm">
                <span className="font-medium">Detail: </span>
                <p className="mt-1 p-2 bg-white rounded border text-gray-700">
                  {emergency.detail_kejadian}
                </p>
              </div>
            )}

            {/* Status */}
            <div className="text-sm">
              <span className="font-medium">Status: </span>
              <span className={`px-2 py-1 rounded text-xs ${
                emergency.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {emergency.status}
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleDismiss}>
            Tutup Alert
          </Button>
          <Button 
            onClick={handleViewDetails}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Lihat Detail & Tangani
          </Button>
        </DialogFooter>
        
        <div className="text-xs text-gray-500 text-center border-t pt-2">
          Last checked: {lastChecked.toLocaleTimeString('id-ID')}
        </div>
      </DialogContent>
    </Dialog>
  );
} 