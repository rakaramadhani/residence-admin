'use client';

import { EmergencyTestButton } from '@/components/emergency/EmergencyTestButton';
import {
  ExclamationTriangleIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [emergencyToDelete, setEmergencyToDelete] = useState<{ id: string; username: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState<string>('');
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

  useEffect(() => {
    fetchEmergency();
  }, []);

  useEffect(() => {
    filterEmergency();
  }, [emergency, searchTerm, kategoriFilter, tanggalFilter]);

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

  const filterEmergency = () => {
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
    if (kategoriFilter) {
      filtered = filtered.filter(item => item.kategori === kategoriFilter);
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
  const handleUpdateEmergency = async (id: string, data: { kategori: string; detail_kejadian: string }) => {
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

  // Fungsi untuk handle delete emergency
  const handleDelete = async (id: string, username: string) => {
    setEmergencyToDelete({ id, username });
    setIsDeleteConfirmOpen(true);
  };

  // Fungsi untuk konfirmasi delete
  const confirmDelete = async () => {
    if (!emergencyToDelete) return;
    
    setDeleteLoading(true);
    try {
      await deleteEmergency(emergencyToDelete.id);
      await fetchEmergency(); // Refresh data
      setIsDeleteConfirmOpen(false);
      setEmergencyToDelete(null);
    } catch (error) {
      console.error('Error deleting emergency:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fungsi untuk membatalkan delete
  const cancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setEmergencyToDelete(null);
  };

  // Fungsi untuk menutup modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmergency(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Kejadian Darurat</h1>
          <p className="mt-2 text-gray-600">Monitor dan kelola laporan kejadian darurat dari penghuni</p>
        </div>
        <div>
          <EmergencyTestButton />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Kejadian
            </label>
            <input
              type="text"
              placeholder="Username, email, kategori, detail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Semua Kategori</option>
              {kategoriOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal
            </label>
            <input
              type="date"
              value={tanggalFilter}
              onChange={(e) => setTanggalFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setKategoriFilter('');
                setTanggalFilter('');
              }}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-hidden bg-white shadow">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold">Daftar Kejadian Darurat</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Pelapor
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Detail Kejadian
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Lokasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.user?.username || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.user?.email || 'N/A'}
                          </div>
                          {item.user?.phone && (
                            <div className="text-sm text-gray-500">
                              {item.user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getKategoriIcon(item.kategori)}
                        <span className={`ml-2 ${getKategoriBadge(item.kategori)}`}>
                          {item.kategori || 'Tidak Dikategorikan'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {item.detail_kejadian || 'Tidak ada detail'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openMapLocation(item.latitude, item.longitude)}
                        className="text-red-600 hover:text-red-900 bg-red-100 px-3 py-1 rounded-md flex items-center"
                        title="Buka Lokasi"
                      >
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        Lihat Maps
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-100 px-3 py-1 rounded-md flex items-center"
                          title="Edit Kejadian"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Catatan
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.user?.username || 'Unknown')}
                          className="text-red-600 hover:text-red-900 bg-red-100 px-3 py-1 rounded-md flex items-center"
                          title="Hapus Kejadian"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Hapus
                        </button>
                      </div>
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
              Showing {currentData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredEmergency.length)} of {filteredEmergency.length} entries
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

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        emergency={selectedEmergency}
        onSave={handleUpdateEmergency}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Konfirmasi Hapus Kejadian Darurat
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Apakah Anda yakin ingin menghapus kejadian darurat dari{' '}
                      <span className="font-medium text-gray-900">{emergencyToDelete?.username}</span>?
                      Tindakan ini tidak dapat dibatalkan.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {deleteLoading ? 'Menghapus...' : 'Hapus'}
                </button>
                <button
                  onClick={cancelDelete}
                  disabled={deleteLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
