'use client';

import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline';
import { Emergency, getEmergency } from './fetcher';

export default function EmergencyPage() {
  const [emergency, setEmergency] = useState<Emergency[]>([]);
  const [filteredEmergency, setFilteredEmergency] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Kejadian Darurat</h1>
          <p className="mt-2 text-gray-600">Monitor dan kelola laporan kejadian darurat dari penghuni</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Kejadian</h3>
                <p className="text-2xl font-bold text-red-600">{emergency.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Hari Ini</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {emergency.filter(item => {
                    const today = new Date().toISOString().split('T')[0];
                    const emergencyDate = new Date(item.created_at).toISOString().split('T')[0];
                    return emergencyDate === today;
                  }).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Pengguna Aktif</h3>
                <p className="text-2xl font-bold text-green-600">
                  {new Set(emergency.map(item => item.userId)).size}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <MapPinIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Lokasi Berbeda</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(emergency.map(item => `${item.latitude},${item.longitude}`)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelapor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detail Kejadian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lokasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((item) => (
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
                        className="flex items-center text-blue-600 hover:text-blue-900"
                        title="Lihat di Maps"
                      >
                        <MapPinIcon className="h-5 w-5 mr-1" />
                        <div className="text-sm">
                          <div>{item.latitude.toFixed(6)}</div>
                          <div>{item.longitude.toFixed(6)}</div>
                        </div>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openMapLocation(item.latitude, item.longitude)}
                        className="text-red-600 hover:text-red-900 bg-red-100 px-3 py-1 rounded-md"
                        title="Buka Lokasi"
                      >
                        Lihat Maps
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEmergency.length === 0 && (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data kejadian darurat</h3>
              <p className="mt-1 text-sm text-gray-500">Belum ada laporan kejadian darurat yang ditemukan.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Selanjutnya
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Menampilkan{' '}
                    <span className="font-medium">{startIndex + 1}</span> sampai{' '}
                    <span className="font-medium">
                      {Math.min(endIndex, filteredEmergency.length)}
                    </span>{' '}
                    dari <span className="font-medium">{filteredEmergency.length}</span> hasil
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-red-50 border-red-500 text-red-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
