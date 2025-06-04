"use client";

import { useEffect, useState } from "react";
import { Bar, Legend, BarChart, CartesianGrid, XAxis, LabelList, Pie, PieChart, Cell } from "recharts";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PengaduanData {
  created_at: string;
  kategori: string;
}

interface IuranData {
  status_bayar: string;
  nominal: number;
}

interface ChartData {
  month: string;
  [key: string]: number | string;
}

interface TransformedData {
  [key: string]: ChartData;
}

interface PieChartData {
  name: string;
  value: number;
  fill: string;
}

const chartConfig: ChartConfig = {
  Keamanan: { label: "Keamanan", color: "#FF6384" },
  Infrastruktur: { label: "Infrastruktur", color: "#36A2EB" },
  Kebersihan: { label: "Kebersihan", color: "#FFCE56" },
  Pelayanan: { label: "Pelayanan", color: "#4BC0C0" },
  Lainnya: { label: "Lainnya", color: "#9966FF" },
};

const pieColors = ["#6366f1", "#ef4444"]; // Blue for Tepat Waktu, Red for Terlambat

export function Component() {
  const [pengaduanData, setPengaduanData] = useState<PengaduanData[]>([]);
  const [iuranData, setIuranData] = useState<IuranData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [pieChartData, setPieChartData] = useState<PieChartData[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [latestMonth, setLatestMonth] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        console.error("Token not found");
        return;
      }
      
      try {
        // Fetch pengaduan data
        const pengaduanResponse = await fetch(
          "http://localhost:5000/api/admin/pengaduan",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        );

        if (!pengaduanResponse.ok) {
          throw new Error(`Error ${pengaduanResponse.status}`);
        }

        const pengaduan = await pengaduanResponse.json();
        setPengaduanData(pengaduan.data);

        // Transformasi data pengaduan untuk chart
        const transformedData: TransformedData =
          pengaduan.data.reduce((acc: TransformedData, item: PengaduanData) => {
            const month = item.created_at.slice(0, 7); // Format YYYY-MM
            if (!acc[month]) {
              acc[month] = { month };
            }
            acc[month][item.kategori] = (acc[month][item.kategori] as number || 0) + 1;
            return acc;
          }, {});

        const chartDataArray = Object.values(transformedData);
        setChartData(chartDataArray);

        // Set latest month
        if (chartDataArray.length > 0) {
          setLatestMonth(chartDataArray[chartDataArray.length - 1].month);
        }

        // Fetch tagihan data untuk pie chart
        const tagihanResponse = await fetch(
          "http://localhost:5000/api/admin/tagihan",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        );

        if (!tagihanResponse.ok) {
          throw new Error(`Error ${tagihanResponse.status}`);
        }

        const tagihan = await tagihanResponse.json();
        setIuranData(tagihan.data);

        // Transform data untuk pie chart
        const lunas = tagihan.data.filter((item: IuranData) => item.status_bayar === 'lunas').length;
        const belumLunas = tagihan.data.filter((item: IuranData) => item.status_bayar === 'belumLunas').length;

        setPieChartData([
          { name: "Tepat Waktu", value: lunas, fill: pieColors[0] },
          { name: "Terlambat", value: belumLunas, fill: pieColors[1] },
        ]);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Filter data berdasarkan tahun & bulan yang dipilih
  const filteredData = chartData.filter((item) => {
    const [year, month] = item.month.split("-");
    return (
      (selectedYear ? year === selectedYear : true) &&
      (selectedMonth ? month === selectedMonth : true)
    );
  });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Grafik Pembayaran Iuran Warga */}
      <Card>
        <CardHeader>
          <CardTitle>Grafik Pembayaran Iuran Warga</CardTitle>
          <CardDescription>
            Status pembayaran iuran warga
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Bulanan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bulanan">Bulanan</SelectItem>
                <SelectItem value="tahunan">Tahunan</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Januari" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { nama: "Januari", bulan: "01" },
                  { nama: "Februari", bulan: "02" },
                  { nama: "Maret", bulan: "03" },
                  { nama: "April", bulan: "04" },
                  { nama: "Mei", bulan: "05" },
                  { nama: "Juni", bulan: "06" },
                  { nama: "Juli", bulan: "07" },
                  { nama: "Agustus", bulan: "08" },
                  { nama: "September", bulan: "09" },
                  { nama: "Oktober", bulan: "10" },
                  { nama: "November", bulan: "11" },
                  { nama: "Desember", bulan: "12" },
                ].map((month) => (
                  <SelectItem key={month.bulan} value={month.bulan}>
                    {month.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ChartContainer config={{}} className="h-[300px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Grafik Pengaduan Warga */}
      <Card>
        <CardHeader>
          <CardTitle>Grafik Pengaduan Warga</CardTitle>
          <CardDescription>
            Data berdasarkan kategori untuk bulan {latestMonth || "N/A"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Bulanan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bulanan">Bulanan</SelectItem>
                <SelectItem value="tahunan">Tahunan</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Januari" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { nama: "Januari", bulan: "01" },
                  { nama: "Februari", bulan: "02" },
                  { nama: "Maret", bulan: "03" },
                  { nama: "April", bulan: "04" },
                  { nama: "Mei", bulan: "05" },
                  { nama: "Juni", bulan: "06" },
                  { nama: "Juli", bulan: "07" },
                  { nama: "Agustus", bulan: "08" },
                  { nama: "September", bulan: "09" },
                  { nama: "Oktober", bulan: "10" },
                  { nama: "November", bulan: "11" },
                  { nama: "Desember", bulan: "12" },
                ].map((month) => (
                  <SelectItem key={month.bulan} value={month.bulan}>
                    {month.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart accessibilityLayer data={filteredData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              {Object.keys(chartConfig).map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={chartConfig[key].color}
                  radius={4}
                >
                  <LabelList dataKey={key} position="top" />
                </Bar>
              ))}
              <Legend />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
