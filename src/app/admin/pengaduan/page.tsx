"use client"


import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@supabase/supabase-js"
import { Clock, Edit, ImageIcon, MessageCircle, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchPengaduan } from "./fetcher"
import UpdateModal from "./update-modal"

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
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Avatar color function for consistency
  const getAvatarColor = (username: string) => {
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", 
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-gray-500"
    ];
    const index = (username || "U").charCodeAt(0) % colors.length;
    return colors[index];
  };

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

  // Reset currentPage when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, kategoriFilter, statusFilter]);

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

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Pengaduan Penghuni</h1>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          {/* Search Input - Takes remaining space on desktop */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
              <Input
                placeholder="Cari pengaduan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Filters Row - Flex on desktop, stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            {/* Kategori Filter */}
            <div className="w-full sm:w-auto">
              <Select onValueChange={setKategoriFilter} defaultValue="Semua">
                <SelectTrigger className="px-3 py-3 w-full sm:w-auto min-w-[120px]">
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
            
            {/* Status Filter */}
            <div className="w-full sm:w-auto">
              <Select onValueChange={setStatusFilter} defaultValue="Semua">
                <SelectTrigger className="px-3 py-3 w-full sm:w-auto min-w-[120px]">
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
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-[16px] overflow-hidden bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#263186]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Pengguna
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Keterangan
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Waktu
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">Memuat data...</p>
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada pengaduan yang sesuai dengan filter</h3>
                    <p className="mt-1 text-sm text-gray-500">Belum ada data pengaduan yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                currentData.map((pengaduan) => (
                  <tr key={pengaduan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 ${getAvatarColor(pengaduan.user.username || pengaduan.user.email)} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                          {(pengaduan.user.username?.[0] || pengaduan.user.email[0]).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{pengaduan.user.username || pengaduan.user.email.split('@')[0]}</div>
                          <div className="text-sm text-gray-500">{pengaduan.user.cluster} {pengaduan.user.nomor_rumah}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <div className="w-full line-clamp-2 text-sm text-gray-900">{pengaduan.pengaduan}</div>
                        {pengaduan.foto && (
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Foto
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getKategoriColor(pengaduan.kategori)}`}>
                        {pengaduan.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pengaduan.status_pengaduan)}`}>
                        {formatStatus(pengaduan.status_pengaduan)}
                      </span>
                      {pengaduan.feedback && (
                        <div className="mt-1 flex items-center">
                          <MessageCircle className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">Dengan feedback</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-900">{getTimeElapsed(pengaduan.created_at)}</span>
                      </div>
                      <div className="text-xs text-gray-500">{formatDate(pengaduan.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleOpenUpdateModal(pengaduan.id)}
                        className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-blue-300 bg-white text-blue-600 hover:bg-blue-50"
                        title="Tanggapi"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 gap-3">
          <div className="text-sm text-gray-500 order-2 sm:order-1">
            Showing {currentData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex gap-2 order-1 sm:order-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>
            
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              let pageToShow = i + 1;
              
              if (totalPages > 3) {
                if (currentPage <= 2) {
                  pageToShow = i + 1;
                } else if (currentPage >= totalPages - 1) {
                  pageToShow = totalPages - 2 + i;
                } else {
                  pageToShow = currentPage - 1 + i;
                }
              }
              
              return (
                <button
                  key={i}
                  onClick={() => handlePageChange(pageToShow)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                    pageToShow === currentPage
                      ? 'z-10 bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageToShow}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
            </button>
          </div>
        </div>
      )}

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
