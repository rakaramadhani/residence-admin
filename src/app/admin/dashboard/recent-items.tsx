"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@supabase/supabase-js";
import { Calendar, CheckCircle2, FileText, Loader2, MessageSquare, User } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { fetchPengaduan, Pengaduan, updatePengaduanStatus } from "./fetcher";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not defined");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface User {
  id: string;
  email: string;
  username?: string;
  phone?: string;
  cluster?: string;
  nomor_rumah?: string;
  rt?: string;
  rw?: string;
}

interface Pengaduan {
  id: string;
  userId: string;
  pengaduan: string;
  kategori: string;
  status_pengaduan: string;
  feedback?: string;
  foto?: string;
  created_at: string;
  updatedAt: string;
  user: User;
}

export function RecentItems() {
  const [pengaduan, setPengaduan] = useState<Pengaduan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedPengaduan, setSelectedPengaduan] = useState<Pengaduan | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadPengaduan = async () => {
    try {
      const data = await fetchPengaduan();
      // Sort by most recent and take top 10 for display
      const sortedData = data
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
      setPengaduan(sortedData);
    } catch (error) {
      console.error("Error loading pengaduan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPengaduan();

    // Supabase Realtime Subscription
    const subscription = supabase
      .channel("pengaduan_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pengaduan" },
        async (payload) => {
          console.log("Pengaduan changed (Recent Items):", payload);
          await loadPengaduan();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "baru":
        return <Badge className="bg-blue-100 text-blue-800">Baru</Badge>;
      case "proses":
        return <Badge className="bg-yellow-100 text-yellow-800">Proses</Badge>;
      case "selesai":
        return <Badge className="bg-green-100 text-green-800">Selesai</Badge>;
      case "ditolak":
        return <Badge className="bg-red-100 text-red-800">Ditolak</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = (pengaduanItem: Pengaduan) => {
    setSelectedPengaduan(pengaduanItem);
    setNewStatus(pengaduanItem.status_pengaduan);
    setFeedback("");
    setModalOpen(true);
  };

  const handleUpdateSubmit = async () => {
    if (!selectedPengaduan || !newStatus) return;

    setIsUpdating(true);
    try {
      const result = await updatePengaduanStatus(
        selectedPengaduan.id,
        newStatus,
        feedback || undefined
      );

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Status pengaduan berhasil diperbarui',
          confirmButtonColor: '#3B82F6',
          timer: 2000,
          showConfirmButton: false
        });
        setModalOpen(false);
        await loadPengaduan();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Gagal memperbarui status pengaduan',
          confirmButtonColor: '#3B82F6'
        });
      }
    } catch (error) {
      console.error("Error updating pengaduan:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Terjadi kesalahan saat memperbarui status',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Kelola Pengaduan
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p className="mt-2 text-gray-500">Memuat pengaduan...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusCounts = {
    baru: pengaduan.filter(p => p.status_pengaduan === "baru").length,
    proses: pengaduan.filter(p => p.status_pengaduan === "proses").length,
    selesai: pengaduan.filter(p => p.status_pengaduan === "selesai").length,
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Kelola Pengaduan
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          {/* Quick Stats */}
          <div className="flex-shrink-0 grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 bg-blue-50 rounded text-xs">
              <div className="font-bold text-blue-600">{statusCounts.baru}</div>
              <div className="text-blue-600">Baru</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded text-xs">
              <div className="font-bold text-yellow-600">{statusCounts.proses}</div>
              <div className="text-yellow-600">Proses</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded text-xs">
              <div className="font-bold text-green-600">{statusCounts.selesai}</div>
              <div className="text-green-600">Selesai</div>
            </div>
          </div>

          {/* Pengaduan List - Scrollable */}
          <div className="flex-1 min-h-0">
            <h4 className="font-medium text-sm text-gray-700 mb-3">Pengaduan Terbaru</h4>
            {pengaduan.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Belum ada pengaduan</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-full pr-2">
                {pengaduan.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-sm">{item.user.username || item.user.email}</span>
                      </div>
                      {getStatusBadge(item.status_pengaduan)}
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Kategori: </span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">{item.kategori}</span>
                      </div>

                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Keluhan: </span>
                        <p className="mt-1 text-xs line-clamp-2">{item.pengaduan}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(item.created_at)}</span>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(item)}
                          className="text-xs h-7"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 mt-4 pt-3 border-t text-center">
            <p className="text-xs text-gray-500">
              Total {pengaduan.length} pengaduan ditampilkan
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Update Status Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Update Status Pengaduan
            </DialogTitle>
            <DialogDescription>
              Perbarui status dan berikan feedback untuk pengaduan ini
            </DialogDescription>
          </DialogHeader>

          {selectedPengaduan && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm font-medium">{selectedPengaduan.user.username || selectedPengaduan.user.email}</div>
                <div className="text-xs text-gray-600">{selectedPengaduan.kategori}</div>
                <div className="text-xs mt-1">{selectedPengaduan.pengaduan}</div>
              </div>

              <div>
                <Label className="text-sm font-medium">Status Baru</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baru">Baru</SelectItem>
                    <SelectItem value="proses">Sedang Diproses</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                    <SelectItem value="ditolak">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Feedback (Opsional)</Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Berikan keterangan atau feedback..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleUpdateSubmit} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 