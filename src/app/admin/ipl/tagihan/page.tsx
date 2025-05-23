'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  EyeIcon, 
  ChevronLeftIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline';
import { Tagihan, getTagihan } from './fetcher';
import ModalBuatTagihan from './modal-buat-tagihan';
import ModalDetailTagihan from './modal-detail';

export default function TagihanPage() {
  const [tagihan, setTagihan] = useState<Tagihan[]>([]);
  const [filteredTagihan, setFilteredTagihan] = useState<Tagihan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalBuatOpen, setIsModalBuatOpen] = useState(false);
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState<Tagihan | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'lunas' | 'belumLunas'>('all');
  const [bulanFilter, setBulanFilter] = useState<number | ''>('');
  const [tahunFilter, setTahunFilter] = useState<number | ''>(new Date().getFullYear());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const bulanOptions = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  useEffect(() => {
    fetchTagihan();
  }, []);

  useEffect(() => {
    filterTagihan();
  }, [tagihan, searchTerm, statusFilter, bulanFilter, tahunFilter]);

  const fetchTagihan = async () => {
    setLoading(true);
    try {
      const data = await getTagihan();
      console.log('Data tagihan received:', data); // Debug log
      
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
        setTagihan(validData);
      } else {
        console.error('Data tagihan bukan array:', data);
        setError('Format data tagihan tidak valid');
        setTagihan([]);
      }
    } catch (err) {
      console.error('Error detail:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data tagihan';
      setError(errorMessage);
      setTagihan([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTagihan = () => {
    let filtered = [...tagihan];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => {
        // Add null checking untuk mencegah error
        const nama = item.user?.username?.toLowerCase() || '';
        const email = item.user?.email?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        
        return nama.includes(searchLower) || email.includes(searchLower);
      });
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status_bayar === statusFilter);
    }

    // Filter by bulan
    if (bulanFilter) {
      filtered = filtered.filter(item => item.bulan === Number(bulanFilter));
    }

    // Filter by tahun
    if (tahunFilter) {
      filtered = filtered.filter(item => item.tahun === Number(tahunFilter));
    }

    setFilteredTagihan(filtered);
    setCurrentPage(1);
  };

  const handleModalBuatSuccess = () => {
    fetchTagihan();
  };

  const handleModalDetailUpdate = () => {
    fetchTagihan();
  };

  const handleDetailView = (item: Tagihan) => {
    setSelectedTagihan(item);
    setIsModalDetailOpen(true);
  };

  const getBulanNama = (bulan: number) => {
    const bulanObj = bulanOptions.find(b => b.value === bulan);
    return bulanObj ? bulanObj.label : bulan.toString();
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    if (status === 'lunas') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredTagihan.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredTagihan.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Tagihan IPL</h1>
          <p className="mt-2 text-gray-600">Kelola tagihan iuran pengelolaan lingkungan</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Pengguna
              </label>
              <input
                type="text"
                placeholder="Nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'lunas' | 'belumLunas')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="lunas">Lunas</option>
                <option value="belumLunas">Belum Lunas</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bulan
              </label>
              <select
                value={bulanFilter}
                onChange={(e) => setBulanFilter(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua Bulan</option>
                {bulanOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tahun
              </label>
              <input
                type="number"
                placeholder="2024"
                value={tahunFilter}
                onChange={(e) => setTahunFilter(e.target.value ? Number(e.target.value) : '')}
                min="2020"
                max="2030"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setIsModalBuatOpen(true)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Buat Tagihan
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
                    Pengguna
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alamat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Periode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nominal
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
                {currentData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.user?.username || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.user?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.user?.cluster ? item.user?.cluster + ' ' + item.user?.nomor_rumah : 'Belum Diisikan'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getBulanNama(item.bulan)} {item.tahun}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rp {item.nominal.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(item.status_bayar)}>  
                        {item.status_bayar === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDetailView(item)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Lihat Detail"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTagihan.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada data tagihan ditemukan</p>
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
                      {Math.min(endIndex, filteredTagihan.length)}
                    </span>{' '}
                    dari <span className="font-medium">{filteredTagihan.length}</span> hasil
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
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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

      {/* Modal Buat Tagihan */}
      <ModalBuatTagihan
        isOpen={isModalBuatOpen}
        onClose={() => setIsModalBuatOpen(false)}
        onSuccess={handleModalBuatSuccess}
      />

      {/* Modal Detail Tagihan */}
      <ModalDetailTagihan
        isOpen={isModalDetailOpen}
        onClose={() => setIsModalDetailOpen(false)}
        tagihan={selectedTagihan}
        onUpdate={handleModalDetailUpdate}
      />
    </div>
  );
}