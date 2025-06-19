"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, CheckCircle, Clock, Download, FileText, Loader2, MapPin, Phone, User, XCircle } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";
import { checkFileStatus, downloadWithFetch, downloadWithXHR, Surat, updateStatusSurat } from "./fetcher";

interface SuratModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: Surat | null;
  onSuccess: () => void;
}

export default function SuratModal({ isOpen, onClose, surat, onSuccess }: SuratModalProps) {
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  if (!surat) return null;

  const formatTanggal = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const formatWaktu = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit", 
        minute: "2-digit"
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const handleUpdateStatus = async (status: "approved" | "rejected") => {
    setLoading(true);
    try {
      await updateStatusSurat(surat.id, { status, feedback });
      Swal.fire({
        title: "Berhasil!",
        text: status === "approved" ? "Surat berhasil disetujui" : "Surat berhasil ditolak",
        icon: "success",
        confirmButtonColor: '#3B82F6'
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating surat status:", error);
      Swal.fire({
        title: "Error!",
        text: "Gagal memperbarui status surat",
        icon: "error",
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (surat.status !== "approved") {
      Swal.fire({
        title: "Informasi",
        text: "File surat belum tersedia. Surat harus disetujui terlebih dahulu.",
        icon: "info",
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    try {
      setDownloadLoading(true);
      
      const isFileReady = await checkFileStatus(surat.id);
      if (!isFileReady) {
        throw new Error("File belum siap atau tidak ditemukan");
      }

      try {
        await downloadWithXHR(surat.id);
        Swal.fire({
          title: "Berhasil!",
          text: "File berhasil diunduh",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
      } catch (xhrError) {
        console.error("XHR download failed, trying fetch method:", xhrError);
        await downloadWithFetch(surat.id);
        Swal.fire({
          title: "Berhasil!",
          text: "File berhasil diunduh", 
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
      }
      
    } catch (error) {
      console.error("Error downloading document:", error);
      Swal.fire({
        title: "Error!",
        text: error instanceof Error ? error.message : "Gagal mengunduh dokumen. Silakan coba lagi.",
        icon: "error",
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (surat.status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusText = () => {
    switch (surat.status) {
      case "approved": return "Disetujui";
      case "rejected": return "Ditolak";
      default: return "Menunggu";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center justify-between">
            <span className="text-lg font-semibold">Detail Permohonan Surat</span>
            <Badge variant="outline" className={getStatusBadge()}>
              {getStatusText()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info - Compact Card */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-900">Informasi Pemohon</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium w-16">Nama:</span>
                <span className="text-gray-700">{surat.user.username || surat.user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium w-16">Email:</span>
                <span className="text-gray-700">{surat.user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-gray-500" />
                <span className="text-gray-700">{surat.user.phone || "Tidak ada"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-gray-500" />
                <span className="text-gray-700">
                  {surat.user.cluster || "Grand Calista"} No. {surat.user.nomor_rumah || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Request Details - Compact Layout */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="font-medium text-gray-900">Detail Permohonan</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Fasilitas:</span>
                <p className="text-gray-900 mt-1">{surat.fasilitas}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Keperluan:</span>
                <p className="text-gray-900 mt-1">{surat.keperluan}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-gray-500" />
                <div>
                  <span className="font-medium text-gray-600">Tanggal:</span>
                  <p className="text-gray-900">{formatTanggal(surat.tanggalMulai)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-gray-500" />
                <div>
                  <span className="font-medium text-gray-600">Waktu:</span>
                  <p className="text-gray-900">
                    {formatWaktu(surat.tanggalMulai)} - {formatWaktu(surat.tanggalSelesai)}
                  </p>
                </div>
              </div>
            </div>

            {surat.deskripsi && (
              <div className="mt-4 pt-3 border-t">
                <span className="font-medium text-gray-600">Deskripsi:</span>
                <p className="text-gray-900 mt-1 text-sm">{surat.deskripsi}</p>
              </div>
            )}
          </div>

          {/* Feedback Display */}
          {surat.feedback && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <span className="font-medium text-blue-900 text-sm">Feedback Admin:</span>
              <p className="text-blue-800 mt-1 text-sm">{surat.feedback}</p>
            </div>
          )}

          {/* Feedback Input for Pending Requests */}
          {surat.status === "requested" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback/Catatan (Opsional)
              </label>
              <Textarea
                placeholder="Berikan catatan untuk pemohon..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>
          )}

          {/* Download Section for Approved */}
          {surat.status === "approved" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <Button 
                variant="outline" 
                onClick={handleDownload}
                disabled={downloadLoading}
                className="bg-green-600 text-white border-green-600 hover:bg-green-700"
              >
                {downloadLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {downloadLoading ? "Mengunduh..." : "Download Surat Perizinan"}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t">
          {surat.status === "requested" ? (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button 
                variant="outline" 
                onClick={onClose} 
                disabled={loading}
                className="flex-1 order-3 sm:order-1"
              >
                Batal
              </Button>
              <Button
                onClick={() => handleUpdateStatus("rejected")}
                disabled={loading}
                className="flex-1 order-2 text-white bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Tolak
              </Button>
              <Button
                onClick={() => handleUpdateStatus("approved")}
                disabled={loading}
                className="flex-1 order-1 sm:order-3 bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Setujui
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Tutup
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
