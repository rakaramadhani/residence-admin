"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Bar, Legend, BarChart, CartesianGrid, XAxis, LabelList } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

interface ChartData {
  month: string;
  [key: string]: number | string;
}

interface TransformedData {
  [key: string]: ChartData;
}

const chartConfig: ChartConfig = {
  Keamanan: { label: "Keamanan", color: "#FF6384" },
  Infrastruktur: { label: "Infrastruktur", color: "#36A2EB" },
  Kebersihan: { label: "Kebersihan", color: "#FFCE56" },
  Pelayanan: { label: "Pelayanan", color: "#4BC0C0" },
  Lainnya: { label: "Lainnya", color: "#9966FF" },
};

export function Component() {
  const [pengaduanData, setPengaduanData] = useState<PengaduanData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [latestMonth, setLatestMonth] = useState<string>("");
  const [percentageChange, setPercentageChange] = useState<number | null>(null);

  useEffect(() => {
    const fetchPengaduan = async () => {
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
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error ${response.status}: ${errorData.message}`);
        }

        const pengaduan = await response.json();
        setPengaduanData(pengaduan.data);

        // Transformasi data untuk chart
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

        // Set latest month & tahun
        if (chartDataArray.length > 0) {
          setLatestMonth(chartDataArray[chartDataArray.length - 1].month);
        }

        // Hitung persentase perubahan
        if (chartDataArray.length > 1) {
          const prevMonthData = chartDataArray[chartDataArray.length - 2];
          const currentMonthData = chartDataArray[chartDataArray.length - 1];

          const prevTotal = Object.keys(chartConfig).reduce(
            (sum, key) => sum + ((prevMonthData[key] as number) || 0),
            0
          );
          const currentTotal = Object.keys(chartConfig).reduce(
            (sum, key) => sum + ((currentMonthData[key] as number) || 0),
            0
          );

          const change =
            prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;
          setPercentageChange(parseFloat(change.toFixed(2)));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchPengaduan();
  }, []);

  // Filter data berdasarkan tahun & bulan yang dipilih
  const filteredData = chartData.filter((item) => {
    const [year, month] = item.month.split("-");
    return (
      (selectedYear ? year === selectedYear : true) &&
      (selectedMonth ? month === selectedMonth : true) // Jika bulan kosong, tampilkan semua bulan
    );
  });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={new Date().getFullYear().toString()} defaultValue={new Date().getFullYear().toString()}/>
              </SelectTrigger>
              <SelectContent>
                {[...new Set(chartData.map((d) => d.month.split("-")[0]))].map(
                  (year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Pilih Bulan" defaultValue={new Date().getMonth().toString()} />
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

          <ChartContainer config={chartConfig}>
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
        <CardFooter className="flex-col items-start gap-2 text-sm">
          {percentageChange !== null && (
            <p
              className={
                percentageChange >= 0 ? "text-green-600" : "text-red-600"
              }
            >
              Perubahan: {percentageChange}% dibandingkan bulan sebelumnya
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
