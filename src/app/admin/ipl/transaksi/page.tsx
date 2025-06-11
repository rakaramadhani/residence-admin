"use client";
import { Eye, Search } from "lucide-react";
import { useEffect, useState } from "react";
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
    { value: "semua", label: "Semua" },
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
    { value: "semua", label: "Semua" },
    ...Array.from({ length: 6 }, (_, i) => ({
      value: (currentYear - i).toString(),
      label: (currentYear - i).toString()
    }))
  ];

  useEffect(() => {
    loadTransaksi();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, bulanFilter, tahunFilter, metodeFilter, statusFilter, transaksi]);

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
  
  const applyFilters = () => {
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Transaksi</h1>
      
      {/* Filter dan Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex gap-6 items-center w-full">
          {/* Search Input - Takes remaining space */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari pengguna..."
                className="pl-10 w-full px-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Bulan Filter */}
          <div className="w-36">
            <select
              value={bulanFilter}
              onChange={(e) => setBulanFilter(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Tahun Filter */}
          <div className="w-24">
            <select
              value={tahunFilter}
              onChange={(e) => setTahunFilter(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {years.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Metode Pembayaran Filter */}
          <div className="w-40">
            <select
              value={metodeFilter}
              onChange={(e) => setMetodeFilter(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="semua">Semua Metode</option>
              <option value="gopay">Gopay</option>
              <option value="dana">Dana</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
            </select>
          </div>
          
          {/* Status Filter */}
          <div className="w-36">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="semua">Semua Status</option>
              <option value="settlement">Settlement</option>
              <option value="pending">Pending</option>
              <option value="cancel">Cancel</option>
              <option value="deny">Deny</option>
              <option value="expire">Expire</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center p-8">
            <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full mx-auto" />
            <p className="mt-2 text-gray-500">Memuat data...</p>
          </div>
        ) : currentTransaksi.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Tidak ada transaksi ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium">Pengguna</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Waktu Transaksi</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Metode Pembayaran</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Nominal</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Bulan</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Status Transaksi</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Action</th>
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
        {!loading && filteredTransaksi.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredTransaksi.length)} of {filteredTransaksi.length} entries
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
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
