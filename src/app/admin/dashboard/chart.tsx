"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchIuranSummary, fetchPengaduan, Pengaduan } from "./fetcher";

// Move supabase client creation inside component to avoid SSR issues
let supabase: ReturnType<typeof createClient> | null = null;

interface TagihanChartData {
  month: string;
  totalLunas: number;
  persentase: number;
}

interface PengaduanChartData {
  name: string;
  value: number;
  fill: string;
}

const pengaduanColors = ["#ff6b6b", "#feca57", "#48dbfb"]; // Red, Yellow, Blue

export function Component() {
  const [pengaduanChartData, setPengaduanChartData] = useState<PengaduanChartData[]>([]);
  const [tagihanChartData, setTagihanChartData] = useState<TagihanChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize supabase client only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseAnonKey) {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
      }
      setIsMounted(true);
    }
  }, []);

  const fetchChartData = useCallback(async () => {
    if (!isMounted || !supabase) return;
    
    try {
      // Fetch data pengaduan untuk pie chart
      const pengaduanData = await fetchPengaduan();
      
      // Group pengaduan by status
      const statusCount = pengaduanData.reduce((acc: Record<string, number>, item: Pengaduan) => {
        acc[item.status_pengaduan] = (acc[item.status_pengaduan] || 0) + 1;
        return acc;
      }, {});

      // Transform untuk pie chart
      const pengaduanChart: PengaduanChartData[] = [
        { 
          name: "Pengajuan Baru", 
          value: statusCount["PengajuanBaru"] || 0, 
          fill: pengaduanColors[0] 
        },
        { 
          name: "Ditangani", 
          value: statusCount["Ditangani"] || 0, 
          fill: pengaduanColors[1] 
        },
        { 
          name: "Selesai", 
          value: statusCount["Selesai"] || 0, 
          fill: pengaduanColors[2] 
        },
      ].filter(item => item.value > 0); // Only show categories with data

      setPengaduanChartData(pengaduanChart);

      // Fetch data tagihan untuk 6 bulan terakhir
      const tagihanChart: TagihanChartData[] = [];
      const currentDate = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const bulan = targetDate.getMonth() + 1;
        const tahun = targetDate.getFullYear();
        
        try {
          const summary = await fetchIuranSummary(bulan, tahun);
          const totalTagihan = summary.jumlahLunas + summary.jumlahBelumLunas;
          const persentase = totalTagihan > 0 
            ? Math.round((summary.jumlahLunas / totalTagihan) * 100)
            : 0;
          
          tagihanChart.push({
            month: `${getMonthName(bulan)} ${tahun}`,
            totalLunas: summary.totalLunas,
            persentase
          });
        } catch (error) {
          console.error(`Error fetching data for ${bulan}/${tahun}:`, error);
          tagihanChart.push({
            month: `${getMonthName(bulan)} ${tahun}`,
            totalLunas: 0,
            persentase: 0
          });
        }
      }

      setTagihanChartData(tagihanChart);

    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    
    setIsLoading(true);
    fetchChartData();

    // Supabase Realtime Subscription
    if (supabase) {
      const subscription = supabase
        .channel("chart_changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "pengaduan" },
          async (payload: unknown) => {
            console.log("Pengaduan changed (Chart):", payload);
            await fetchChartData();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "Tagihan" },
          async (payload: unknown) => {
            console.log("Tagihan changed (Chart):", payload);
            await fetchChartData();
          }
        )
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(subscription);
        }
      };
    }
  }, [fetchChartData, isMounted]);

  const getMonthName = (month: number): string => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    return months[month - 1];
  };

  const formatCurrency = (value: number): string => {
    if (typeof window === 'undefined') return 'Rp 0';
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Show loading skeleton during hydration and data loading
  if (!isMounted || isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px] bg-gray-200 rounded" />
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px] bg-gray-200 rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {/* Left Column - Doughnut Chart: Status Pengaduan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Status Pengaduan Warga</CardTitle>
          <CardDescription className="text-sm">
            Distribusi status pengaduan yang masuk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      return (
                        <div className="bg-white/95 backdrop-blur-sm p-2 sm:p-3 border border-gray-200 rounded-lg shadow-lg max-w-[200px]">
                          <p className="font-semibold text-gray-800 text-sm">
                            {data.name}: {data.value}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={pengaduanChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="40%"
                  outerRadius="70%"
                  label={({ name, value, percent }) => {
                    // Hide labels on very small screens
                    if (typeof window !== 'undefined' && window.innerWidth < 640) {
                      return '';
                    }
                    return `${name}: ${value} (${(percent * 100).toFixed(0)}%)`;
                  }}
                  labelLine={false}
                >
                  {pengaduanChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  iconSize={12}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-3 gap-1 sm:gap-2 text-center">
            <div className="p-1 sm:p-2 bg-red-50 rounded">
              <div className="text-sm sm:text-lg font-bold text-red-600">
                {pengaduanChartData.find(d => d.name === "Pengajuan Baru")?.value || 0}
              </div>
              <div className="text-xs text-red-500">Baru</div>
            </div>
            <div className="p-1 sm:p-2 bg-yellow-50 rounded">
              <div className="text-sm sm:text-lg font-bold text-yellow-600">
                {pengaduanChartData.find(d => d.name === "Ditangani")?.value || 0}
              </div>
              <div className="text-xs text-yellow-500">Proses</div>
            </div>
            <div className="p-1 sm:p-2 bg-blue-50 rounded">
              <div className="text-sm sm:text-lg font-bold text-blue-600">
                {pengaduanChartData.find(d => d.name === "Selesai")?.value || 0}
              </div>
              <div className="text-xs text-blue-500">Selesai</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right Column - Bar Chart: Tagihan 6 Bulan Terakhir */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Riwayat Pembayaran Iuran</CardTitle>
          <CardDescription className="text-sm">
            Total pembayaran iuran 6 bulan terakhir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={tagihanChartData} 
                margin={{ 
                  top: 20, 
                  right: 10, 
                  left: 10, 
                  bottom: 60 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  domain={[0, 15000000]}
                  ticks={[0, 5000000, 10000000, 15000000]}
                  tickFormatter={(value) => {
                    if (value === 0) return '0';
                    if (value === 5000000) return '5M';
                    if (value === 10000000) return '10M';
                    if (value === 15000000) return '15M';
                    return '';
                  }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/95 backdrop-blur-sm p-2 sm:p-3 border border-gray-200 rounded-lg shadow-lg max-w-[250px]">
                          <div className="font-semibold text-gray-800 mb-2 text-sm">{label}</div>
                          <div className="space-y-1">
                            <div className="text-green-600 flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded" />
                              Total: {formatCurrency(data.totalLunas)}
                            </div>
                            <div className="text-blue-600 flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded" />
                              Tingkat Pembayaran: {data.persentase}%
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="totalLunas" 
                  fill="#22c55e" 
                  stroke="none"
                  radius={[4, 4, 0, 0]}
                  name="Total Pembayaran"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-4">
            <div className="text-center p-2 sm:p-3 bg-green-50 rounded">
              <div className="text-sm sm:text-lg font-bold text-green-600 break-all">
                {formatCurrency(tagihanChartData[tagihanChartData.length - 1]?.totalLunas || 0)}
              </div>
              <div className="text-xs text-green-500">Bulan Ini</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-blue-50 rounded">
              <div className="text-sm sm:text-lg font-bold text-blue-600">
                {tagihanChartData[tagihanChartData.length - 1]?.persentase || 0}%
              </div>
              <div className="text-xs text-blue-500">Tingkat Bayar</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
