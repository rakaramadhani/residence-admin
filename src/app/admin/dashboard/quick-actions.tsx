"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, Transition } from '@headlessui/react';
import { createClient } from "@supabase/supabase-js";
import {
    Bell,
    Check,
    DollarSign,
    FileText,
    MessageSquare,
    Search,
    X,
    Zap
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import Swal from "sweetalert2";
import CreateModal from "../broadcast/create-modal";
import {
    fetchUsers,
    NotificationData,
    sendNotification,
    User
} from "./fetcher";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not defined");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface QuickActionsProps {
  onActionComplete?: () => void;
}

export function QuickActions({ onActionComplete }: QuickActionsProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  // Search and selection states
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form states
  const [notificationForm, setNotificationForm] = useState({
    target: "all", // "all" or "individual"
    userId: "",
    judul: "",
    isi: "",
    tipe: "Pemberitahuan"
  });

  // Load users function
  const loadUsers = async () => {
    try {
      const usersData = await fetchUsers();
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  // Load users on mount
  useEffect(() => {
    loadUsers();

    // Supabase Realtime Subscription
    const subscription = supabase
      .channel("users_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "User" },
        async (payload) => {
          console.log("User changed (Quick Actions):", payload);
          await loadUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (!userSearchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.username?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.cluster?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.nomor_rumah?.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [userSearchTerm, users]);

  // Quick action handlers
  const handleQuickNotification = async (template: string) => {
    let judul = "";
    let isi = "";
    
    switch (template) {
      case "reminder_ipl":
        judul = "Reminder Pembayaran IPL";
        isi = "Pengingat: Jangan lupa untuk membayar IPL bulan ini. Terima kasih.";
        break;
      case "maintenance":
        judul = "Jadwal Maintenance";
        isi = "Akan ada maintenance sistem pada hari ini. Mohon maaf atas ketidaknyamanannya.";
        break;
    }
    
    setNotificationForm(prev => ({ ...prev, judul, isi, target: "all" }));
    setShowNotificationModal(true);
  };

  // Handle user selection
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setNotificationForm(prev => ({ ...prev, userId: user.id }));
    setUserSearchTerm(user.username || user.email);
    setShowUserDropdown(false);
  };

  // Clear user selection
  const clearUserSelection = () => {
    setSelectedUser(null);
    setNotificationForm(prev => ({ ...prev, userId: "" }));
    setUserSearchTerm("");
  };

  // Handle target change
  const handleTargetChange = (value: string) => {
    setNotificationForm(prev => ({ ...prev, target: value }));
    if (value === "all") {
      clearUserSelection();
    }
  };

  // Handle broadcast modal success
  const handleBroadcastSuccess = () => {
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Broadcast berhasil dikirim',
      confirmButtonColor: '#3B82F6',
      timer: 2000,
      showConfirmButton: false
    });
    onActionComplete?.();
  };

  // Send notification
  const handleSendNotification = async () => {
    if (!notificationForm.judul || !notificationForm.isi) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Judul dan isi notifikasi harus diisi',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    setLoading(true);
    try {
      let targetUserIds: string[] = [];
      
      if (notificationForm.target === "all") {
        targetUserIds = users.map(user => user.id);
      } else {
        if (!notificationForm.userId) {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Pilih pengguna untuk notifikasi individual',
            confirmButtonColor: '#3B82F6'
          });
          setLoading(false);
          return;
        }
        targetUserIds = [notificationForm.userId];
      }

      const notificationData: NotificationData = {
        userId: targetUserIds.length === 1 ? targetUserIds[0] : targetUserIds.join(","),
        judul: notificationForm.judul,
        isi: notificationForm.isi,
        tipe: notificationForm.tipe
      };

      const result = await sendNotification(notificationData);
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Notifikasi berhasil dikirim',
          confirmButtonColor: '#3B82F6',
          timer: 2000,
          showConfirmButton: false
        });
        setShowNotificationModal(false);
        setNotificationForm({
          target: "all",
          userId: "",
          judul: "",
          isi: "",
          tipe: "Pemberitahuan"
        });
        clearUserSelection();
        onActionComplete?.();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Gagal mengirim notifikasi',
          confirmButtonColor: '#3B82F6'
        });
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Terjadi kesalahan saat mengirim notifikasi',
        confirmButtonColor: '#3B82F6'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Broadcast Button */}
          <Button 
            onClick={() => setShowBroadcastModal(true)}
            className="w-full justify-start" 
            variant="outline"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Kirim Broadcast
          </Button>

          {/* Custom Notification */}
          <Button 
            onClick={() => setShowNotificationModal(true)}
            className="w-full justify-start" 
            variant="outline"
          >
            <Bell className="h-4 w-4 mr-2" />
            Kirim Notifikasi
          </Button>

          {/* Quick Templates */}
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-2">Template Cepat:</p>
            <div className="space-y-1">
              <Button 
                onClick={() => handleQuickNotification("reminder_ipl")}
                size="sm" 
                variant="ghost" 
                className="w-full justify-start text-xs"
              >
                <DollarSign className="h-3 w-3 mr-2" />
                Reminder IPL
              </Button>
              
              <Button 
                onClick={() => handleQuickNotification("maintenance")}
                size="sm" 
                variant="ghost" 
                className="w-full justify-start text-xs"
              >
                <FileText className="h-3 w-3 mr-2" />
                Info Maintenance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Use existing CreateModal from broadcast */}
      <CreateModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        onSuccess={handleBroadcastSuccess}
      />

      {/* Improved Notification Modal with search functionality */}
      <Transition appear show={showNotificationModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowNotificationModal(false)}>
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
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Kirim Notifikasi
                      </h3>
                      <button
                        onClick={() => setShowNotificationModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <form className="space-y-4">
                      {/* Target */}
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">
                          Target
                        </Label>
                        <Select value={notificationForm.target} onValueChange={handleTargetChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Penghuni</SelectItem>
                            <SelectItem value="individual">Penghuni Tertentu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Individual User Selection with Search */}
                      {notificationForm.target === "individual" && (
                        <div>
                          <Label className="block text-sm font-medium text-gray-700 mb-1">
                            Pilih Penghuni
                          </Label>
                          <div className="relative">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                placeholder="Cari berdasarkan nama, email, atau cluster..."
                                value={userSearchTerm}
                                onChange={(e) => {
                                  setUserSearchTerm(e.target.value);
                                  setShowUserDropdown(true);
                                }}
                                onFocus={() => setShowUserDropdown(true)}
                                className="pl-10 pr-10"
                                disabled={loading}
                              />
                              {selectedUser && (
                                <button
                                  type="button"
                                  onClick={clearUserSelection}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>

                            {/* User Dropdown */}
                            {showUserDropdown && !selectedUser && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {filteredUsers.length === 0 ? (
                                  <div className="px-3 py-2 text-sm text-gray-500">
                                    Tidak ada penghuni yang ditemukan
                                  </div>
                                ) : (
                                  filteredUsers.map((user) => (
                                    <button
                                      key={user.id}
                                      type="button"
                                      onClick={() => handleUserSelect(user)}
                                      className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium text-sm">
                                            {user.username || user.email}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {user.email}
                                            {user.cluster && ` • ${user.cluster}`}
                                            {user.nomor_rumah && ` No. ${user.nomor_rumah}`}
                                          </div>
                                        </div>
                                      </div>
                                    </button>
                                  ))
                                )}
                              </div>
                            )}

                            {/* Selected User Display */}
                            {selectedUser && (
                              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <div className="flex items-center">
                                  <Check className="h-4 w-4 text-blue-600 mr-2" />
                                  <div>
                                    <div className="font-medium text-sm text-blue-900">
                                      {selectedUser.username || selectedUser.email}
                                    </div>
                                    <div className="text-xs text-blue-700">
                                      {selectedUser.email}
                                      {selectedUser.cluster && ` • ${selectedUser.cluster}`}
                                      {selectedUser.nomor_rumah && ` No. ${selectedUser.nomor_rumah}`}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Judul */}
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">
                          Judul <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                          value={notificationForm.judul}
                          onChange={(e) => setNotificationForm(prev => ({ ...prev, judul: e.target.value }))}
                          placeholder="Judul notifikasi"
                          className="w-full"
                          disabled={loading}
                        />
                      </div>

                      {/* Isi Notifikasi */}
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">
                          Isi Notifikasi <span className="text-red-500">*</span>
                        </Label>
                        <Textarea 
                          value={notificationForm.isi}
                          onChange={(e) => setNotificationForm(prev => ({ ...prev, isi: e.target.value }))}
                          placeholder="Isi notifikasi..."
                          rows={4}
                          className="w-full"
                          disabled={loading}
                        />
                      </div>

                      {/* Tipe */}
                      <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipe
                        </Label>
                        <Select value={notificationForm.tipe} onValueChange={(value) => 
                          setNotificationForm(prev => ({ ...prev, tipe: value }))
                        }>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pemberitahuan">Pemberitahuan</SelectItem>
                            <SelectItem value="Reminder">Reminder</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                            <SelectItem value="Info">Info</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowNotificationModal(false)}
                          disabled={loading}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSendNotification}
                          disabled={loading}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Mengirim...' : 'Kirim Notifikasi'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
} 