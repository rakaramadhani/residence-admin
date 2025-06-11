 
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@supabase/supabase-js";
import { DollarSign, MessageSquare, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchIuranSummary, fetchPengaduan, fetchUsers, IuranSummary, Pengaduan, User } from "./fetcher";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not defined");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnonKey);

export function Overview() {
  const [dataPenghuni, setDataPenghuni] = useState<User[]>([]);
  const [datapengaduan, setDatapengaduan] = useState<Pengaduan[]>([]);
  const [iuranSummary, setIuranSummary] = useState<IuranSummary>({
    totalLunas: 0,
    jumlahLunas: 0,
    jumlahBelumLunas: 0,
    totalPenghuni: 0,
  });

  
  useEffect(() => {
    // Fetch data user menggunakan fetcher
    const fetchUsersData = async () => {
      try {
        const users = await fetchUsers();
        setDataPenghuni(users);
      } catch (error) {
        console.error("Error fetching users data:", error);
      }
    };
    fetchUsersData();

    // Fetch data pengaduan menggunakan fetcher
    const fetchPengaduanData = async () => {
      try {
        const pengaduan = await fetchPengaduan();
        setDatapengaduan(pengaduan);
      } catch (error) {
        console.error("Error fetching pengaduan data:", error);
      }
    };
    fetchPengaduanData();

    // Fetch iuran summary menggunakan fetcher
    const fetchIuranSummaryData = async () => {
      try {
        const now = new Date();
        const bulan = now.getMonth() + 1;
        const tahun = now.getFullYear();
        
        const data = await fetchIuranSummary(bulan, tahun);
        setIuranSummary({
          totalLunas: data.totalLunas || 0,
          jumlahLunas: data.jumlahLunas || 0,
          jumlahBelumLunas: data.jumlahBelumLunas || 0,
          totalPenghuni: data.totalPenghuni || 0
        });
      } catch (error) {
        console.error("Error fetching iuran summary:", error);
      }
    };
    fetchIuranSummaryData();

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
              await fetchPengaduanData();
            }
            if (payload.table === "User") {
              await fetchUsersData();
            }
            if (payload.table === "Tagihan") {
              await fetchIuranSummaryData();
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

  // Hitung pengaduan yang sedang dalam proses dan selesai
  const pengaduanSedangProses = datapengaduan.filter(
    (pengaduan) => pengaduan.status_pengaduan === "PengajuanBaru" || pengaduan.status_pengaduan === "Ditangani"
  ).length;
  
  const pengaduanSelesai = datapengaduan.filter(
    (pengaduan) => pengaduan.status_pengaduan === "Selesai"
  ).length;

  const getBulanNama = () => {
    const bulanNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return bulanNames[new Date().getMonth()];
  };
   
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Penghuni Terdaftar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Penghuni Terdaftar
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {dataPenghuni.length}{" "}
              <span className="text-sm font-normal text-gray-600">Orang</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Pengaduan Masuk */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pengaduan Masuk
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {datapengaduan.length}{" "}
              <span className="text-sm font-normal text-gray-600">total pengaduan</span>
            </div>
            <div className="space-y-1 mt-2">
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold">{pengaduanSedangProses}</span> pengaduan sedang dalam proses
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold">{pengaduanSelesai}</span> pengaduan sudah diselesaikan
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Iuran Masuk */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Iuran Masuk
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-sm font-medium">Bulan: {getBulanNama()}</div>
              <div className="text-2xl font-bold">
                Rp. {iuranSummary.totalLunas.toLocaleString("id-ID")}
              </div>
              <div className="text-xs text-muted-foreground">
                dari keseluruhan warga
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="font-semibold text-red-600">{iuranSummary.jumlahBelumLunas}</span> belum membayar iuran
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
