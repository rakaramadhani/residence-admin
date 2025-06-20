'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Modal from '@/components/ui/modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { GenerateTagihanRequest, User, generateTagihanManual, getUsers } from './fetcher';

interface ModalBuatTagihanProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalBuatTagihan({ isOpen, onClose, onSuccess }: ModalBuatTagihanProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [useClusterNominal, setUseClusterNominal] = useState(true);
  const [nominal, setNominal] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await getUsers();
      console.log('Data users received:', data); // Debug log
      
      if (Array.isArray(data)) {
        // Filter hanya pengguna dengan role "penghuni" dan tambahkan data validation
        const validUsers = data
          .filter(user => user && user.id && user.role === 'penghuni')
          .map(user => ({
            ...user,
            username: user.username || 'Username tidak tersedia',
            email: user.email || 'Email tidak tersedia'
          }));
        setUsers(validUsers);
      } else {
        console.error('Data users bukan array:', data);
        setError('Format data pengguna tidak valid');
        setUsers([]);
      }
    } catch (err) {
      console.error('Error detail:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data pengguna';
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const filteredUsers = users.filter(user => {
    // Add null checking untuk mencegah error
    const username = user?.username?.toLowerCase() || '';
    const email = user?.email?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    return username.includes(searchLower) || email.includes(searchLower);
  });

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedUsers.length === 0) {
      setError('Pilih minimal satu pengguna');
      return;
    }

    if (!useClusterNominal && !nominal) {
      setError('Nominal harus diisi jika tidak menggunakan nominal cluster');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData: GenerateTagihanRequest = {
        userIds: selectedUsers,
        bulan,
        tahun,
        useClusterNominal,
      };

      if (!useClusterNominal && nominal) {
        requestData.nominal = Number(nominal);
      }

      await generateTagihanManual(requestData);
      
      await Swal.fire({
        title: 'Berhasil!',
        html: `Tagihan berhasil dibuat!`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      
      // Reset form
      setSelectedUsers([]);
      setBulan(new Date().getMonth() + 1);
      setTahun(new Date().getFullYear());
      setUseClusterNominal(true);
      setNominal('');
      
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal membuat tagihan';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} title="Buat Tagihan Baru">
      <div className="max-h-[80vh] overflow-y-auto space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Periode Tagihan */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-2">
                Bulan
              </Label>
              <Select value={bulan.toString()} onValueChange={(value) => setBulan(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bulanOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">
                Tahun
              </Label>
              <Input
                type="number"
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                min="2020"
                max="2030"
              />
            </div>
          </div>

          {/* Nominal */}
          <div>
            <Label className="block text-sm font-medium mb-2">
              Pengaturan Nominal
            </Label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={useClusterNominal}
                  onChange={() => setUseClusterNominal(true)}
                  className="mr-2"
                />
                Gunakan nominal dari cluster masing-masing pengguna
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!useClusterNominal}
                  onChange={() => setUseClusterNominal(false)}
                  className="mr-2"
                />
                Nominal manual
              </label>
              {!useClusterNominal && (
                <Input
                  type="number"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Masukkan nominal"
                />
              )}
            </div>
          </div>

          {/* Pilih Pengguna */}
          <div>
            <Label className="block text-sm font-medium mb-2">
              Pilih Pengguna ({selectedUsers.length} terpilih)
            </Label>
            
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Cari pengguna..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {selectedUsers.length === filteredUsers.length ? 'Batalkan Semua' : 'Pilih Semua'}
              </button>
            </div>

            {loadingUsers ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Loading...</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
                {filteredUsers.map(user => (
                  <label key={user.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleUserSelect(user.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{user?.username || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{user?.email || 'N/A'}</div>
                      {user?.clusterRef && (
                        <div className="text-xs text-blue-600">
                          {user.clusterRef.nama_cluster} - Rp {user.clusterRef.nominal_tagihan.toLocaleString('id-ID')}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Tidak ada pengguna ditemukan
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tombol */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading || selectedUsers.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Buat Tagihan'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}