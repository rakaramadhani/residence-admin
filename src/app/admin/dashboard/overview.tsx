/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Currency } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not defined");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnonKey);

interface pengaduan {
  id: number;
  status_pengaduan: string;
  [key: string]: unknown;
}

interface IuranSummary {
  totalLunas: number;
  jumlahLunas: number;
  jumlahBelumLunas: number;
}

export function Overview() {
  const [dataPenghuni, setDataPenghuni] = useState<unknown[]>([]);
  const [datapengaduan, setDatapengaduan] = useState<pengaduan[]>([]);
  const [iuranSummary, setIuranSummary] = useState<IuranSummary>({
    totalLunas: 0,
    jumlahLunas: 0,
    jumlahBelumLunas: 0,
  });
  
  useEffect(() => {
    // Fetch data user
    const fetchUsers = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        console.error("Token not found");
        return;
      }
      try {
        const response = await fetch("http://localhost:5000/api/admin/users", {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error ${response.status}: ${errorData.message}`);
        }
        const user = await response.json();
        setDataPenghuni(user.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchUsers();

    // Fetch data pengaduan
    const fetchpengaduan = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        console.error("Token not found");
        return;
      }
      try {
        const response = await fetch(
          "http://localhost:5000/api/admin/pengaduan",
          {
            method: "GET",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
            cache: "no-store",
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error ${response.status}: ${errorData.message}`);
        }
        const pengaduan = await response.json();
        setDatapengaduan(pengaduan.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchpengaduan();

    const fetchIuranSummary = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      const now = new Date();
      const bulan = now.getMonth() + 1; // bulan dimulai dari 1-12 untuk API
      const tahun = now.getFullYear();
      
      try {
        console.log(`Fetching iuran summary for ${bulan}/${tahun}`);
        const res = await fetch(
          `http://localhost:5000/api/admin/tagihan/summary?bulan=${bulan}&tahun=${tahun}`,
          {
            headers: { 
              Authorization: `${token}` 
            },
          }
        );
        
        if (!res.ok) {
          throw new Error(`Gagal fetch summary tagihan: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Iuran summary response:", data);
        
        if (data) {
          setIuranSummary({
            totalLunas: data.totalLunas || 0,
            jumlahLunas: data.jumlahLunas || 0,
            jumlahBelumLunas: data.jumlahBelumLunas || 0
          });
        }
      } catch (err) {
        console.error("Error fetching iuran summary:", err);
      }
    };
    fetchIuranSummary();

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
              await fetchpengaduan();
            }
            if (payload.table === "User") {
              await fetchUsers();
            }
            if (payload.table === "Tagihan") {
              await fetchIuranSummary();
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
   
  return (
    <div className="space-y-6 ">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 ">
        <Card className="min-h-[200px] md:min-h-[150px] lg:min-h-[200px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Penghuni Terdaftar
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-h1-desktop font-bold text-blue-600">
              {dataPenghuni ? dataPenghuni.length : "Loading..."}{" "}
              <span className="text-[16px] font-medium text-gray-600">
                penghuni
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="min-h-[200px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 overflow-auto">
            <CardTitle className="text-sm font-medium">
              Total Pengaduan Masuk Bulan Ini
            </CardTitle>
            <Currency className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="md:grid-cols-2">
            <div className="text-h1-desktop font-bold text-blue-600">
              {datapengaduan ? datapengaduan.length : "Loading..."}{" "}
              <span className="text-[16px] font-medium text-gray-600">
                pengaduan
              </span>
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-2 [w>=1280px]:grid-cols-3">
              <div className="flex gap-2 p-1 bg-blue-200 shadow justify-center items-center w-full h-fit rounded-xl">
                <span className="text-blue-600 font-bold text-2xl">
                  {datapengaduan
                    ? datapengaduan.filter(
                        (pengaduan) => pengaduan.status_pengaduan === "PengajuanBaru" || pengaduan.status_pengaduan === "Ditangani"
                      ).length
                    : "Loading..."}
                </span>
                <p className="text-xs"> Pengaduan Belum Tangani</p>
              </div>
              
            </div>
          </CardContent>
        </Card>
        <Card className="min-h-[200px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 overflow-auto">
            <div className="flex flex-col">
              <CardTitle className="text-lg font-medium">Iuran Warga</CardTitle>
              <CardTitle className="text-sm font-light">Bulan ini</CardTitle>
            </div>
            <Currency className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="md:grid-cols-2">
            <div className="text-h3-desktop font-bold text-blue-600">
              Rp. {iuranSummary.totalLunas.toLocaleString("id-ID")}
            </div>
            <div className="mt-2 text-sm">
              <span className="text-green-600 font-semibold">
                Lunas: {iuranSummary.jumlahLunas}
              </span>
              <span className="mx-2">|</span>
              <span className="text-red-600 font-semibold">
                Belum Lunas: {iuranSummary.jumlahBelumLunas}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
