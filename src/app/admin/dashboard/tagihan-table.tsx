"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, Transition } from '@headlessui/react';
import { createClient } from "@supabase/supabase-js";
import { Bell, Clock, Eye, Search, X } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import Swal from 'sweetalert2';
import { getTagihan, sendNotification, Tagihan } from "../ipl/tagihan/fetcher";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not defined");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Modal Detail Component (similar to modal-detail.tsx)
interface ModalDetailTagihanProps {
  isOpen: boolean;
  onClose: () => void;
  tagihan: Tagihan | null;
}

function ModalDetailTagihan({ isOpen, onClose, tagihan }: ModalDetailTagihanProps) {
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

  const getBulanNama = (bulan: number) => {
    const bulanObj = bulanOptions.find(b => b.value === bulan);
    return bulanObj ? bulanObj.label : bulan.toString();
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-full";
    if (status === 'lunas') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
  };

  if (!tagihan) return null;

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900"
                  >
                    Informasi Tagihan
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Nomor Tagihan : </span>
                      <span className="text-sm text-gray-700">{tagihan.id}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-900">Pengguna : </span>
                      <span className="text-sm text-gray-700">{tagihan.user?.username || 'Belum Mengisikan'}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-900">Email : </span>
                      <span className="text-sm text-gray-700">{tagihan.user?.email || 'Belum Memiliki Email'}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-900">Kontak : </span>
                      <span className="text-sm text-gray-700">{tagihan.user?.phone || 'Belum Mengisikan'}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-900">Rumah : </span>
                      <span className="text-sm text-gray-700">
                        {tagihan.user?.cluster + ' No. ' + tagihan.user?.nomor_rumah || 'Belum Mengisikan'}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-900">Bulan : </span>
                      <span className="text-sm text-gray-700">{getBulanNama(tagihan.bulan)} {tagihan.tahun}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-900">Nominal Tagihan : </span>
                      <span className="text-sm text-gray-700 font-semibold">
                        Rp. {tagihan.nominal.toLocaleString('id-ID')}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">Status Tagihan : </span>
                      <span className={getStatusBadge(tagihan.status_bayar)}>
                        {tagihan.status_bayar === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Tutup
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export function TagihanTable() {
  const [tagihan, setTagihan] = useState<Tagihan[]>([]);
  const [filteredTagihan, setFilteredTagihan] = useState<Tagihan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTagihan, setSelectedTagihan] = useState<Tagihan | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const data = await getTagihan();
      // Filter hanya tagihan yang belum lunas
      const belumLunas = data.filter(item => item.status_bayar === "belumLunas");
      setTagihan(belumLunas);
      setFilteredTagihan(belumLunas);
    } catch {
      console.error("Error fetching tagihan");
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Gagal memuat data tagihan',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Supabase Realtime Subscription
    const subscription = supabase
      .channel("tagihan_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Tagihan" },
        async (payload) => {
          console.log("Tagihan changed (Table):", payload);
          await fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Filter berdasarkan search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredTagihan(tagihan);
    } else {
      const filtered = tagihan.filter(item =>
        item.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user?.cluster?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user?.nomor_rumah?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTagihan(filtered);
    }
  }, [searchTerm, tagihan]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
  };

  const isOverdue = (bulan: number, tahun: number) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    return tahun < currentYear || (tahun === currentYear && bulan < currentMonth);
  };

  const handleSendReminder = async (tagihan: Tagihan) => {
    if (!tagihan.user) return;

    // Show confirmation with SweetAlert
    const result = await Swal.fire({
      title: 'Kirim Pengingat?',
      html: `
        <div class="text-left">
          <p><strong>Penghuni:</strong> ${tagihan.user.username || tagihan.user.email}</p>
          <p><strong>Periode:</strong> ${getMonthName(tagihan.bulan)} ${tagihan.tahun}</p>
          <p><strong>Nominal:</strong> ${formatCurrency(tagihan.nominal)}</p>
          <br>
          <p class="text-sm text-gray-600">Pengingat akan dikirim melalui notifikasi aplikasi kepada penghuni terkait.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Kirim',
      cancelButtonText: 'Batal',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const reminderData = {
            userId: tagihan.userId,
            judul: "Pengingat Pembayaran Iuran",
            isi: `Halo ${tagihan.user?.username || tagihan.user?.email}, kami mengingatkan bahwa tagihan iuran untuk bulan ${getMonthName(tagihan.bulan)} ${tagihan.tahun} sebesar ${formatCurrency(tagihan.nominal)} belum dibayar. Mohon segera lakukan pembayaran. Terima kasih.`,
            tipe: "tagihan_reminder"
          };

          const result = await sendNotification(reminderData);
          return result;
        } catch {
          Swal.showValidationMessage('Gagal mengirim pengingat');
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });

    if (result.isConfirmed && result.value) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengingat berhasil dikirim',
        confirmButtonColor: '#3B82F6',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const handleViewDetail = (tagihan: Tagihan) => {
    setSelectedTagihan(tagihan);
    setIsDetailModalOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tagihan Belum Lunas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tagihan Belum Lunas</span>
            <Badge variant="outline" className="text-red-600">
              {filteredTagihan.length} tagihan
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari berdasarkan nama, email, cluster, atau nomor rumah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Penghuni</TableHead>
                  <TableHead>Cluster</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTagihan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm ? "Tidak ada data yang sesuai pencarian" : "Semua tagihan sudah lunas! 🎉"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTagihan.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.user?.username || item.user?.email}</div>
                          <div className="text-sm text-gray-500">{item.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.user?.cluster + " No. " + item.user?.nomor_rumah || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{getMonthName(item.bulan)} {item.tahun}</span>
                          {isOverdue(item.bulan, item.tahun) && (
                            <Clock className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatCurrency(item.nominal)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${
                            isOverdue(item.bulan, item.tahun) 
                              ? "text-red-600 border-red-200" 
                              : "text-yellow-600 border-yellow-200"
                          }`}
                        >
                          {isOverdue(item.bulan, item.tahun) ? "Terlambat" : "Belum Bayar"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(item)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendReminder(item)}
                            className="flex items-center space-x-1"
                          >
                            <Bell className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          {filteredTagihan.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-red-600">
                    {filteredTagihan.filter(item => isOverdue(item.bulan, item.tahun)).length}
                  </div>
                  <div className="text-xs text-gray-600">Terlambat</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-600">
                    {filteredTagihan.filter(item => !isOverdue(item.bulan, item.tahun)).length}
                  </div>
                  <div className="text-xs text-gray-600">Belum Bayar</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(filteredTagihan.reduce((sum, item) => sum + item.nominal, 0))}
                  </div>
                  <div className="text-xs text-gray-600">Total Tagihan</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-600">
                    {filteredTagihan.length}
                  </div>
                  <div className="text-xs text-gray-600">Jumlah Tagihan</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Detail */}
      <ModalDetailTagihan
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        tagihan={selectedTagihan}
      />
    </>
  );
} 