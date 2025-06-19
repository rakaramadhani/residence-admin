"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@supabase/supabase-js";
import { Clock, Edit, Image, MessageCircle, MessageSquare, Search, User } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchPengaduan } from "../pengaduan/fetcher";
import UpdateModal from "../pengaduan/update-modal";

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
  const [pengaduanData, setPengaduanData] = useState<Pengaduan[]>([]);
  const [filteredData, setFilteredData] = useState<Pengaduan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  
  // Modal states
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedPengaduanId, setSelectedPengaduanId] = useState<string | null>(null);

  useEffect(() => {
    loadPengaduanData();

    // Supabase Realtime Subscription
    const subscription = supabase
      .channel("pengaduan_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pengaduan" },
        async (payload) => {
          console.log("Pengaduan changed:", payload);
          await loadPengaduanData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Filter data when search term or status filter changes
  useEffect(() => {
    let filtered = [...pengaduanData];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.pengaduan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kategori.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "Semua") {
      filtered = filtered.filter(item => item.status_pengaduan === statusFilter);
    }

    // Sort by created date (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setFilteredData(filtered);
  }, [pengaduanData, searchTerm, statusFilter]);

  const loadPengaduanData = async () => {
    try {
      const response = await fetchPengaduan();
      if (response && response.data) {
        setPengaduanData(response.data);
      }
    } catch (error) {
      console.error("Error loading pengaduan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenUpdateModal = (id: string) => {
    setSelectedPengaduanId(id);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedPengaduanId(null);
  };

  const handleUpdateSuccess = () => {
    loadPengaduanData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PengajuanBaru':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Ditangani':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Selesai':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'PengajuanBaru':
        return 'Pengajuan Baru';
      default:
        return status;
    }
  };

  const getKategoriColor = (kategori: string) => {
    switch (kategori) {
      case 'Keamanan':
        return 'bg-red-100 text-red-800';
      case 'Infrastruktur':
        return 'bg-purple-100 text-purple-800';
      case 'Kebersihan':
        return 'bg-green-100 text-green-800';
      case 'Pelayanan':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeElapsed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} menit yang lalu`;
      }
      return `${diffHours} jam yang lalu`;
    } else if (diffDays === 1) {
      return 'Kemarin';
    } else {
      return `${diffDays} hari yang lalu`;
    }
  };

  const pendingCount = pengaduanData.filter(p => p.status_pengaduan === "PengajuanBaru").length;
  const processedCount = pengaduanData.filter(p => p.status_pengaduan === "Ditangani").length;
  const completedCount = pengaduanData.filter(p => p.status_pengaduan === "Selesai").length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Kelola Pengaduan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p className="mt-2 text-gray-500">Memuat data pengaduan...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Kelola Pengaduan
            </div>
            {pendingCount > 0 && (
              <Badge variant="destructive">
                {pendingCount} baru
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
              <div className="text-xs text-gray-600">Baru</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{processedCount}</div>
              <div className="text-xs text-gray-600">Ditangani</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-xs text-gray-600">Selesai</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari pengaduan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-auto min-w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua">Semua Status</SelectItem>
                <SelectItem value="PengajuanBaru">Pengajuan Baru</SelectItem>
                <SelectItem value="Ditangani">Ditangani</SelectItem>
                <SelectItem value="Selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pengaduan List */}
          <div className="space-y-3">
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{searchTerm || statusFilter !== "Semua" ? "Tidak ada pengaduan yang sesuai filter" : "Belum ada pengaduan"}</p>
              </div>
            ) : (
              filteredData.slice(0, 8).map((pengaduan) => (
                <div key={pengaduan.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{pengaduan.user.username || pengaduan.user.email.split('@')[0]}</span>
                      {pengaduan.user.cluster && (
                        <Badge variant="outline" className="text-xs">
                          {pengaduan.user.cluster} {pengaduan.user.nomor_rumah}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getKategoriColor(pengaduan.kategori)}>
                        {pengaduan.kategori}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(pengaduan.status_pengaduan)}>
                        {formatStatus(pengaduan.status_pengaduan)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-start gap-2">
                      <div className="text-sm text-gray-700 line-clamp-2 flex-1">
                        {pengaduan.pengaduan}
                      </div>
                      {pengaduan.foto && (
                        <div className="flex-shrink-0">
                          <Badge variant="outline" className="h-5 w-5 flex items-center justify-center p-0">
                            <Image className="h-3 w-3" />
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{getTimeElapsed(pengaduan.created_at)}</span>
                      </div>
                      {pengaduan.feedback && (
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>Dengan feedback</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenUpdateModal(pengaduan.id)}
                      className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Tanggapi
                    </Button>
                  </div>
                </div>
              ))
            )}

            {filteredData.length > 8 && (
              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  Dan {filteredData.length - 8} pengaduan lainnya...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Update Modal */}
      <UpdateModal
        pengaduanId={selectedPengaduanId}
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </>
  );
} 