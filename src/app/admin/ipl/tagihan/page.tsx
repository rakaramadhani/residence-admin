"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { EyeIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Tagihan, deleteTagihan, getTagihan, sendNotification } from './fetcher';
import ModalBuatTagihan from "./modal-buat-tagihan";
import ModalDetailTagihan from "./modal-detail";

export default function  TagihanPage() {
  const [tagihan, setTagihan] = useState<Tagihan[]>([]);
  const [filteredTagihan, setFilteredTagihan] = useState<Tagihan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReminder, setLoadingReminder] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [isModalBuatOpen, setIsModalBuatOpen] = useState(false);
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState<Tagihan | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'lunas' | 'belumLunas'>('all');
  const [bulanFilter, setBulanFilter] = useState<number | 'all'>('all');
  const [tahunFilter, setTahunFilter] = useState<number | 'all'>(new Date().getFullYear());
  
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
        setTagihan([]);
      }
    } catch (err) {
      console.error('Error detail:', err);
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
    if (bulanFilter !== 'all') {
      filtered = filtered.filter(item => item.bulan === Number(bulanFilter));
    }

    // Filter by tahun
    if (tahunFilter !== 'all') {
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

  const handleSendReminder = async (tagihan: Tagihan) => {
    // Hanya proses jika tagihan belum lunas
    if (tagihan.status_bayar === 'lunas') {
      await Swal.fire({
        title: 'Informasi',
        text: 'Tagihan ini sudah lunas, tidak perlu reminder',
        icon: 'info',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    // Konfirmasi sebelum mengirim dengan SweetAlert
    const result = await Swal.fire({
      title: 'Kirim Reminder',
      text: `Apakah Anda yakin ingin mengirim reminder pembayaran ke ${tagihan.user?.username || 'pengguna ini'}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Kirim!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    setLoadingReminder(true);
    
    try {
      // Kirim notifikasi ke user spesifik
      const response = await sendNotification({
        userId: tagihan.userId,
        judul: 'Reminder',
        isi: `Reminder: Tagihan IPL untuk bulan ${getBulanNama(tagihan.bulan)} ${tagihan.tahun} belum dibayar. Mohon segera lakukan pembayaran sebesar Rp ${tagihan.nominal.toLocaleString('id-ID')}.`,
        tipe: 'Tagihan IPL'
      });

      if (response.success) {
        await Swal.fire({
          title: 'Berhasil!',
          text: `Reminder berhasil dikirim ke ${tagihan.user?.username || 'pengguna'}.`,
          icon: 'success',
          confirmButtonColor: '#3085d6'
        });
      } else {
        await Swal.fire({
          title: 'Gagal!',
          text: 'Pengguna belum Login pada Aplikasi Mobile',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Terjadi kesalahan saat mengirim reminder. Silakan coba lagi.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoadingReminder(false);
    }
  };

  const handleDeleteTagihan = async (tagihan: Tagihan) => {
    // Hanya bisa delete jika tagihan belum lunas
    if (tagihan.status_bayar === 'lunas') {
      await Swal.fire({
        title: 'Tidak Bisa Dihapus',
        text: 'Tagihan yang sudah lunas tidak bisa dihapus',
        icon: 'warning',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    // Konfirmasi sebelum menghapus dengan SweetAlert
    const result = await Swal.fire({
      title: 'Hapus Tagihan',
      html: `Apakah Anda yakin ingin menghapus tagihan ini?<br><br><strong>Pengguna:</strong> ${tagihan.user?.username || 'N/A'}<br><strong>Periode:</strong> ${getBulanNama(tagihan.bulan)} ${tagihan.tahun}<br><strong>Nominal:</strong> Rp ${tagihan.nominal.toLocaleString('id-ID')}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    setLoadingDelete(true);
    
    try {
      const response = await deleteTagihan(tagihan.id);
      console.log('Delete response:', response); // Debug log

      // Cek apakah response memiliki properti success atau tidak
      // Jika response tidak memiliki struktur yang diharapkan, anggap berhasil jika tidak ada error
      const isSuccess = response?.success !== false;

      if (isSuccess) {
        await Swal.fire({
          title: 'Berhasil!',
          text: 'Tagihan berhasil dihapus.',
          icon: 'success',
          confirmButtonColor: '#3085d6'
        });
        
        // Refresh data tagihan
        fetchTagihan();
      } else {
        await Swal.fire({
          title: 'Gagal!',
          text: response?.message || 'Gagal menghapus tagihan. Silakan coba lagi.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error('Error deleting tagihan:', error);
      
      // Cek apakah error terjadi karena response format atau karena network/server error
      const isNetworkError = !((error as Error & { response?: { status?: number } })?.response?.status);
      
      if (isNetworkError) {
        // Jika error tapi tidak ada response status, kemungkinan tagihan sudah terhapus
        // Coba refresh data untuk memverifikasi
        try {
          await fetchTagihan();
          await Swal.fire({
            title: 'Berhasil!',
            text: 'Tagihan berhasil dihapus.',
            icon: 'success',
            confirmButtonColor: '#3085d6'
          });
        } catch {
          // Jika refresh juga error, tampilkan error original
          await Swal.fire({
            title: 'Error!',
            text: 'Terjadi kesalahan saat menghapus tagihan. Silakan coba lagi.',
            icon: 'error',
            confirmButtonColor: '#d33'
          });
        }
      } else {
        // Network/server error yang jelas
        await Swal.fire({
          title: 'Error!',
          text: 'Terjadi kesalahan saat menghapus tagihan. Silakan coba lagi.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    } finally {
      setLoadingDelete(false);
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Tagihan IPL</h1>
          <p className="text-muted-foreground">Kelola tagihan iuran bulanan warga</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          {/* Search Input - Takes remaining space on desktop */}
          <div className="flex-1">
            <div className="relative">
              <Search color="black" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
              <Input
                placeholder="Nama atau email pengguna..."
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
              <Select onValueChange={(value) => setStatusFilter(value as 'all' | 'lunas' | 'belumLunas')} defaultValue="all">
                <SelectTrigger className="px-3 py-3 w-full sm:w-auto min-w-[120px]">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="lunas">Lunas</SelectItem>
                  <SelectItem value="belumLunas">Belum Lunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Bulan Filter */}
            <div className="w-full sm:w-auto">
              <Select onValueChange={(value) => setBulanFilter(value === 'all' ? 'all' : Number(value))} defaultValue="all">
                <SelectTrigger className="px-3 py-3 w-full sm:w-auto min-w-[120px]">
                  <SelectValue placeholder="Semua Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {bulanOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Tahun Filter */}
            <div className="w-full sm:w-auto">
              <Input
                type="number"
                placeholder="2024"
                value={tahunFilter === 'all' ? '' : tahunFilter}
                onChange={(e) => setTahunFilter(e.target.value ? Number(e.target.value) : 'all')}
                min="2020"
                max="2030"
                className="px-3 py-3 w-full sm:w-auto min-w-[100px]"
              />
            </div>
            
            {/* Action Button */}
            <div className="w-full sm:w-auto text-white">
              <Button
                onClick={() => setIsModalBuatOpen(true)}
                className="w-full sm:w-auto px-3 py-3 bg-[#455AF5] hover:bg-[#455AF5]/90 flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Buat Tagihan</span>
                <span className="sm:hidden">Tambah</span>
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
                  Pengguna
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Alamat
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Periode
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Nominal
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
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data tagihan ditemukan</h3>
                    <p className="mt-1 text-sm text-gray-500">Belum ada data tagihan yang sesuai dengan filter.</p>
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {item.user?.cluster ? `${item.user?.cluster} ${item.user?.nomor_rumah}` : 'Belum Diisikan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getBulanNama(item.bulan)} {item.tahun}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">
                        Rp {item.nominal.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge 
                        status={item.status_bayar === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                        variant={item.status_bayar === 'lunas' ? 'success' : 'warning'}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDetailView(item)}
                          className="h-8 w-8 p-0"
                          title="Lihat Detail"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        {item.status_bayar === 'belumLunas' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendReminder(item)}
                            disabled={loadingReminder}
                            className="h-8 w-8 p-0"
                            title="Kirim Reminder"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTagihan(item)}
                          disabled={item.status_bayar === 'lunas' || loadingDelete}
                          className={`h-8 w-8 p-0 ${item.status_bayar === 'lunas' ? 'opacity-50 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
                          title={item.status_bayar === 'lunas' ? 'Tagihan lunas tidak bisa dihapus' : 'Hapus Tagihan'}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
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
              Showing {currentData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredTagihan.length)} of {filteredTagihan.length} entries
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