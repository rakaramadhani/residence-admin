'use client';

import { Input } from '@/components/ui/input';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  EyeIcon,
  MegaphoneIcon,
  PlusIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { ActivityIcon, Search } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import ApprovalModal from './approval-modal';
import CreateModal from './create-modal';
import { Broadcast, getBroadcast } from './fetcher';
import ViewModal from './view-modal';

export default function BroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [filteredBroadcasts, setFilteredBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState<string>('');
  const [bulanFilter, setBulanFilter] = useState<string>('');
  const [tahunFilter, setTahunFilter] = useState<string>('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const kategoriOptions = [
    'Keamanan',
    'Infrastruktur', 
    'Kebersihan',
    'Pelayanan',
    'Kehilangan',
    'Kegiatan',
    'Promosi',
    'Lainnya'
  ];

  const bulanOptions = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];

  const tahunOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return year.toString();
  });

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  useEffect(() => {
    filterBroadcasts();
  }, [broadcasts, searchTerm, kategoriFilter, bulanFilter, tahunFilter, activeTab]);

  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const data = await getBroadcast();
      console.log('Data broadcast received:', data);
      
      if (Array.isArray(data)) {
        setBroadcasts(data);
      } else {
        console.error('Data broadcast bukan array:', data);
        setError('Format data broadcast tidak valid');
        setBroadcasts([]);
      }
    } catch (err) {
      console.error('Error detail:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data broadcast';
      setError(errorMessage);
      setBroadcasts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBroadcasts = () => {
    let filtered = [...broadcasts];

    // Filter berdasarkan tab aktif
    if (activeTab === 'active') {
      filtered = filtered.filter(item => item.status_broadcast === 'approved');
    } else {
      filtered = filtered.filter(item => 
        item.status_broadcast === 'verifying' || 
        item.status_broadcast === 'uploaded'
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const broadcast = item.broadcast?.toLowerCase() || '';
        const kategori = item.kategori?.toLowerCase() || '';
        const username = item.user?.username?.toLowerCase() || '';
        const email = item.user?.email?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        
        return broadcast.includes(searchLower) || 
               kategori.includes(searchLower) || 
               username.includes(searchLower) || 
               email.includes(searchLower);
      });
    }

    // Filter by kategori
    if (kategoriFilter) {
      filtered = filtered.filter(item => item.kategori === kategoriFilter);
    }

    // Filter by bulan
    if (bulanFilter) {
      filtered = filtered.filter(item => {
        const date = new Date(item.createdAt);
        return (date.getMonth() + 1).toString() === bulanFilter;
      });
    }

    // Filter by tahun
    if (tahunFilter) {
      filtered = filtered.filter(item => {
        const date = new Date(item.createdAt);
        return date.getFullYear().toString() === tahunFilter;
      });
    }

    setFilteredBroadcasts(filtered);
    setCurrentPage(1);
  };

  const getKategoriBadge = (kategori: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (kategori) {
      case 'Keamanan':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'Infrastruktur':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Kebersihan':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Pelayanan':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'Kehilangan':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'Kegiatan':
        return `${baseClasses} bg-indigo-100 text-indigo-800`;
      case 'Promosi':
        return `${baseClasses} bg-pink-100 text-pink-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'verifying':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'uploaded':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
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

  const handleApproval = (broadcast: Broadcast) => {
    setSelectedBroadcast(broadcast);
    setShowApprovalModal(true);
  };

  const handleView = (broadcast: Broadcast) => {
    setSelectedBroadcast(broadcast);
    setShowViewModal(true);
  };

  const refreshData = () => {
    fetchBroadcasts();
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredBroadcasts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredBroadcasts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Stats data
  const activeBroadcasts = broadcasts.filter(b => b.status_broadcast === 'approved').length;
  const pendingBroadcasts = broadcasts.filter(b => 
    b.status_broadcast === 'verifying' || b.status_broadcast === 'uploaded'
  ).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pengumuman</h1>
              <p className="mt-2 text-gray-600">Kelola pengumuman untuk penghuni</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Buat Pengumuman
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pengumuman Aktif ({activeBroadcasts})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pengumuman Tertunda ({pendingBroadcasts})
              </button>
            </nav>
          </div>
        </div>

              {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex gap-6 items-center w-full">
          {/* Search Input - Takes remaining space */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
              <Input
                placeholder="Cari pengumuman..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-3 w-full"
              />
            </div>
          </div>
          
          {/* Kategori Filter */}
          <div className="w-40">
            <select
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value)}
              className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Kategori</option>
              {kategoriOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          
          {/* Bulan Filter */}
          <div className="w-36">
            <select
              value={bulanFilter}
              onChange={(e) => setBulanFilter(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Bulan</option>
              {bulanOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tahun Filter */}
          <div className="w-24">
            <select
              value={tahunFilter}
              onChange={(e) => setTahunFilter(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Tahun</option>
              {tahunOptions.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          
          {/* Reset Button */}
          <div className="w-20">
            <button
              onClick={() => {
                setSearchTerm('');
                setKategoriFilter('');
                setBulanFilter('');
                setTahunFilter('');
              }}
              className="w-full px-3 py-3 bg-[#455AF5] text-white rounded-md hover:bg-[#455AF5]/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

        {/* Cards Grid - Dynamic layout based on active tab */}
        <div className={`${activeTab === 'active' 
          ? 'w-full mx-auto space-y-4' 
          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        }`}>
          {currentData.map((item) => (
            activeTab === 'active' ? (
              // Twitter-like Timeline Layout for Active Broadcasts
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                {/* Tweet-like Header */}
                <div className="p-4 pb-2">
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    
                    {/* User Info and Content */}
                    <div className="flex-1 min-w-0">
                      {/* User details and timestamp */}
                      <div className="flex items-center space-x-1 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {item.user?.username || 'Admin'}
                        </h3>
                        <span className="text-gray-500 text-sm">·</span>
                        <span className="text-gray-500 text-sm">
                          {new Date(item.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <div className="ml-auto flex space-x-2">
                          <span className={getKategoriBadge(item.kategori)}>
                            {item.kategori}
                          </span>
                          <span className={getStatusBadge(item.status_broadcast)}>
                            {item.status_broadcast}
                          </span>
                        </div>
                      </div>
                      
                      {/* Broadcast content */}
                      <div className="text-gray-900 text-base leading-relaxed mb-3">
                        {item.broadcast}
                      </div>
                      
                      {/* Event date if exists */}
                      {item.tanggal_acara && (
                        <div className="flex items-center text-sm text-blue-600 mb-3">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span className="font-medium">Acara: </span>
                          <span className="ml-1">{formatDate(item.tanggal_acara)}</span>
                        </div>
                      )}
                      
                      {/* Image if exists */}
                      {item.foto && (
                        <div className="mb-3">
                          <Image 
                            src={item.foto} 
                            alt="Foto pengumuman" 
                            width={800}
                            height={400}
                            className="w-full max-h-96 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tweet-like Actions */}
                <div className="px-4 py-3 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => handleView(item)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Lihat Detail
                  </button>
                </div>
              </div>
            ) : (
              // Card Layout for Pending Broadcasts
              <div key={item.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
                {/* Card Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <span className={getKategoriBadge(item.kategori)}>
                      {item.kategori}
                    </span>
                    <span className={getStatusBadge(item.status_broadcast)}>
                      {item.status_broadcast}
                    </span>
                  </div>
                  
                  {/* Pembuat Broadcast */}
                  <div className="flex items-center mb-2">
                    <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {item.user?.username || 'Admin'}
                      </span>
                      <span className="text-gray-500 ml-1">
                        ({item.user?.role || 'admin'})
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {formatDate(item.createdAt)}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-grow flex flex-col">
                  {/* Foto Area */}
                  <div className="mb-4 h-32 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    {item.foto ? (
                      <Image 
                        src={item.foto} 
                        width={800}
                        height={400}
                        alt="Foto pengumuman" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.parentElement!.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center text-gray-400">
                              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Isi Broadcast */}
                  <div className="text-gray-900 mb-4 flex-grow">
                    <p 
                      className="overflow-hidden" 
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.5rem',
                        maxHeight: '6rem'
                      }}
                    >
                      {item.broadcast}
                    </p>
                  </div>

                  {/* Tanggal Acara */}
                  <div className="min-h-[24px] flex items-center">
                    {item.tanggal_acara && (
                      <div className="flex items-center text-sm text-blue-600">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span className="font-medium">Acara: </span>
                        <span className="ml-1">{formatDate(item.tanggal_acara)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2 mt-auto">
                  <button
                    onClick={() => handleView(item)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Lihat
                  </button>
                  
                  <button
                    onClick={() => handleApproval(item)}
                    className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <ActivityIcon className="h-4 w-4 mr-1" />
                    Tindakan
                  </button>
                </div>
              </div>
            )
          ))}
        </div>

        {/* Empty State */}
        {filteredBroadcasts.length === 0 && (
          <div className="text-center py-12">
            <MegaphoneIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada pengumuman</h3>
            <p className="mt-1 text-sm text-gray-500">Belum ada pengumuman yang ditemukan.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
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
                    {Math.min(endIndex, filteredBroadcasts.length)}
                  </span>{' '}
                  dari <span className="font-medium">{filteredBroadcasts.length}</span> hasil
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

      {/* Modals */}
      {showCreateModal && (
        <CreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={refreshData}
        />
      )}

      {showApprovalModal && selectedBroadcast && (
        <ApprovalModal
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedBroadcast(null);
          }}
          broadcast={selectedBroadcast}
          onSuccess={refreshData}
        />
      )}

      {showViewModal && selectedBroadcast && (
        <ViewModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedBroadcast(null);
          }}
          broadcast={selectedBroadcast}
        />
      )}
    </div>
  );
}
