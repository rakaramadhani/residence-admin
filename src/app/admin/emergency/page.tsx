'use client';

// import { EmergencyTestButton } from '@/components/emergency/EmergencyTestButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ExclamationTriangleIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import EmergencyModal from './emergency-modal';
import { deleteEmergency, Emergency, getEmergency, updateEmergency } from './fetcher';

export default function EmergencyPage() {
  const [emergency, setEmergency] = useState<Emergency[]>([]);
  const [filteredEmergency, setFilteredEmergency] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [tanggalFilter, setTanggalFilter] = useState<string>('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const kategoriOptions = [
    'Kebakaran',
    'Kecelakaan',
    'Kesehatan',
    'Keamanan',
    'Bencana Alam',
    'Lainnya'
  ];

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
    fetchEmergency();
  }, []);

  const filterEmergency = useCallback(() => {
    let filtered = [...emergency];

    // Filter by search term (username, email, kategori, detail)
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const username = item.user?.username?.toLowerCase() || '';
        const email = item.user?.email?.toLowerCase() || '';
        const kategori = item.kategori?.toLowerCase() || '';
        const detail = item.detail_kejadian?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        
        return username.includes(searchLower) || 
               email.includes(searchLower) || 
               kategori.includes(searchLower) || 
               detail.includes(searchLower);
      });
    }

    // Filter by kategori
    if (kategoriFilter && kategoriFilter !== 'all') {
      filtered = filtered.filter(item => item.kategori === kategoriFilter);
    }

    // Filter by status
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(item => (item.status || 'pending') === statusFilter);
    }

    // Filter by tanggal
    if (tanggalFilter) {
      filtered = filtered.filter(item => {
        const emergencyDate = new Date(item.created_at).toISOString().split('T')[0];
        return emergencyDate === tanggalFilter;
      });
    }

    setFilteredEmergency(filtered);
    setCurrentPage(1);
  }, [emergency, searchTerm, kategoriFilter, statusFilter, tanggalFilter]);

  useEffect(() => {
    filterEmergency();
  }, [filterEmergency]);

  const fetchEmergency = async () => {
    setLoading(true);
    try {
      const data = await getEmergency();
      console.log('Data emergency received:', data); // Debug log
      
      // Validate data structure
      if (Array.isArray(data)) {
        // Filter out invalid data dan tambahkan default values
        const validData = data.filter(item => item && item.id).map(item => ({
          ...item,
          user: item.user || { 
            id: 'unknown', 
            username: 'Data tidak lengkap', 
            email: 'N/A', 
            phone: null,
            role: 'unknown',
            cluster: null,
            nomor_rumah: null,
            rt: null,
            rw: null
          }
        }));
        setEmergency(validData);
      } else {
        console.error('Data emergency bukan array:', data);
        setError('Format data kejadian darurat tidak valid');
        setEmergency([]);
      }
    } catch (err) {
      console.error('Error detail:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data kejadian darurat';
      setError(errorMessage);
      setEmergency([]);
    } finally {
      setLoading(false);
    }
  };

  const getKategoriIcon = (kategori: string | null) => {
    const iconClass = "h-5 w-5";
    switch (kategori) {
      case 'Kebakaran':
        return <ExclamationTriangleIcon className={`${iconClass} text-red-600`} />;
      case 'Kecelakaan':
        return <ExclamationTriangleIcon className={`${iconClass} text-orange-600`} />;
      case 'Kesehatan':
        return <ExclamationTriangleIcon className={`${iconClass} text-blue-600`} />;
      case 'Keamanan':
        return <ExclamationTriangleIcon className={`${iconClass} text-purple-600`} />;
      case 'Bencana Alam':
        return <ExclamationTriangleIcon className={`${iconClass} text-yellow-600`} />;
      default:
        return <ExclamationTriangleIcon className={`${iconClass} text-gray-600`} />;
    }
  };

  const getKategoriBadge = (kategori: string | null) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (kategori) {
      case 'Kebakaran':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'Kecelakaan':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'Kesehatan':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Keamanan':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'Bencana Alam':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'ditindaklanjuti':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'selesai':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case 'ditindaklanjuti':
        return 'Ditindaklanjuti';
      case 'selesai':
        return 'Selesai';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openMapLocation = (latitude: number, longitude: number) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredEmergency.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredEmergency.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Fungsi untuk handle edit emergency
  const handleEdit = (emergency: Emergency) => {
    setSelectedEmergency(emergency);
    setIsModalOpen(true);
  };

  // Fungsi untuk handle update emergency
  const handleUpdateEmergency = async (id: string, data: { kategori: string; detail_kejadian: string; status?: string }) => {
    try {
      await updateEmergency(id, data);
      await fetchEmergency(); // Refresh data
      setIsModalOpen(false);
      setSelectedEmergency(null);
    } catch (error) {
      console.error('Error updating emergency:', error);
      alert('Gagal mengupdate kejadian darurat');
    }
  };

  // Fungsi untuk handle delete emergency dengan SweetAlert2
  const handleDelete = async (id: string, username: string) => {
    const result = await Swal.fire({
      title: 'Konfirmasi Hapus',
      html: `Apakah Anda yakin ingin menghapus kejadian darurat dari <br><strong>${username}</strong>?`,
      text: 'Tindakan ini tidak dapat dibatalkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-lg px-6 py-2 text-sm font-medium',
        cancelButton: 'rounded-lg px-6 py-2 text-sm font-medium'
      }
    });

    if (result.isConfirmed) {
      try {
        // Show loading
        Swal.fire({
          title: 'Menghapus...',
          text: 'Sedang menghapus kejadian darurat',
          icon: 'info',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        await deleteEmergency(id);
        await fetchEmergency(); // Refresh data

        // Success message
        Swal.fire({
          title: 'Berhasil!',
          text: 'Kejadian darurat berhasil dihapus.',
          icon: 'success',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-lg px-6 py-2 text-sm font-medium'
          }
        });
      } catch (error) {
        console.error('Error deleting emergency:', error);
        Swal.fire({
          title: 'Gagal!',
          text: 'Terjadi kesalahan saat menghapus kejadian darurat.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-lg px-6 py-2 text-sm font-medium'
          }
        });
      }
    }
  };

  // Fungsi untuk menutup modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmergency(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pengelola Kejadian Darurat</h1>
          <p className="mt-2 text-gray-600">Monitor dan kelola laporan kejadian darurat dari penghuni</p>
        </div>
        {/* <div>
          <EmergencyTestButton />
        </div> */}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          {/* Search Input - Takes remaining space on desktop */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
              <Input
                placeholder="Cari kejadian darurat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Filters Row - Flex on desktop, stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            {/* Kategori Filter */}
            <div className="w-full sm:w-auto">
              <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
                <SelectTrigger className="px-3 py-3 w-full sm:w-auto min-w-[120px]">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {kategoriOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="px-3 py-3 w-full sm:w-auto min-w-[120px]">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="ditindaklanjuti">Ditindaklanjuti</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
             
            {/* Tanggal Filter */}
            <div className="w-full sm:w-auto">
              <Input
                type="date"
                value={tanggalFilter}
                onChange={(e) => setTanggalFilter(e.target.value)}
                className="px-3 py-3 w-full sm:w-auto min-w-[140px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Reset Button */}
            <div className="w-full sm:w-auto">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setKategoriFilter('all');
                  setStatusFilter('pending');
                  setTanggalFilter('');
                }}
                className="w-full sm:w-auto px-3 py-3 bg-[#455AF5] text-white hover:bg-[#455AF5]/90 border-[#455AF5] transition-colors"
              >
                <span className="hidden sm:inline">Reset Filter</span>
                <span className="sm:hidden">Reset</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Table - Optimized */}
      <div className="border rounded-[16px] overflow-hidden bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#263186]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Pelapor
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Kategori
                </th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Detail & Waktu
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data kejadian darurat</h3>
                    <p className="mt-1 text-sm text-gray-500">Belum ada laporan kejadian darurat yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {/* Pelapor */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 ${getAvatarColor(item.user?.username || 'U')} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                          {(item.user?.username?.[0] || item.user?.email?.[0] || 'U').toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.user?.username || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.user?.cluster ? `Cluster ${item.user.cluster}` + ' No. ' + `${item.user.nomor_rumah}` : 'N/A'}
                          </div>
                          {item.user?.phone && (
                            <div className="text-sm text-gray-500">
                              {item.user.phone}
                            </div>
                          )}
                          {/* Show kategori and status on mobile */}
                          <div className="md:hidden mt-1 flex flex-wrap gap-1">
                            <span className={`${getKategoriBadge(item.kategori)} text-xs px-1 py-0.5`}>
                              {item.kategori || 'N/A'}
                            </span>
                            <span className={`${getStatusBadge(item.status)} text-xs px-1 py-0.5`}>
                              {getStatusText(item.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Kategori - Desktop only */}
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {getKategoriIcon(item.kategori)}
                        <span className={`${getKategoriBadge(item.kategori)} text-xs px-2 py-1`}>
                          {item.kategori ? item.kategori.substring(0, 8) + (item.kategori.length > 8 ? '...' : '') : 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Status - Large screens only */}
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                      <span className={`${getStatusBadge(item.status)} text-xs px-2 py-1`}>
                        {getStatusText(item.status).substring(0, 10)}
                      </span>
                    </td>

                    {/* Detail & Waktu - Combined */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900 line-clamp-2">
                          {item.detail_kejadian ? 
                            (item.detail_kejadian.length > 60 ? 
                              item.detail_kejadian.substring(0, 60) + '...' : 
                              item.detail_kejadian
                            ) : 'Tidak ada detail'
                          }
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </td>

                    

                    {/* Aksi */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1">
                      <button
                        onClick={() => openMapLocation(item.latitude, item.longitude)}
                        className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-red-300 bg-white text-red-600 hover:bg-red-50"
                        title="Buka Lokasi"
                      >
                        <MapPinIcon className="h-4 w-4" />
                      </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-blue-300 bg-white text-blue-600 hover:bg-blue-50"
                          title="Edit Kejadian"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.user?.username || 'Unknown')}
                          className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-red-300 bg-white text-red-600 hover:bg-red-50"
                          title="Hapus Kejadian"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                        {/* Show map button on smaller screens */}
                        <button
                          onClick={() => openMapLocation(item.latitude, item.longitude)}
                          className="lg:hidden h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-red-300 bg-white text-red-600 hover:bg-red-50"
                          title="Buka Lokasi"
                        >
                          <MapPinIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Responsive */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 gap-3">
            <div className="text-sm text-gray-500 order-2 sm:order-1">
              Showing {currentData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredEmergency.length)} of {filteredEmergency.length} entries
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
      </div>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        emergency={selectedEmergency}
        onSave={handleUpdateEmergency}
      />
    </div>
  );
}
