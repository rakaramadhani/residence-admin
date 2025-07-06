"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@supabase/supabase-js";
import { AlertTriangle, DollarSign, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Emergency,
  EmergencyAlert,
  fetchEmergency,
  fetchEmergencyAlert,
  fetchIuranSummary,
  fetchPengaduan,
  fetchUsers,
  IuranSummary,
  Pengaduan,
  User
} from "./fetcher";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not defined");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function untuk mendapatkan bulan dan tahun saat ini
const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    bulan: now.getMonth() + 1, // getMonth() returns 0-11, so add 1
    tahun: now.getFullYear(),
    bulanNama: [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ][now.getMonth()]
  };
};

export function Overview() {
  const [dataPenghuni, setDataPenghuni] = useState<User[]>([]);
  const [datapengaduan, setDatapengaduan] = useState<Pengaduan[]>([]);
  const [dataEmergency, setDataEmergency] = useState<Emergency[]>([]);
  const [emergencyAlert, setEmergencyAlert] = useState<EmergencyAlert | null>(null);
  const [iuranSummary, setIuranSummary] = useState<IuranSummary>({
    totalLunas: 0,
    jumlahLunas: 0,
    jumlahBelumLunas: 0,
    totalPenghuni: 0,
  });
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear());
  const [isLoading, setIsLoading] = useState(true);

  // Function untuk fetch data iuran bulan ini
  const fetchCurrentMonthIuran = async () => {
    const { bulan, tahun } = getCurrentMonthYear();
    try {
      const data = await fetchIuranSummary(bulan, tahun);
      console.log(`Fetching iuran data for ${bulan}/${tahun}:`, data);
      
      setIuranSummary({
        totalLunas: data.totalLunas || 0,
        jumlahLunas: data.jumlahLunas || 0,
        jumlahBelumLunas: data.jumlahBelumLunas || 0,
        totalPenghuni: data.totalPenghuni || 0
      });
    } catch (error) {
      console.error(`Error fetching iuran summary for ${bulan}/${tahun}:`, error);
      // Set default values on error
      setIuranSummary({
        totalLunas: 0,
        jumlahLunas: 0,
        jumlahBelumLunas: 0,
        totalPenghuni: 0,
      });
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Update current month info
        const monthInfo = getCurrentMonthYear();
        setCurrentMonth(monthInfo);

        // Fetch semua data secara parallel
        const [users, pengaduan, emergency, emergencyAlertData] = await Promise.all([
          fetchUsers(),
          fetchPengaduan(),
          fetchEmergency(),
          fetchEmergencyAlert()
        ]);

        setDataPenghuni(users);
        setDatapengaduan(pengaduan);
        setDataEmergency(emergency);
        setEmergencyAlert(emergencyAlertData);

        // Fetch iuran data untuk bulan ini secara terpisah
        await fetchCurrentMonthIuran();

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();

    // Supabase Realtime Subscription
    const subscription = supabase
      .channel("all_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public" },
        async (payload) => {
          console.log("Database changed:", payload);
          try {
            if (payload.table === "pengaduan") {
              const pengaduan = await fetchPengaduan();
              setDatapengaduan(pengaduan);
            }
            if (payload.table === "User") {
              const users = await fetchUsers();
              setDataPenghuni(users);
            }
            if (payload.table === "Tagihan") {
              console.log("Tagihan table changed, refetching current month data...");
              // Update current month dan fetch ulang data iuran
              const newMonthInfo = getCurrentMonthYear();
              setCurrentMonth(newMonthInfo);
              await fetchCurrentMonthIuran();
            }
            if (payload.table === "Emergency") {
              const [emergency, emergencyAlertData] = await Promise.all([
                fetchEmergency(),
                fetchEmergencyAlert()
              ]);
              setDataEmergency(emergency);
              setEmergencyAlert(emergencyAlertData);
            }
          } catch (error) {
            console.error("Error updating data:", error);
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Hitung penghuni aktif (role penghuni dan aktif)
  const penghuniAktif = dataPenghuni.filter(
    (user) => user.role === "penghuni"
  ).length;

  // Hitung pengaduan pending (PengajuanBaru)
  const pengaduanPending = datapengaduan.filter(
    (pengaduan) => pengaduan.status_pengaduan === "PengajuanBaru"
  ).length;

  // Hitung emergency alert status
  const emergencyPendingCount = dataEmergency.filter(emergency => emergency.status === "ditindaklanjuti").length;

  // Hitung persentase pembayaran iuran berdasarkan total tagihan bulan ini
  const totalTagihan = iuranSummary.jumlahLunas + iuranSummary.jumlahBelumLunas;
  const persentasePembayaran = totalTagihan > 0 
    ? Math.round((iuranSummary.jumlahLunas / totalTagihan) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 w-4 bg-gray-200 rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
   
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Penghuni Aktif */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Total Penghuni Aktif
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {penghuniAktif}
            </div>
            <p className="text-xs text-blue-500 mt-1">
              Penghuni terdaftar aktif
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Pengaduan Pending */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">
              Pengaduan Pending
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {pengaduanPending}
            </div>
            <p className="text-xs text-orange-500 mt-1">
              Menunggu penanganan
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Emergency Alert */}
        <Card className={`border-l-4 ${emergencyAlert?.hasAlert ? 'border-l-red-500' : 'border-l-green-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${emergencyAlert?.hasAlert ? 'text-red-700' : 'text-green-700'}`}>
              Emergency
            </CardTitle>
            <AlertTriangle className={`h-4 w-4 ${emergencyAlert?.hasAlert ? 'text-red-500' : 'text-green-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${emergencyAlert?.hasAlert ? 'text-red-600' : 'text-green-600'}`}>
              {emergencyPendingCount}
            </div>
            <p className={`text-xs mt-1 ${emergencyAlert?.hasAlert ? 'text-red-500' : 'text-green-500'}`}>
              Kejadian darurat sedang ditindaklanjuti
            </p>
            {emergencyAlert?.hasAlert && (
              <Link 
                href="/admin/emergency"
                className="mt-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs rounded-full inline-flex items-center gap-1 transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer"
              >
                <AlertTriangle className="h-3 w-3" />
                PERLU PERHATIAN
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Card 4: Tagihan Bulan Ini */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Tagihan {currentMonth.bulanNama} {currentMonth.tahun}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {persentasePembayaran}%
            </div>
            <p className="text-xs text-green-500 mt-1">
              Tingkat pembayaran bulan ini
            </p>
            <div className="mt-2">
              <p className="text-xs text-gray-600">
                {iuranSummary.jumlahLunas}/{totalTagihan} tagihan sudah dibayar
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Total: {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(iuranSummary.totalLunas)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 