"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/ui/modal";
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

  if (!isOpen || !surat) return null;

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
    <Modal onClose={onClose} title="Detail Permohonan Surat">
      <div className="max-h-[80vh] overflow-y-auto space-y-4">
        {/* Status Badge */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Status Permohonan</span>
          <Badge className={getStatusBadge()}>
            {getStatusText()}
          </Badge>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-gray-900">Informasi Pemohon</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="block text-xs text-gray-500 mb-1">Nama</Label>
              <Input value={surat.user.username || surat.user.email} readOnly className="bg-white text-sm" />
            </div>
            <div>
              <Label className="block text-xs text-gray-500 mb-1">Email</Label>
              <Input value={surat.user.email} readOnly className="bg-white text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-gray-500" />
              <Input value={surat.user.phone || "Tidak ada"} readOnly className="bg-white text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-gray-500" />
              <Input 
                value={`${surat.user.cluster || "Grand Calista"} No. ${surat.user.nomor_rumah || "-"}`} 
                readOnly 
                className="bg-white text-sm" 
              />
            </div>
          </div>
        </div>

        {/* Request Details */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-green-600" />
            <span className="font-medium text-gray-900">Detail Permohonan</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-xs text-gray-500 mb-1">Fasilitas</Label>
              <Input value={surat.fasilitas} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label className="block text-xs text-gray-500 mb-1">Keperluan</Label>
              <Input value={surat.keperluan} readOnly className="bg-gray-50" />
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-gray-500" />
              <div className="flex-1">
                <Label className="block text-xs text-gray-500 mb-1">Tanggal</Label>
                <Input value={formatTanggal(surat.tanggalMulai)} readOnly className="bg-gray-50" />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-gray-500" />
              <div className="flex-1">
                <Label className="block text-xs text-gray-500 mb-1">Waktu</Label>
                <Input 
                  value={`${formatWaktu(surat.tanggalMulai)} - ${formatWaktu(surat.tanggalSelesai)}`} 
                  readOnly 
                  className="bg-gray-50" 
                />
              </div>
            </div>
          </div>

          {surat.deskripsi && (
            <div className="mt-4 pt-3 border-t">
              <Label className="block text-xs text-gray-500 mb-1">Deskripsi</Label>
              <Textarea value={surat.deskripsi} readOnly className="bg-gray-50 text-sm" rows={3} />
            </div>
          )}
        </div>

        {/* Feedback Display */}
        {surat.feedback && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Label className="block text-xs text-blue-900 mb-1">Feedback Admin</Label>
            <p className="text-blue-800 text-sm">{surat.feedback}</p>
          </div>
        )}

        {/* Feedback Input for Pending Requests */}
        {surat.status === "requested" && (
          <div>
            <Label className="block text-sm font-medium mb-2">
              Feedback/Catatan (Opsional)
            </Label>
            <Textarea
              placeholder="Berikan catatan untuk pemohon..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
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

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          {surat.status === "requested" ? (
            <>
              <Button 
                variant="outline" 
                onClick={onClose} 
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                onClick={() => handleUpdateStatus("rejected")}
                disabled={loading}
                className="text-white bg-red-600 hover:bg-red-700"
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
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Setujui
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
