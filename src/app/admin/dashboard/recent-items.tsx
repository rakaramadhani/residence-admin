"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface User {
  id: string;
  username: string;
  email: string;
  cluster?: string;
  nomor_rumah?: string;
}

interface Tagihan {
  id: number;
  userId: string;
  nominal: number;
  status: string;
  jatuh_tempo: string;
  user: User;
}

interface Pengaduan {
  id: string;
  userId: string;
  pengaduan: string;
  kategori: string;
  status_pengaduan: string;
  created_at: string;
  user: User;
}

export function RecentItems() {
  const [tagihanTerbaru, setTagihanTerbaru] = useState<Tagihan[]>([]);
  const [pengaduanTerbaru, setPengaduanTerbaru] = useState<Pengaduan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        console.error("Token not found");
        return;
      }

      try {
        // Fetch tagihan terbaru
        const tagihanResponse = await fetch(
          "http://localhost:5000/api/admin/tagihan/",
          {
            headers: { Authorization: `${token}` },
          }
        );
        
        if (!tagihanResponse.ok) {
          throw new Error("Gagal mengambil data tagihan terbaru");
        }
        
        const tagihanData = await tagihanResponse.json();
        setTagihanTerbaru(tagihanData.data);

        // Fetch pengaduan terbaru
        const pengaduanResponse = await fetch(
          "http://localhost:5000/api/admin/pengaduan/",
          {
            headers: { Authorization: `${token}` },
          }
        );
        
        if (!pengaduanResponse.ok) {
          throw new Error("Gagal mengambil data pengaduan terbaru");
        }
        
        const pengaduanData = await pengaduanResponse.json();
        setPengaduanTerbaru(pengaduanData.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fungsi untuk menghitung hari tersisa
  const calculateDaysLeft = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    
    // Reset jam untuk perbandingan hanya tanggal
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Tagihan Terbaru */}
      <Card>
        <CardHeader>
          <CardTitle>Iuran Bulanan</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Memuat data...</div>
          ) : tagihanTerbaru.length === 0 ? (
            <div className="text-center py-4">Tidak ada tagihan terbaru</div>
          ) : (
            <div className="space-y-4">
              {tagihanTerbaru.map((tagihan) => (
                <div key={tagihan.id} className="border rounded-md p-3 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{tagihan.user?.username || 'Penghuni'}</h3>
                      <p className="text-gray-500 text-sm">{tagihan.user?.cluster} {tagihan.user?.nomor_rumah}</p>
                      <p className="font-semibold text-gray-900">Rp. {tagihan.nominal.toLocaleString('id-ID')}</p>
                    </div>
                    {tagihan.status === "BELUM_LUNAS" && (
                      <div className="text-right">
                        <span className="text-red-500 text-sm font-medium">
                          {calculateDaysLeft(tagihan.jatuh_tempo) > 0 
                            ? `Jatuh tempo ${calculateDaysLeft(tagihan.jatuh_tempo)} hari lagi` 
                            : calculateDaysLeft(tagihan.jatuh_tempo) === 0 
                              ? "Jatuh tempo hari ini" 
                              : "Telah melewati jatuh tempo"}
                        </span>
                        <Button size="sm" variant="outline" className="mt-2 bg-blue-600 text-white hover:bg-blue-700">
                          Ingatkan
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pengaduan Terbaru */}
      <Card>
        <CardHeader>
          <CardTitle>Perlu ditanggapi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Memuat data...</div>
          ) : pengaduanTerbaru.length === 0 ? (
            <div className="text-center py-4">Tidak ada pengaduan terbaru</div>
          ) : (
            <div className="space-y-4">
              {pengaduanTerbaru.map((pengaduan) => (
                <div key={pengaduan.id} className="border rounded-md p-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <h3 className="font-semibold">{pengaduan.user?.username || 'Penghuni'}</h3>
                      <span className="text-sm px-2 py-1 rounded-full" 
                        style={{
                          backgroundColor: 
                            pengaduan.kategori === "Keamanan" ? "rgba(255, 0, 0, 0.1)" :
                            pengaduan.kategori === "Infrastruktur" ? "rgba(138, 43, 226, 0.1)" :
                            pengaduan.kategori === "Kebersihan" ? "rgba(0, 128, 0, 0.1)" :
                            pengaduan.kategori === "Pelayanan" ? "rgba(0, 0, 255, 0.1)" :
                            "rgba(128, 128, 128, 0.1)",
                          color:
                            pengaduan.kategori === "Keamanan" ? "rgb(255, 0, 0)" :
                            pengaduan.kategori === "Infrastruktur" ? "rgb(138, 43, 226)" :
                            pengaduan.kategori === "Kebersihan" ? "rgb(0, 128, 0)" :
                            pengaduan.kategori === "Pelayanan" ? "rgb(0, 0, 255)" :
                            "rgb(128, 128, 128)"
                        }}>
                        {pengaduan.kategori}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{pengaduan.pengaduan}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {pengaduan.status_pengaduan === "PengajuanBaru" ? "Pengaduan Baru" : pengaduan.status_pengaduan}
                      </span>
                      <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                        Tanggapi
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 