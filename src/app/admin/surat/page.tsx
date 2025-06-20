"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Search, Settings } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { fetchAllSurat, fetchDetailSurat, Surat } from "./fetcher";
import SuratModal from "./modal-surat";

export default function SuratPage() {
  const [surat, setSurat] = useState<Surat[]>([]);
  const [filteredSurat, setFilteredSurat] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState<Surat | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<"all" | "requested" | "approved" | "rejected">("all");
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [monthFilter, setMonthFilter] = useState<number | "all">("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Daftar bulan
  const months = [
    { value: 0, label: "Januari" },
    { value: 1, label: "Februari" },
    { value: 2, label: "Maret" },
    { value: 3, label: "April" },
    { value: 4, label: "Mei" },
    { value: 5, label: "Juni" },
    { value: 6, label: "Juli" },
    { value: 7, label: "Agustus" },
    { value: 8, label: "September" },
    { value: 9, label: "Oktober" },
    { value: 10, label: "November" },
    { value: 11, label: "Desember" }
  ];
  
  // Dapatkan tahun saat ini dan 5 tahun ke belakang untuk dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Avatar color function for consistency
  const getAvatarColor = (username: string) => {
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", 
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-gray-500"
    ];
    const index = (username || "U").charCodeAt(0) % colors.length;
    return colors[index];
  };

  useEffect(() => {
    loadSurat();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...surat];
    
    // Filter berdasarkan pencarian
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        return (
          (item.user.username || "").toLowerCase().includes(lowercasedSearch) ||
          item.user.email.toLowerCase().includes(lowercasedSearch) ||
          item.fasilitas.toLowerCase().includes(lowercasedSearch) ||
          item.keperluan.toLowerCase().includes(lowercasedSearch)
        );
      });
    }
    
    // Filter berdasarkan status
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }
    
    // Filter berdasarkan tahun
    if (yearFilter !== "all") {
      filtered = filtered.filter((item) => {
        const date = new Date(item.createdAt);
        return date.getFullYear() === yearFilter;
      });
    }
    
    // Filter berdasarkan bulan
    if (monthFilter !== "all") {
      filtered = filtered.filter((item) => {
        const date = new Date(item.createdAt);
        return date.getMonth() === monthFilter;
      });
    }
    
    // Urutkan berdasarkan tanggal terbaru
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFilteredSurat(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, yearFilter, monthFilter, surat]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadSurat = async () => {
    setLoading(true);
    try {
      const response = await fetchAllSurat();
      if (response.data) {
        setSurat(response.data);
      }
    } catch (error) {
      console.error("Error loading surat:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "d MMMM yyyy", { locale: id });
  };

  const handleViewDetail = async (suratId: string) => {
    try {
      const result = await fetchDetailSurat(suratId);
      if (result.data) {
        setSelectedSurat(result.data);
        setModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching surat detail:", error);
    }
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setYearFilter("all");
    setMonthFilter("all");
    setSearchTerm("");
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredSurat.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredSurat.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "warning";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Disetujui";
      case "rejected":
        return "Ditolak";
      default:
        return "Menunggu";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengelolaan Surat Perizinan</h1>
          <p className="text-muted-foreground">Kelola permohonan surat perizinan fasilitas</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          {/* Search Input - Takes remaining space on desktop */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
              <Input
                placeholder="Cari surat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Filters Row - Flex on desktop, stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            {/* Status Filter */}
            <div className="w-full sm:w-auto">
              <Select onValueChange={(value) => setStatusFilter(value as "all" | "requested" | "approved" | "rejected")} defaultValue="all">
                <SelectTrigger className="px-3 py-3 w-full sm:w-auto min-w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="requested">Menunggu</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Bulan Filter */}
            <div className="w-full sm:w-auto">
              <Select onValueChange={(value) => setMonthFilter(value === "all" ? "all" : Number(value))} defaultValue="all">
                <SelectTrigger className="px-3 py-3 w-full sm:w-auto min-w-[120px]">
                  <SelectValue placeholder="Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Tahun Filter */}
            <div className="w-full sm:w-auto">
              <Select onValueChange={(value) => setYearFilter(value === "all" ? "all" : Number(value))} defaultValue="all">
                <SelectTrigger className="px-3 py-3 w-full sm:w-auto min-w-[100px]">
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Reset Button */}
            <div className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={resetFilters} 
                className="w-full sm:w-auto px-4 py-3 bg-[#455AF5] text-white hover:bg-[#455AF5]/90 border-[#455AF5] transition-colors"
              >
                <span className="hidden sm:inline">Reset Filter</span>
                <span className="sm:hidden">Reset</span>
              </Button>
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
                  Pemohon
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Fasilitas
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Tanggal Penggunaan
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Tanggal Pengajuan
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Status
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
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {searchTerm || statusFilter !== "all" || yearFilter !== "all" || monthFilter !== "all"
                        ? "Tidak ada hasil yang ditemukan untuk filter yang Anda pilih"
                        : "Belum ada permohonan surat yang diajukan"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">Silakan coba dengan filter yang berbeda.</p>
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 ${getAvatarColor(item.user.username || item.user.email)} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                          {(item.user.username?.[0] || item.user.email[0]).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.user.username || item.user.email.split("@")[0]}
                          </div>
                          <div className="text-sm text-gray-500">{item.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{item.fasilitas}</div>
                        <div className="text-sm text-gray-500">{item.keperluan}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.tanggalMulai)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusVariant(item.status) === 'success' 
                          ? 'bg-green-100 text-green-800'
                          : getStatusVariant(item.status) === 'danger'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(item.id)}
                        className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                        title="Lihat Detail"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Showing {currentData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredSurat.length)} of {filteredSurat.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
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
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedSurat && (
        <SuratModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          surat={selectedSurat}
          onSuccess={loadSurat}
        />
      )}
    </div>
  );
}