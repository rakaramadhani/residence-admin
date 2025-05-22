"use client";
import { useState, useEffect } from "react";
import { fetchAllSurat, fetchDetailSurat } from "./fetcher";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Calendar, ChevronDown, ChevronUp, Filter } from "lucide-react";
import SuratModal from "./modal-surat";
import { format } from "date-fns";
import { id } from "date-fns/locale";

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
  };
}

export default function SuratPage() {
  const [surat, setSurat] = useState<Surat[]>([]);
  const [filteredSurat, setFilteredSurat] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState<Surat | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<"all" | "requested" | "approved" | "rejected">("all");
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [monthFilter, setMonthFilter] = useState<number | "all">("all");
  
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

  useEffect(() => {
    loadSurat();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, yearFilter, monthFilter, surat, sortDirection]);

  const loadSurat = async () => {
    setLoading(true);
    try {
      const response = await fetchAllSurat();
      if (response.data) {
        setSurat(response.data);
        setFilteredSurat(response.data);
        sortSurat(response.data);
      }
    } catch (error) {
      console.error("Error loading surat:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
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
    
    // Terapkan pengurutan
    sortSurat(filtered);
  };

  const sortSurat = (data: Surat[] = []) => {
    const sorted = [...data].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    });
    setFilteredSurat(sorted);
  };

  const toggleSortDirection = () => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
  };
  
  const resetFilters = () => {
    setStatusFilter("all");
    setYearFilter("all");
    setMonthFilter("all");
    setSearchTerm("");
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pengelolaan Surat Perizinan</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Cari surat..."
              className="w-64 pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-4 items-center mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">Filter:</span>
        </div>
        
        <div className="flex gap-2 items-center">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "requested" | "approved" | "rejected")}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="all">Semua Status</option>
            <option value="requested">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
          
          <select 
            value={String(monthFilter)}
            onChange={(e) => setMonthFilter(e.target.value === "all" ? "all" : parseInt(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="all">Semua Bulan</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          
          <select
            value={String(yearFilter)}
            onChange={(e) => setYearFilter(e.target.value === "all" ? "all" : parseInt(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="all">Semua Tahun</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="text-xs h-7"
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="text-center p-8">
            <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-500">Memuat data...</p>
          </div>
        ) : filteredSurat.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-semibold">Tidak ada surat ditemukan</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all" || yearFilter !== "all" || monthFilter !== "all"
                ? "Tidak ada hasil yang ditemukan untuk filter yang Anda pilih"
                : "Belum ada permohonan surat yang diajukan"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pemohon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fasilitas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Penggunaan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Pengajuan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSurat.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center">
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
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{item.fasilitas}</div>
                      <div className="text-sm text-gray-500">{item.keperluan}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.tanggalMulai)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          item.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : item.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {item.status === "approved"
                          ? "Disetujui"
                          : item.status === "rejected"
                          ? "Ditolak"
                          : "Menunggu"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        onClick={() => handleViewDetail(item.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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