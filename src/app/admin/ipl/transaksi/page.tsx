"use client";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { fetchAllTransaksi, Transaksi } from "./fetcher";
import TransaksiModal from "./modal-transaksi";

export default function TransaksiPage() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [filteredTransaksi, setFilteredTransaksi] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransaksiId, setSelectedTransaksiId] = useState<string | null>(null);
  
  // Filter states
  const [bulanFilter, setBulanFilter] = useState<string>("semua");
  const [tahunFilter, setTahunFilter] = useState<string>("semua");
  const [metodeFilter, setMetodeFilter] = useState<string>("semua");
  const [statusFilter, setStatusFilter] = useState<string>("semua");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Daftar bulan
  const months = [
    { value: "semua", label: "Semua Bulan" },
    { value: "0", label: "Januari" },
    { value: "1", label: "Februari" },
    { value: "2", label: "Maret" },
    { value: "3", label: "April" },
    { value: "4", label: "Mei" },
    { value: "5", label: "Juni" },
    { value: "6", label: "Juli" },
    { value: "7", label: "Agustus" },
    { value: "8", label: "September" },
    { value: "9", label: "Oktober" },
    { value: "10", label: "November" },
    { value: "11", label: "Desember" }
  ];
  
  // Dapatkan tahun saat ini dan 5 tahun ke belakang untuk dropdown
  const currentYear = new Date().getFullYear();
  const years = [
    { value: "semua", label: "Semua Tahun" },
    ...Array.from({ length: 6 }, (_, i) => ({
      value: (currentYear - i).toString(),
      label: (currentYear - i).toString()
    }))
  ];

  useEffect(() => {
    loadTransaksi();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...transaksi];
    
    // Filter berdasarkan pencarian
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        return (
          (item.order.user.username || "").toLowerCase().includes(lowercasedSearch) ||
          item.order.user.email.toLowerCase().includes(lowercasedSearch) ||
          item.id.toLowerCase().includes(lowercasedSearch)
        );
      });
    }
    
    // Filter berdasarkan bulan
    if (bulanFilter !== "semua") {
      filtered = filtered.filter((item) => {
        const date = new Date(item.transactionTime);
        return date.getMonth().toString() === bulanFilter;
      });
    }
    
    // Filter berdasarkan tahun
    if (tahunFilter !== "semua") {
      filtered = filtered.filter((item) => {
        const date = new Date(item.transactionTime);
        return date.getFullYear().toString() === tahunFilter;
      });
    }
    
    // Filter berdasarkan metode pembayaran
    if (metodeFilter !== "semua") {
      filtered = filtered.filter((item) => item.paymentType === metodeFilter);
    }
    
    // Filter berdasarkan status
    if (statusFilter !== "semua") {
      filtered = filtered.filter((item) => item.transactionStatus === statusFilter);
    }
    
    setFilteredTransaksi(filtered);
    setCurrentPage(1); // Reset ke halaman pertama setelah filter
  }, [searchTerm, bulanFilter, tahunFilter, metodeFilter, statusFilter, transaksi]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadTransaksi = async () => {
    setLoading(true);
    try {
      const response = await fetchAllTransaksi();
      if (response.data) {
        setTransaksi(response.data);
      }
    } catch (error) {
      console.error("Error loading transaksi:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(parseInt(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "settlement":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancel":
      case "deny":
      case "expire":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetail = (transaksiId: string) => {
    setSelectedTransaksiId(transaksiId);
    setModalOpen(true);
  };

  const getMonthName = (dateString: string) => {
    const date = new Date(dateString);
    return months.find(month => month.value === date.getMonth().toString())?.label || "";
  };

  const getAvatarColor = (username: string) => {
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", 
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-gray-500"
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredTransaksi.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransaksi = filteredTransaksi.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Riwayat Transaksi IPL</h1>
          <p className="text-muted-foreground">Kelola dan monitor transaksi pembayaran IPL</p>
        </div>
      </div>
      
      {/* Filter dan Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          {/* Search Input - Takes remaining space on desktop */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
              <Input
                placeholder="Cari pengguna..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Filters Row - Flex on desktop, stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            {/* Bulan Filter */}
            <div className="w-full sm:w-auto">
              <Select value={bulanFilter} onValueChange={(value) => setBulanFilter(value)}>
                <SelectTrigger className="px-3 py-3 w-full sm:w-auto min-w-[120px]">
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Tahun Filter */}
            <div className="w-full sm:w-auto">
              <Select value={tahunFilter} onValueChange={(value) => setTahunFilter(value)}>
                <SelectTrigger className="px-3 py-3 w-full sm:w-auto min-w-[100px]">
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Metode Pembayaran Filter */}
            <div className="w-full sm:w-auto">
              <Select value={metodeFilter} onValueChange={(value) => setMetodeFilter(value)}>
                <SelectTrigger className="px-3 py-3 w-full sm:w-auto min-w-[140px]">
                  <SelectValue placeholder="Pilih metode pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Metode</SelectItem>
                  <SelectItem value="gopay">Gopay</SelectItem>
                  <SelectItem value="dana">Dana</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Status Filter */}
            <div className="w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                <SelectTrigger className="px-3 py-3 w-full sm:w-auto min-w-[120px]">
                  <SelectValue placeholder="Pilih status transaksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Status</SelectItem>
                  <SelectItem value="settlement">Settlement</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancel">Cancel</SelectItem>
                  <SelectItem value="deny">Deny</SelectItem>
                  <SelectItem value="expire">Expire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="border rounded-[16px] overflow-hidden bg-white shadow">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2 text-sm text-gray-500">Memuat data...</p>
          </div>
        ) : currentTransaksi.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada transaksi ditemukan</h3>
            <p className="mt-1 text-sm text-gray-500">Belum ada data transaksi yang sesuai dengan filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#263186]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Pengguna</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Waktu Transaksi</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Metode Pembayaran</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Nominal</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Bulan</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Status Transaksi</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTransaksi.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 ${getAvatarColor(item.order.user.username)} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                          {(item.order.user.username?.[0] || item.order.user.email[0]).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.order.user.username || item.order.user.email.split("@")[0]}
                          </div>
                          <div className="text-sm text-gray-500">{item.order.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.transactionTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {item.paymentType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(item.grossAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getMonthName(item.transactionTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.transactionStatus)}`}>
                        {item.transactionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(item.id)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && filteredTransaksi.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredTransaksi.length)} of {filteredTransaksi.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                    onClick={() => setCurrentPage(pageToShow)}
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
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail Transaksi */}
      <TransaksiModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        transaksiId={selectedTransaksiId}
      />
    </div>
  );
}
