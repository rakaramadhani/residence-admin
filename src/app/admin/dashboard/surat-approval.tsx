"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@supabase/supabase-js";
import {
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    User,
    XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { fetchDetailSurat, Surat as SuratDetail } from "../surat/fetcher";
import SuratModal from "../surat/modal-surat";
import { fetchSurat, Surat } from "./fetcher";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not defined");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function SuratApprovalCenter() {
  const [suratPending, setSuratPending] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState<SuratDetail | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadSuratPending = async () => {
    try {
      const suratData = await fetchSurat();
      const pending = suratData.filter(surat => surat.status === "requested");
      setSuratPending(pending);
    } catch (error) {
      console.error("Error loading surat:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuratPending();

    // Supabase Realtime Subscription
    const subscription = supabase
      .channel("surat_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "surat" },
        async (payload) => {
          console.log("Surat changed (Approval):", payload);
          await loadSuratPending();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleApprove = async (surat: Surat) => {
    const result = await Swal.fire({
      title: 'Setujui Permohonan',
      text: `Apakah Anda yakin ingin menyetujui permohonan surat dari ${surat.user.username || surat.user.email}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Setujui!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    setActionLoading(true);
    try {
      // Use the same API from surat modal
      const { updateStatusSurat } = await import("../surat/fetcher");
      await updateStatusSurat(surat.id, { status: "approved", feedback: "" });
      
      Swal.fire({
        title: "Berhasil!",
        text: "Permohonan surat telah disetujui",
        icon: "success",
        confirmButtonColor: '#3B82F6'
      });
      await loadSuratPending();
    } catch (error) {
      console.error("Error approving surat:", error);
      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat menyetujui permohonan",
        icon: "error",
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (surat: Surat) => {
    const { value: feedback } = await Swal.fire({
      title: 'Tolak Permohonan',
      text: `Berikan alasan penolakan untuk permohonan surat dari ${surat.user.username || surat.user.email}`,
      input: 'textarea',
      inputPlaceholder: 'Masukkan alasan penolakan...',
      inputValidator: (value) => {
        if (!value) {
          return 'Alasan penolakan harus diisi!';
        }
      },
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Tolak!',
      cancelButtonText: 'Batal',
      inputAttributes: {
        'aria-label': 'Alasan penolakan'
      }
    });

    if (!feedback) return;

    setActionLoading(true);
    try {
      const { updateStatusSurat } = await import("../surat/fetcher");
      await updateStatusSurat(surat.id, { status: "rejected", feedback });
      
      Swal.fire({
        title: "Berhasil!",
        text: "Permohonan surat telah ditolak",
        icon: "success",
        confirmButtonColor: '#3B82F6'
      });
      await loadSuratPending();
    } catch (error) {
      console.error("Error rejecting surat:", error);
      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat menolak permohonan",
        icon: "error",
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetail = async (surat: Surat) => {
    try {
      const result = await fetchDetailSurat(surat.id);
      if (result.data) {
        setSelectedSurat(result.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error fetching surat detail:", error);
      Swal.fire({
        title: "Error!",
        text: "Gagal memuat detail surat",
        icon: "error",
        confirmButtonColor: '#3B82F6'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="h-[500px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Persetujuan Surat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p className="mt-2 text-gray-500">Memuat data surat...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-[500px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Persetujuan Surat
            {suratPending.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {suratPending.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {suratPending.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Tidak ada permohonan surat yang menunggu</p>
            </div>
          ) : (
            <div className="h-full overflow-y-auto space-y-3">
              {suratPending.slice(0, 5).map((surat) => (
                <div key={surat.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                     onClick={() => handleViewDetail(surat)}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{surat.user.username || surat.user.email}</span>
                      {surat.user.cluster && (
                        <Badge variant="outline" className="text-xs">
                          {surat.user.cluster}
                        </Badge>
                      )}
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="text-sm">
                      <span className="font-medium">Keperluan: </span>
                      <span className="text-gray-700">{surat.keperluan}</span>
                    </div>
                    
                    {surat.fasilitas && (
                      <div className="text-sm">
                        <span className="font-medium">Fasilitas: </span>
                        <span className="text-gray-700">{surat.fasilitas}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Mulai: {formatDate(surat.tanggalMulai)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Selesai: {formatDate(surat.tanggalSelesai)}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400">
                      Diajukan: {formatDateTime(surat.createdAt)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(surat);
                      }}
                      className="flex-1 ml-2 text-white bg-red-600 hover:bg-red-700"
                      disabled={actionLoading}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      {actionLoading ? 'Memproses...' : 'Tolak'}
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(surat);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                      disabled={actionLoading}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {actionLoading ? 'Memproses...' : 'Setujui'}
                    </Button>
                  </div>
                </div>
              ))}

              {suratPending.length > 5 && (
                <div className="text-center pt-2 flex-shrink-0">
                  <p className="text-sm text-gray-500">
                    Dan {suratPending.length - 5} permohonan lainnya...
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Use existing SuratModal */}
      {selectedSurat && (
        <SuratModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          surat={selectedSurat}
          onSuccess={loadSuratPending}
        />
      )}
    </>
  );
} 