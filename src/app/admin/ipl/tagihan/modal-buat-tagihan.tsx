'use client';

import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { Fragment, useEffect, useState } from 'react';
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

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-25"
          leave="ease-in duration-200"
          leaveFrom="opacity-25"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Buat Tagihan Baru
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Periode Tagihan */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bulan
                      </label>
                      <select
                        value={bulan}
                        onChange={(e) => setBulan(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
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
                        value={tahun}
                        onChange={(e) => setTahun(Number(e.target.value))}
                        min="2020"
                        max="2030"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Nominal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pengaturan Nominal
                    </label>
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
                        <input
                          type="number"
                          value={nominal}
                          onChange={(e) => setNominal(e.target.value ? Number(e.target.value) : '')}
                          placeholder="Masukkan nominal"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                    </div>
                  </div>

                  {/* Pilih Pengguna */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Pengguna ({selectedUsers.length} terpilih)
                    </label>
                    
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Cari pengguna..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                      <div className="text-center py-4">Loading...</div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
                        {filteredUsers.map(user => (
                          <label key={user.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleUserSelect(user.id)}
                              className="text-blue-600"
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
                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading || selectedUsers.length === 0}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Memproses...' : 'Buat Tagihan'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}