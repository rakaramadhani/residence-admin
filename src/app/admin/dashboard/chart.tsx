"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { createClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, XAxis, YAxis } from "recharts";
import { fetchIuranSummary, fetchPengaduan, Pengaduan } from "./fetcher";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not defined");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
const pengaduanConfig: ChartConfig = {
  PengajuanBaru: { label: "Pengajuan Baru", color: "#ff6b6b" },
  Ditangani: { label: "Ditangani", color: "#feca57" },
  Selesai: { label: "Selesai", color: "#48dbfb" },
};

export function Component() {
  const [pengaduanChartData, setPengaduanChartData] = useState<PengaduanChartData[]>([]);
  const [tagihanChartData, setTagihanChartData] = useState<TagihanChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChartData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchChartData();

    // Supabase Realtime Subscription
    const subscription = supabase
      .channel("chart_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pengaduan" },
        async (payload) => {
          console.log("Pengaduan changed (Chart):", payload);
          await fetchChartData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Tagihan" },
        async (payload) => {
          console.log("Tagihan changed (Chart):", payload);
          await fetchChartData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchChartData]);

  const getMonthName = (month: number): string => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    return months[month - 1];
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-gray-200 rounded" />
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-gray-200 rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Left Column - Doughnut Chart: Status Pengaduan */}
      <Card>
        <CardHeader>
          <CardTitle>Status Pengaduan Warga</CardTitle>
          <CardDescription>
            Distribusi status pengaduan yang masuk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pengaduanConfig} className="h-[300px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={pengaduanChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                label={({ name, value, percent }) => 
                  `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {pengaduanChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ChartContainer>
          
          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-red-50 rounded">
              <div className="text-lg font-bold text-red-600">
                {pengaduanChartData.find(d => d.name === "Pengajuan Baru")?.value || 0}
              </div>
              <div className="text-xs text-red-500">Baru</div>
            </div>
            <div className="p-2 bg-yellow-50 rounded">
              <div className="text-lg font-bold text-yellow-600">
                {pengaduanChartData.find(d => d.name === "Ditangani")?.value || 0}
              </div>
              <div className="text-xs text-yellow-500">Proses</div>
            </div>
            <div className="p-2 bg-blue-50 rounded">
              <div className="text-lg font-bold text-blue-600">
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
          <CardTitle>Riwayat Pembayaran Iuran</CardTitle>
          <CardDescription>
            Total pembayaran iuran 6 bulan terakhir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px]">
            <BarChart data={tagihanChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                domain={[0, 'dataMax + 50000000']}
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `${(value / 1000000).toFixed(0)}M`;
                  } else if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}K`;
                  }
                  return value.toString();
                }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={{ stroke: '#e2e8f0' }}
              />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white/95 backdrop-blur-sm p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-800 mb-2">{label}</p>
                        <div className="space-y-1">
                          <p className="text-green-600 flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded" />
                            Total: {formatCurrency(data.totalLunas)}
                          </p>
                          <p className="text-blue-600 flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded" />
                            Tingkat Pembayaran: {data.persentase}%
                          </p>
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
                radius={[6, 6, 0, 0]}
                name="Total Pembayaran"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              />
            </BarChart>
          </ChartContainer>

          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(tagihanChartData[tagihanChartData.length - 1]?.totalLunas || 0)}
              </div>
              <div className="text-xs text-green-500">Bulan Ini</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-lg font-bold text-blue-600">
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
