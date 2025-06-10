/* eslint-disable import/order */
"use client"

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { FilterCard } from "@/components/ui/filter-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { BellIcon, EyeIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
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

      if (response.success) {
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
          text: response.message || 'Gagal menghapus tagihan. Silakan coba lagi.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error('Error deleting tagihan:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Terjadi kesalahan saat menghapus tagihan. Silakan coba lagi.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
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

  const columns = [
    {
      key: "user.username",
      header: "Pengguna",
      render: (item: Tagihan) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {item.user?.username || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">
            {item.user?.email || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: "alamat",
      header: "Alamat",
      render: (item: Tagihan) => (
        <span className="text-sm text-gray-900">
          {item.user?.cluster ? `${item.user?.cluster} ${item.user?.nomor_rumah}` : 'Belum Diisikan'}
        </span>
      )
    },
    {
      key: "periode",
      header: "Periode", 
      render: (item: Tagihan) => (
        <span className="text-sm text-gray-900">
          {getBulanNama(item.bulan)} {item.tahun}
        </span>
      )
    },
    {
      key: "nominal",
      header: "Nominal",
      render: (item: Tagihan) => (
        <span className="text-sm text-gray-900 font-medium">
          Rp {item.nominal.toLocaleString('id-ID')}
        </span>
      )
    },
    {
      key: "status_bayar",
      header: "Status",
      render: (item: Tagihan) => (
        <StatusBadge 
          status={item.status_bayar === 'lunas' ? 'Lunas' : 'Belum Lunas'}
          variant={item.status_bayar === 'lunas' ? 'success' : 'warning'}
        />
      )
    },
    {
      key: "actions",
      header: "Aksi",
      render: (item: Tagihan) => (
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
              <BellIcon className="h-4 w-4" />
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
      )
    }
  ]

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
      <FilterCard title="Filter Tagihan">
        <div>
          <label className="flex text-sm font-medium text-gray-700 mb-2 w-full">
            Cari Pengguna
          </label>
          <Input
            placeholder="Nama atau email pengguna..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status Pembayaran
          </label>
          <Select onValueChange={(value) => setStatusFilter(value as 'all' | 'lunas' | 'belumLunas')} defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="lunas">Lunas</SelectItem>
              <SelectItem value="belumLunas">Belum Lunas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bulan
          </label>
          <Select onValueChange={(value) => setBulanFilter(value === 'all' ? 'all' : Number(value))} defaultValue="all">
            <SelectTrigger>
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
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tahun
          </label>
          <Input
            type="number"
            placeholder="2024"
            value={tahunFilter === 'all' ? '' : tahunFilter}
            onChange={(e) => setTahunFilter(e.target.value ? Number(e.target.value) : 'all')}
            min="2020"
            max="2030"
          />
        </div>
        
        <div className="flex items-end">
          <Button
            onClick={() => setIsModalBuatOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Buat Tagihan
          </Button>
        </div>
      </FilterCard>

      {/* Table */}
      <DataTable<Tagihan>
        data={currentData}
        columns={columns}
        loading={loading}
        emptyMessage="Tidak ada data tagihan ditemukan"
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredTagihan.length,
          itemsPerPage,
          onPageChange: handlePageChange
        }}
      />

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