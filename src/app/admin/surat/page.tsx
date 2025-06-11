"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Eye, Search } from "lucide-react";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    loadSurat();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, yearFilter, monthFilter, surat]);

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
    
    // Urutkan berdasarkan tanggal terbaru
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFilteredSurat(filtered);
    setCurrentPage(1);
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

  const columns = [
    {
      key: "user",
      header: "Pemohon",
      render: (item: Surat) => (
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
      )
    },
    {
      key: "fasilitas",
      header: "Fasilitas",
      render: (item: Surat) => (
        <div>
          <div className="text-sm text-gray-900">{item.fasilitas}</div>
          <div className="text-sm text-gray-500">{item.keperluan}</div>
        </div>
      )
    },
    {
      key: "tanggalMulai",
      header: "Tanggal Penggunaan",
      render: (item: Surat) => (
        <span className="text-sm text-gray-500">
          {formatDate(item.tanggalMulai)}
        </span>
      )
    },
    {
      key: "createdAt",
      header: "Tanggal Pengajuan",
      render: (item: Surat) => (
        <span className="text-sm text-gray-500">
          {formatDate(item.createdAt)}
        </span>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (item: Surat) => (
        <StatusBadge 
          status={getStatusText(item.status)}
          variant={getStatusVariant(item.status)}
        />
      )
    },
    {
      key: "actions",
      header: "Aksi",
      render: (item: Surat) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetail(item.id)}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

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
        <div className="flex gap-6 items-center w-full">
          {/* Search Input - Takes remaining space */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari surat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 px-3 py-3 w-full"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="w-40">
            <Select onValueChange={(value) => setStatusFilter(value as "all" | "requested" | "approved" | "rejected")} defaultValue="all">
              <SelectTrigger className="px-3 py-3">
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
          <div className="w-36">
            <Select onValueChange={(value) => setMonthFilter(value === "all" ? "all" : Number(value))} defaultValue="all">
              <SelectTrigger className="px-3 py-3">
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
          <div className="w-24">
            <Select onValueChange={(value) => setYearFilter(value === "all" ? "all" : Number(value))} defaultValue="all">
              <SelectTrigger className="px-3 py-3">
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
          <div className="w-20">
            <Button variant="outline" onClick={resetFilters} className="w-full px-3 py-3 bg-[#455AF5] text-white hover:bg-[#455AF5]/90 border-[#455AF5]">
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable<Surat>
        data={currentData}
        columns={columns}
        loading={loading}
        emptyMessage={
          searchTerm || statusFilter !== "all" || yearFilter !== "all" || monthFilter !== "all"
            ? "Tidak ada hasil yang ditemukan untuk filter yang Anda pilih"
            : "Belum ada permohonan surat yang diajukan"
        }
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredSurat.length,
          itemsPerPage,
          onPageChange: handlePageChange
        }}
      />

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