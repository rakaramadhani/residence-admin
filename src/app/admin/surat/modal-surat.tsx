"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { updateStatusSurat, openDownloadSurat, checkFileStatus, downloadWithXHR } from "./fetcher";
import { CheckCircle, FileWarning, Loader2, Download } from "lucide-react";
import Swal from "sweetalert2";

interface Surat {
  id: string;
  userId: string;
  deskripsi?: string;
  fasilitas: string;
  keperluan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  createdAt: string;
  file?: string;
  status: "requested" | "approved" | "rejected";
  feedback?: string;
  user: {
    username?: string;
    email: string;
    phone?: string;
    cluster?: string;
    nomor_rumah?: string;
  };
}

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
      const options: Intl.DateTimeFormatOptions = { 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      };
      return new Intl.DateTimeFormat("id-ID", options).format(date);
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
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating surat status:", error);
      Swal.fire({
        title: "Error!",
        text: "Gagal memperbarui status surat",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (surat.status === "approved") {
      try {
        setDownloadLoading(true);
        
        // Periksa apakah file sudah siap
        const isFileReady = await checkFileStatus(surat.id);
        if (!isFileReady) {
          throw new Error("File belum siap atau tidak ditemukan");
        }

        // Mencoba 2 metode download, mulai dengan XMLHttpRequest yang lebih reliable
        try {
          // Metode 1: XMLHttpRequest (biasanya lebih reliable untuk file download dengan header auth)
          await downloadWithXHR(surat.id);
        } catch (xhrError) {
          console.error("XHR download failed, trying window.open method:", xhrError);
          
          // Metode 2: Buka di tab baru sebagai fallback
          openDownloadSurat(surat.id);
        }
        
        // Akhiri loading setelah beberapa saat
        setTimeout(() => {
          setDownloadLoading(false);
        }, 1500);
      } catch (error) {
        console.error("Error downloading document:", error);
        setDownloadLoading(false);
        Swal.fire({
          title: "Error!",
          text: "Gagal mengunduh dokumen. " + (error instanceof Error ? error.message : "Silakan coba lagi."),
          icon: "error",
        });
      }
    } else {
      Swal.fire({
        title: "Informasi",
        text: "File surat belum tersedia",
        icon: "info",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-3">
            Detail Permohonan Surat
            <Badge
              className={`ml-2 ${
                surat.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : surat.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {surat.status === "approved"
                ? "Disetujui"
                : surat.status === "rejected"
                ? "Ditolak"
                : "Menunggu Persetujuan"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-500">Pemohon</h3>
              <p className="text-lg">{surat.user.username || surat.user.email}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-500">Email</h3>
              <p>{surat.user.email}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-500">Telepon</h3>
              <p>{surat.user.phone || "-"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-500">Alamat</h3>
              <p>
                {surat.user.cluster || "Grand Calista"} No. {surat.user.nomor_rumah || "-"}
              </p>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold">Detail Permohonan</h3>

            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-500">Fasilitas</h3>
                <p>{surat.fasilitas}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-500">Keperluan</h3>
                <p>{surat.keperluan}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-500">Tanggal Penggunaan</h3>
                <p>{formatTanggal(surat.tanggalMulai)}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-500">Waktu</h3>
                <p>
                  {formatWaktu(surat.tanggalMulai)} - {formatWaktu(surat.tanggalSelesai)}
                </p>
              </div>
            </div>

            {surat.deskripsi && (
              <div className="mt-3">
                <h3 className="font-semibold text-gray-500">Deskripsi</h3>
                <p className="mt-1">{surat.deskripsi}</p>
              </div>
            )}
          </div>

          {surat.feedback && (
            <div className="mt-3 bg-gray-50 p-3 rounded-md">
              <h3 className="font-semibold text-gray-500">Feedback</h3>
              <p className="mt-1">{surat.feedback}</p>
            </div>
          )}

          {surat.status === "requested" && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-500 mb-2">Tambahkan Feedback (Opsional)</h3>
              <Textarea
                placeholder="Tulis feedback untuk pemohon di sini..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {surat.status === "approved" && (
            <div className="mt-4 flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleDownload}
                disabled={downloadLoading}
                className="flex items-center gap-2 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
              >
                {downloadLoading ? 
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 
                  <Download size={18} />
                }
                {downloadLoading ? "Mengunduh..." : "Download Surat Perizinan"}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          {surat.status === "requested" ? (
            <>
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleUpdateStatus("rejected")}
                disabled={loading}
                className="ml-2"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <FileWarning className="h-4 w-4 mr-2" />}
                Tolak
              </Button>
              <Button
                variant="default"
                onClick={() => handleUpdateStatus("approved")}
                disabled={loading}
                className="ml-2 bg-green-600 hover:bg-green-700"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Setujui
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
