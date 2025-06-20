"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@supabase/supabase-js";
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    Eye,
    QrCode,
    Search,
    User,
    Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { fetchGuestPermissions, GuestHistory } from "./fetcher";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not defined");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function GuestManagement() {
  const [guestHistory, setGuestHistory] = useState<GuestHistory[]>([]);
  const [allGuestHistory, setAllGuestHistory] = useState<GuestHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Modal state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clusterFilter, setClusterFilter] = useState("all");
  const [filteredGuestHistory, setFilteredGuestHistory] = useState<GuestHistory[]>([]);

  const loadGuestData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching guest data...");
      const data = await fetchGuestPermissions();
      console.log("Raw guest data:", data);
      
      if (!Array.isArray(data)) {
        console.error("Data is not an array:", data);
        setError("Format data tidak valid");
        setGuestHistory([]);
        setAllGuestHistory([]);
        return;
      }

      // Sort by most recent
      const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Set all data for modal
      setAllGuestHistory(sortedData);
      
      // Take top 5 for main display
      const recentData = sortedData.slice(0, 5);
        
      console.log("Processed guest data:", recentData);
      setGuestHistory(recentData);
      
    } catch (error) {
      console.error("Error loading guest data:", error);
      setError("Gagal memuat data tamu");
      setGuestHistory([]);
      setAllGuestHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuestData();

    // Supabase Realtime Subscription
    const subscription = supabase
      .channel("guest_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "GuestHistory" },
        async (payload) => {
          console.log("GuestHistory changed (Management):", payload);
          await loadGuestData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Filter and search effect for modal
  useEffect(() => {
    let filtered = [...allGuestHistory];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(guest => 
        guest.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.user?.cluster?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(guest => {
        const status = getVisitStatus(guest.startVisitDate, guest.endVisitDate).status;
        return status === statusFilter;
      });
    }

    // Apply cluster filter
    if (clusterFilter !== "all") {
      filtered = filtered.filter(guest => 
        guest.user?.cluster?.toLowerCase() === clusterFilter.toLowerCase()
      );
    }

    setFilteredGuestHistory(filtered);
  }, [allGuestHistory, searchTerm, statusFilter, clusterFilter]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString;
    }
  };

  const formatDateOnly = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString;
    }
  };

  const isVisitActive = (startDate: string, endDate: string) => {
    try {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      return now >= start && now <= end;
    } catch (error) {
      console.error("Error checking visit active:", error);
      return false;
    }
  };

  const getTodayVisits = () => {
    const today = new Date().toDateString();
    return guestHistory.filter(history => {
      try {
        const visitDate = new Date(history.startVisitDate).toDateString();
        return visitDate === today;
      } catch (error) {
        console.error("Error checking today visit:", error);
        return false;
      }
    });
  };

  const getActiveVisits = () => {
    return guestHistory.filter(history => 
      isVisitActive(history.startVisitDate, history.endVisitDate)
    );
  };

  // Simulate status based on visit date (since GuestHistory doesn't have status)
  const getVisitStatus = (startDate: string, endDate: string) => {
    try {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (now < start) {
        return { status: 'scheduled', label: 'Terjadwal', color: 'bg-blue-100 text-blue-800' };
      } else if (now >= start && now <= end) {
        return { status: 'active', label: 'Sedang Berkunjung', color: 'bg-green-100 text-green-800' };
      } else {
        return { status: 'completed', label: 'Selesai', color: 'bg-gray-100 text-gray-800' };
      }
    } catch (error) {
      console.error("Error getting visit status:", error);
      return { status: 'unknown', label: 'Tidak diketahui', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-3 w-3" />;
      case 'active':
        return <CheckCircle2 className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  // Get unique clusters for filter
  const getUniqueClusters = () => {
    const clusters = allGuestHistory
      .map(guest => guest.user?.cluster)
      .filter(cluster => cluster)
      .filter((cluster, index, arr) => arr.indexOf(cluster) === index);
    return clusters;
  };

  if (loading) {
    return (
      <Card className="h-[500px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Riwayat Tamu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p className="mt-2 text-gray-500">Memuat data tamu...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-[500px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Riwayat Tamu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="font-medium">{error}</p>
            <button 
              onClick={loadGuestData}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Coba lagi
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const todayVisits = getTodayVisits();
  const activeVisits = getActiveVisits();

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Riwayat Tamu
            {activeVisits.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeVisits.length} aktif
              </Badge>
            )}
          </div>
          
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                Lihat Semua
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Semua Riwayat Tamu ({allGuestHistory.length})
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cari nama tamu, host, email, atau cluster..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-fit">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="scheduled">Terjadwal</SelectItem>
                        <SelectItem value="active">Sedang Berkunjung</SelectItem>
                        <SelectItem value="completed">Selesai</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={clusterFilter} onValueChange={setClusterFilter}>
                      <SelectTrigger className="w-fit">
                        <SelectValue placeholder="Filter Cluster" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Cluster</SelectItem>
                        {getUniqueClusters().map(cluster => (
                          <SelectItem key={cluster} value={cluster!}>{cluster}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Results Summary */}
                <div className="text-sm text-gray-600">
                  Menampilkan {filteredGuestHistory.length} dari {allGuestHistory.length} riwayat tamu
                </div>

                {/* Guest List */}
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {filteredGuestHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Tidak ada data tamu ditemukan</p>
                    </div>
                  ) : (
                    filteredGuestHistory.map((history) => {
                      const visitStatus = getVisitStatus(history.startVisitDate, history.endVisitDate);
                      return (
                        <div key={history.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <User className="h-5 w-5 text-gray-500" />
                              <span className="font-medium text-base">{history.guestName}</span>
                            </div>
                            <Badge className={visitStatus.color}>
                              {getStatusIcon(visitStatus.status)}
                              <span className="ml-1 text-xs">
                                {visitStatus.label}
                              </span>
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Host: </span>
                                {history.user?.username || history.user?.email || 'Tidak diketahui'}
                              </div>
                              
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Alamat: </span>
                                {history.user?.cluster && `${history.user.cluster}`}
                                {history.user?.nomor_rumah && ` No. ${history.user.nomor_rumah}`}
                                {history.user?.rt && ` ${history.user.rt}`}
                                {history.user?.rw && ` ${history.user.rw}`}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span>Mulai: {formatDateOnly(history.startVisitDate)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span>Selesai: {formatDateOnly(history.endVisitDate)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t flex justify-between items-center">
                            <div className="flex items-center gap-1 text-xs text-blue-600">
                              <QrCode className="h-3 w-3" />
                              <span>Dibuat: {formatDate(history.createdAt)}</span>
                            </div>
                            
                            {isVisitActive(history.startVisitDate, history.endVisitDate) && (
                              <div className="px-2 py-1 bg-green-50 rounded text-xs text-green-700">
                                🟢 Sedang berkunjung
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 flex-shrink-0">
          <div className="text-center p-3 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">{todayVisits.length}</div>
            <div className="text-xs text-blue-600">Kunjungan Hari Ini</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">{activeVisits.length}</div>
            <div className="text-xs text-green-600">Sedang Berkunjung</div>
          </div>
        </div>

        {/* Recent Guest History with Scroll */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <h4 className="font-medium text-sm text-gray-700 mb-3 flex-shrink-0">Riwayat Tamu</h4>
          
          {guestHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Belum ada data riwayat tamu</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2">
              {guestHistory.map((history) => {
                const visitStatus = getVisitStatus(history.startVisitDate, history.endVisitDate);
                return (
                  <div key={history.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-sm">{history.guestName}</span>
                      </div>
                      <Badge className={visitStatus.color}>
                        {getStatusIcon(visitStatus.status)}
                        <span className="ml-1 text-xs">
                          {visitStatus.label}
                        </span>
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Host: </span>
                        {history.user?.username || history.user?.email || 'Tidak diketahui'}
                        {history.user?.cluster && ` - ${history.user.cluster}`}
                        {history.user?.nomor_rumah && ` No. ${history.user.nomor_rumah}`}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Mulai: {formatDate(history.startVisitDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Selesai: {formatDate(history.endVisitDate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <QrCode className="h-3 w-3" />
                        <span>Riwayat kunjungan tersimpan</span>
                      </div>

                      {isVisitActive(history.startVisitDate, history.endVisitDate) && (
                        <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                          🟢 Sedang berkunjung
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className="mt-4 pt-3 border-t text-center flex-shrink-0">
          <p className="text-xs text-gray-500">
            Total {guestHistory.length} riwayat kunjungan 
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 