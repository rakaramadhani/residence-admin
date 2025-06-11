 
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BellIcon, Edit, EyeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Tagihan } from "../ipl/tagihan/fetcher";
import ModalDetailTagihan from "../ipl/tagihan/modal-detail";
import UpdateModal from "../pengaduan/update-modal";
import { Tagihan as DashboardTagihan, fetchPengaduan, fetchTagihan, Pengaduan, sendNotification } from "./fetcher";

export function RecentItems() {
  const [tagihanTerbaru, setTagihanTerbaru] = useState<DashboardTagihan[]>([]);
  const [pengaduanTerbaru, setPengaduanTerbaru] = useState<Pengaduan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk modal pengaduan
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedPengaduanId, setSelectedPengaduanId] = useState<string | null>(null);
  
  // State untuk modal tagihan
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState<Tagihan | null>(null);
  const [loadingReminder, setLoadingReminder] = useState(false);

  const bulanOptions = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  const getBulanNama = (bulan: number) => {
    const bulanObj = bulanOptions.find(b => b.value === bulan);
    return bulanObj ? bulanObj.label : bulan.toString();
  };

  // Function to convert DashboardTagihan to Tagihan for modal
  const convertToTagihan = (dashboardTagihan: DashboardTagihan): Tagihan => {
    return {
      ...dashboardTagihan,
      metode_bayar: dashboardTagihan.metode_bayar || 'manual',
      updatedAt: dashboardTagihan.updatedAt || dashboardTagihan.createdAt,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tagihan terbaru menggunakan fetcher
        const tagihanData = await fetchTagihan();
        
        // Filter hanya yang belum lunas dan ambil 3 terbaru
        const belumLunas = tagihanData
          .filter((item: DashboardTagihan) => item.status_bayar === 'belumLunas')
          .sort((a: DashboardTagihan, b: DashboardTagihan) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        setTagihanTerbaru(belumLunas);

        // Fetch pengaduan terbaru menggunakan fetcher
        const pengaduanData = await fetchPengaduan();
        
        // Filter yang PengajuanBaru saja dan ambil 3 terbaru
        const pengajuanBaru = pengaduanData
          .filter((item: Pengaduan) => item.status_pengaduan === 'PengajuanBaru')
          .sort((a: Pengaduan, b: Pengaduan) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3);
        setPengaduanTerbaru(pengajuanBaru);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handler untuk modal pengaduan
  const handleOpenUpdateModal = (id: string) => {
    setSelectedPengaduanId(id);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedPengaduanId(null);
  };

  const handleUpdateSuccess = () => {
    // Refresh data setelah update menggunakan fetcher
    const refreshPengaduanData = async () => {
      try {
        const pengaduanData = await fetchPengaduan();
        
        const pengajuanBaru = pengaduanData
          .filter((item: Pengaduan) => item.status_pengaduan === 'PengajuanBaru')
          .sort((a: Pengaduan, b: Pengaduan) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3);
        setPengaduanTerbaru(pengajuanBaru);
      } catch (error) {
        console.error("Error refreshing pengaduan:", error);
      }
    };
    
    refreshPengaduanData();
  };

  // Handler untuk modal tagihan
  const handleDetailView = (item: DashboardTagihan) => {
    const convertedTagihan = convertToTagihan(item);
    setSelectedTagihan(convertedTagihan);
    setIsModalDetailOpen(true);
  };

  const handleModalDetailUpdate = () => {
    // Refresh data setelah update menggunakan fetcher
    const refreshTagihanData = async () => {
      try {
        const tagihanData = await fetchTagihan();
        
        const belumLunas = tagihanData
          .filter((item: DashboardTagihan) => item.status_bayar === 'belumLunas')
          .sort((a: DashboardTagihan, b: DashboardTagihan) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        setTagihanTerbaru(belumLunas);
      } catch (error) {
        console.error("Error refreshing tagihan:", error);
      }
    };
    
    refreshTagihanData();
  };

  const handleSendReminder = async (tagihan: DashboardTagihan) => {
    // Konfirmasi sebelum mengirim dengan SweetAlert
    const result = await Swal.fire({
      title: 'Kirim Reminder',
      text: `Apakah Anda yakin ingin mengirim reminder pembayaran ke ${tagihan.user?.username || 'pengguna ini'}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Kirim!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    setLoadingReminder(true);
    
    try {
      // Kirim notifikasi ke user spesifik menggunakan fetcher
      const response = await sendNotification({
        userId: tagihan.userId,
        judul: 'Reminder',
        isi: `Reminder: Tagihan IPL untuk bulan ${getBulanNama(tagihan.bulan)} ${tagihan.tahun} belum dibayar. Mohon segera lakukan pembayaran sebesar Rp ${tagihan.nominal.toLocaleString('id-ID')}.`,
        tipe: 'Tagihan IPL'
      });

      if (response.success) {
        await Swal.fire({
          title: 'Berhasil!',
          text: `Reminder berhasil dikirim ke ${tagihan.user?.username || 'pengguna'}.`,
          icon: 'success',
          confirmButtonColor: '#3085d6'
        });
      } else {
        await Swal.fire({
          title: 'Gagal!',
          text: 'Gagal mengirim reminder. Silakan coba lagi.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Terjadi kesalahan saat mengirim reminder. Silakan coba lagi.',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoadingReminder(false);
    }
  };

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
                      <h3 className="font-semibold text-sm">{tagihan.user?.username || tagihan.user?.email || 'Belum Mengisikan'}</h3>
                      <p className="text-xs text-gray-500">{getBulanNama(tagihan.bulan)} {tagihan.tahun}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDetailView(tagihan)}
                        className="h-7 w-7 p-0"
                        title="Lihat Detail"
                      >
                        <EyeIcon className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSendReminder(tagihan)}
                        disabled={loadingReminder}
                        className="h-7 w-7 p-0"
                        title="Kirim Reminder"
                      >
                        <BellIcon className="h-3 w-3" />
                      </Button>
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

      {/* Pengaduan Baru */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaduan Baru</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Memuat data...</div>
          ) : pengaduanTerbaru.length === 0 ? (
            <div className="text-center py-4">Tidak ada pengaduan baru</div>
          ) : (
            <div className="space-y-3">
              {pengaduanTerbaru.map((pengaduan) => (
                <div key={pengaduan.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm">{pengaduan.user?.username || 'N/A'}</h3>
                    <div className="flex items-center gap-2">
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
                  </div>
                  <p className="text-xs text-gray-700 mb-2">{pengaduan.pengaduan}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs px-2 py-1 rounded font-medium bg-yellow-100 text-yellow-800">
                      Pengaduan Baru
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 h-7 text-xs"
                      onClick={() => handleOpenUpdateModal(pengaduan.id)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Tanggapi
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Update Pengaduan */}
      <UpdateModal 
        pengaduanId={selectedPengaduanId}
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        onUpdateSuccess={handleUpdateSuccess}
      />

      {/* Modal Detail Tagihan */}
      <ModalDetailTagihan
        isOpen={isModalDetailOpen}
        onClose={() => setIsModalDetailOpen(false)}
        tagihan={selectedTagihan}
        onUpdate={handleModalDetailUpdate}
      />
    </div>
  );
} 