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
  id: string;
  userId: string;
  nominal: number;
  status_bayar: string;
  bulan: number;
  tahun: number;
  createdAt: string;
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
        // Filter hanya yang belum lunas dan ambil 3 terbaru
        const belumLunas = tagihanData.data
          .filter((item: Tagihan) => item.status_bayar === 'belumLunas')
          .sort((a: Tagihan, b: Tagihan) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        setTagihanTerbaru(belumLunas);

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
        // Filter yang perlu ditanggapi dan ambil 3 terbaru
        const perluTanggapi = pengaduanData.data
          .filter((item: Pengaduan) => item.status_pengaduan === 'PengajuanBaru' || item.status_pengaduan === 'Ditangani')
          .sort((a: Pengaduan, b: Pengaduan) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3);
        setPengaduanTerbaru(perluTanggapi);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Iuran Bulanan */}
      <Card>
        <CardHeader>
          <CardTitle>Iuran Bulanan</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Memuat data...</div>
          ) : tagihanTerbaru.length === 0 ? (
            <div className="text-center py-4">Tidak ada tagihan yang belum lunas</div>
          ) : (
            <div className="space-y-3">
              {tagihanTerbaru.map((tagihan) => (
                <div key={tagihan.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{tagihan.user?.username || 'N/A'}</h3>
                    </div>
                    <div className="text-right">
                      {/* <div className="mt-2">
                        <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white">
                          Ingatkan
                        </Button>
                      </div> */}
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-sm font-semibold">Rp {tagihan.nominal.toLocaleString('id-ID')}</p>
                    <p className="text-xs text-red-600 font-medium">Belum Lunas</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Perlu ditanggapi */}
      <Card>
        <CardHeader>
          <CardTitle>Perlu ditanggapi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Memuat data...</div>
          ) : pengaduanTerbaru.length === 0 ? (
            <div className="text-center py-4">Tidak ada pengaduan yang perlu ditanggapi</div>
          ) : (
            <div className="space-y-3">
              {pengaduanTerbaru.map((pengaduan) => (
                <div key={pengaduan.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm">{pengaduan.user?.username || 'N/A'}</h3>
                    <span 
                      className="text-xs px-2 py-1 rounded font-medium"
                      style={{
                        backgroundColor: 
                          pengaduan.kategori === "Keamanan" ? "#fff3cd" :
                          pengaduan.kategori === "Infrastruktur" ? "#e2e3ff" :
                          pengaduan.kategori === "Kebersihan" ? "#d1ecf1" :
                          pengaduan.kategori === "Pelayanan" ? "#d4edda" :
                          "#f8f9fa",
                        color:
                          pengaduan.kategori === "Keamanan" ? "#856404" :
                          pengaduan.kategori === "Infrastruktur" ? "#3d348b" :
                          pengaduan.kategori === "Kebersihan" ? "#0c5460" :
                          pengaduan.kategori === "Pelayanan" ? "#155724" :
                          "#495057"
                      }}
                    >
                      {pengaduan.kategori}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mb-2">{pengaduan.pengaduan}</p>
                  <div className="flex justify-between items-center">
                    <span 
                      className="text-xs px-2 py-1 rounded font-medium"
                      style={{
                        backgroundColor: pengaduan.status_pengaduan === "PengajuanBaru" ? "#fff3cd" : "#d1ecf1",
                        color: pengaduan.status_pengaduan === "PengajuanBaru" ? "#856404" : "#0c5460"
                      }}
                    >
                      {pengaduan.status_pengaduan === "PengajuanBaru" ? "Pengaduan Baru" : pengaduan.status_pengaduan}
                    </span>
                    {/* <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white">
                      Tanggapi
                    </Button> */}
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