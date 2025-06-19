"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Bell, CreditCard, Filter, Search, User, X } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import Swal from 'sweetalert2';
import { fetchTagihan, NotificationData, sendNotification, Tagihan } from "./fetcher";

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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState<Tagihan | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const loadTagihan = async () => {
    try {
      const data = await fetchTagihan();
      // Sort by status and date
      const sortedData = data.sort((a, b) => {
        // Prioritize belumLunas first
        if (a.status_bayar === "belumLunas" && b.status_bayar === "lunas") return -1;
        if (a.status_bayar === "lunas" && b.status_bayar === "belumLunas") return 1;
        // Then sort by date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setTagihan(sortedData);
      setFilteredTagihan(sortedData);
    } catch (error) {
      console.error("Error loading tagihan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTagihan();

    // Supabase Realtime Subscription
    const subscription = supabase
      .channel("tagihan_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Tagihan" },
        async (payload) => {
          console.log("Tagihan changed (Table):", payload);
          await loadTagihan();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Filter effect
  useEffect(() => {
    let filtered = [...tagihan];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user?.cluster?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user?.nomor_rumah?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status_bayar === statusFilter);
    }

    setFilteredTagihan(filtered);
  }, [tagihan, searchTerm, statusFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getMonthName = (month: number) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1] || 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    if (status === "lunas") {
      return <Badge className="bg-green-100 text-green-800">Lunas</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Belum Lunas</Badge>;
    }
  };

  const handleSendReminder = async (userId: string, userInfo: string) => {
    setIsSendingNotification(true);
    try {
      const notificationData: NotificationData = {
        userId,
        judul: "Reminder Pembayaran IPL",
        isi: `Hai ${userInfo}, jangan lupa untuk melakukan pembayaran IPL bulan ini. Terima kasih.`,
        tipe: "Reminder"
      };

      const result = await sendNotification(notificationData);
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Reminder berhasil dikirim',
          confirmButtonColor: '#3B82F6',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Gagal mengirim reminder',
          confirmButtonColor: '#3B82F6'
        });
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Terjadi kesalahan saat mengirim reminder',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setIsSendingNotification(false);
    }
  };

  const handleViewDetail = (tagihan: Tagihan) => {
    setSelectedTagihan(tagihan);
    setIsDetailModalOpen(true);
  };

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Tagihan Belum Lunas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p className="mt-2 text-gray-500">Memuat data tagihan...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const unpaidCount = tagihan.filter(t => t.status_bayar === "belumLunas").length;
  const paidCount = tagihan.filter(t => t.status_bayar === "lunas").length;
  const totalAmount = tagihan
    .filter(t => t.status_bayar === "belumLunas")
    .reduce((sum, t) => sum + t.nominal, 0);

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0 pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Tagihan Belum Lunas
              {unpaidCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unpaidCount} tagihan
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col min-h-0">
          {/* Quick Stats */}
          <div className="flex-shrink-0 grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">{unpaidCount}</div>
              <div className="text-xs text-red-600">Belum Lunas</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{paidCount}</div>
              <div className="text-xs text-green-600">Lunas</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xs font-bold text-blue-600">{formatCurrency(totalAmount)}</div>
              <div className="text-xs text-blue-600">Total Tunggakan</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari berdasarkan nama, email, cluster, atau nomor rumah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="belumLunas">Belum Lunas</SelectItem>
                <SelectItem value="lunas">Lunas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="flex-shrink-0 text-sm text-gray-600 mb-3">
            Menampilkan {filteredTagihan.length} dari {tagihan.length} tagihan
          </div>

          {/* Table - Scrollable */}
          <div className="flex-1 min-h-0 border rounded-lg overflow-hidden">
            <div className="overflow-auto max-h-full">
              <Table>
                <TableHeader className="sticky top-0 bg-white border-b">
                  <TableRow>
                    <TableHead className="w-[200px]">Penghuni</TableHead>
                    <TableHead className="w-[120px]">Periode</TableHead>
                    <TableHead className="w-[100px]">Nominal</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTagihan.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {searchTerm || statusFilter !== "all" 
                          ? "Tidak ada tagihan yang sesuai filter"
                          : "Belum ada data tagihan"
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTagihan.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium text-sm">
                                {item.user?.username || item.user?.email || 'Unknown'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.user?.email}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.user?.cluster && `${item.user.cluster}`}
                                {item.user?.nomor_rumah && ` No. ${item.user.nomor_rumah}`}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {getMonthName(item.bulan)} {item.tahun}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(item.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">
                            {formatCurrency(item.nominal)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(item.status_bayar)}
                        </TableCell>
                        <TableCell>
                          {item.status_bayar === "belumLunas" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendReminder(
                                item.userId,
                                item.user?.username || item.user?.email || 'Penghuni'
                              )}
                              disabled={isSendingNotification}
                              className="text-xs h-7"
                            >
                              <Bell className="h-3 w-3 mr-1" />
                              Remind
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Footer Summary */}
          <div className="flex-shrink-0 mt-3 pt-3 border-t">
            <div className="text-xs text-gray-500 text-center">
              {unpaidCount > 0 && (
                <span className="text-red-600 font-medium">
                  {unpaidCount} tagihan belum lunas • Total: {formatCurrency(totalAmount)}
                </span>
              )}
              {unpaidCount === 0 && (
                <span className="text-green-600 font-medium">
                  Semua tagihan sudah lunas ✓
                </span>
              )}
            </div>
          </div>
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