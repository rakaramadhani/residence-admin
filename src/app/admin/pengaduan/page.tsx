"use client"

import { useEffect, useState } from "react"
import { fetchPengaduan } from "./fetcher"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Clock, Edit, Filter, Image, MessageCircle, Search } from "lucide-react"
import UpdateModal from "./update-modal"
import { createClient } from "@supabase/supabase-js"

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

const PengaduanPage = () => {
  const [pengaduanData, setPengaduanData] = useState<Pengaduan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  
  // State untuk modal update
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedPengaduanId, setSelectedPengaduanId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetchPengaduan();
      if (response && response.data) {
        setPengaduanData(response.data);
      }
    } catch (error) {
      console.error("Gagal memuat data pengaduan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Setup supabase realtime
    const channel = supabase.channel("all_changes")
      .on("broadcast", { event: "updated_pengaduan" }, (payload) => {
        console.log("Pengaduan updated:", payload);
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fungsi untuk membuka modal update
  const handleOpenUpdateModal = (id: string) => {
    setSelectedPengaduanId(id);
    setIsUpdateModalOpen(true);
  };

  // Fungsi untuk menutup modal update
  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedPengaduanId(null);
  };

  // Fungsi ketika update berhasil
  const handleUpdateSuccess = () => {
    loadData();
  };

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PengajuanBaru':
        return 'bg-blue-100 text-blue-800';
      case 'SedangDitinjau':
        return 'bg-orange-100 text-orange-800';
      case 'Disetujui':
        return 'bg-green-100 text-green-800';
      case 'Ditolak':
        return 'bg-red-100 text-red-800';
      case 'Selesai':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status text
  const formatStatus = (status: string) => {
    switch (status) {
      case 'PengajuanBaru':
        return 'Pengajuan Baru';
      case 'SedangDitinjau':
        return 'Sedang Ditinjau';
      default:
        return status;
    }
  };

  // Format kategori badge
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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get time elapsed
  const getTimeElapsed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Less than a day
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        // Less than an hour
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

  // Filter data
  const filteredData = pengaduanData.filter((item) => {
    // Filter pencarian
    if (searchQuery && !item.pengaduan.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.user.username?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.user.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter kategori
    if (kategoriFilter !== "Semua" && item.kategori !== kategoriFilter) {
      return false;
    }
    
    // Filter status
    if (statusFilter !== "Semua" && item.status_pengaduan !== statusFilter) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Pengaduan Warga</h1>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari pengaduan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Select onValueChange={setKategoriFilter} defaultValue="Semua">
                <SelectTrigger className="pl-8">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua Kategori</SelectItem>
                  <SelectItem value="Keamanan">Keamanan</SelectItem>
                  <SelectItem value="Infrastruktur">Infrastruktur</SelectItem>
                  <SelectItem value="Kebersihan">Kebersihan</SelectItem>
                  <SelectItem value="Pelayanan">Pelayanan</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative">
              <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Select onValueChange={setStatusFilter} defaultValue="Semua">
                <SelectTrigger className="pl-8">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua Status</SelectItem>
                  <SelectItem value="PengajuanBaru">Pengajuan Baru</SelectItem>
                  <SelectItem value="Ditangani">Sedang Ditangani</SelectItem>
                  <SelectItem value="Selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Memuat data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p>Tidak ada pengaduan yang sesuai dengan filter</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((pengaduan) => (
                  <TableRow key={pengaduan.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{pengaduan.user.username || pengaduan.user.email.split('@')[0]}</span>
                        <span className="text-xs text-gray-500">{pengaduan.user.cluster} {pengaduan.user.nomor_rumah}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <div className="w-full line-clamp-2">{pengaduan.pengaduan}</div>
                        {pengaduan.foto && (
                          <div className="flex-shrink-0">
                            <Badge variant="outline" className="h-5 w-5 flex items-center justify-center p-0">
                              <Image className="h-3 w-3" />
                            </Badge>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getKategoriColor(pengaduan.kategori)}>
                        {pengaduan.kategori}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(pengaduan.status_pengaduan)}>
                        {formatStatus(pengaduan.status_pengaduan)}
                      </Badge>
                      {pengaduan.feedback && (
                        <div className="mt-1 flex items-center">
                          <MessageCircle className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">Dengan feedback</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{getTimeElapsed(pengaduan.created_at)}</span>
                      </div>
                      <div className="text-xs text-gray-500">{formatDate(pengaduan.created_at)}</div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                        onClick={() => handleOpenUpdateModal(pengaduan.id)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Tanggapi
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {filteredData.length > 0 ? 1 : 0} to {filteredData.length} of {filteredData.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="outline" size="sm" className="bg-blue-600 text-white">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>

      {/* Modal Update Pengaduan */}
      <UpdateModal 
        pengaduanId={selectedPengaduanId}
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default PengaduanPage;
