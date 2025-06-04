"use client"

import { useEffect, useState } from "react"
import { fetchPenghuni } from "./fetcher"
import { DataTable } from "@/components/ui/data-table"
import { FilterCard } from "@/components/ui/filter-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Eye, UserPlus } from "lucide-react"
import DetailModal from "./detail-modal"

interface User {
  id: string;
  email: string;
  username?: string;
  phone?: string;
  cluster?: string;
  nomor_rumah?: string;
  rt?: string;
  rw?: string;
  createdAt: string;
}

interface Penghuni {
  id: string;
  userId: string;
  nama: string;
  nik: string;
  gender: string;
  user: User;
}

const PenghuniPage = () => {
  const [penghuniData, setPenghuniData] = useState<Penghuni[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [rtFilter, setRtFilter] = useState("Semua");
  const [clusterFilter, setClusterFilter] = useState("Semua");
  const [kelaminFilter, setKelaminFilter] = useState("Semua");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPenghuniId, setSelectedPenghuniId] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetchPenghuni();
        if (response && response.data) {
          setPenghuniData(response.data);
        }
      } catch (error) {
        console.error("Gagal memuat data penghuni:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Fungsi untuk membuka modal detail
  const handleOpenDetailModal = (id: string) => {
    setSelectedPenghuniId(id);
    setIsDetailModalOpen(true);
  };

  // Fungsi untuk menutup modal detail
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPenghuniId(null);
  };

  // Filter data
  const filteredData = penghuniData.filter((item) => {
    // Filter pencarian nama
    if (searchQuery && !item.nama.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.nik.includes(searchQuery) &&
        !item.user.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter RT
    if (rtFilter !== "Semua" && item.user.rt !== rtFilter) {
      return false;
    }
    
    // Filter Cluster
    if (clusterFilter !== "Semua" && item.user.cluster !== clusterFilter) {
      return false;
    }
    
    // Filter Jenis Kelamin
    if (kelaminFilter !== "Semua" && item.gender !== kelaminFilter) {
      return false;
    }
    
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      key: "nama",
      header: "Nama",
      render: (penghuni: Penghuni) => (
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
            penghuni.gender === 'laki-laki' 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-pink-100 text-pink-600'
          }`}>
            {penghuni.nama.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{penghuni.nama}</div>
            <div className="text-xs text-gray-500">
              {penghuni.user.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: "rt_rw",
      header: "RT/RW",
      render: (penghuni: Penghuni) => (
        <span>{penghuni.user.rt}/{penghuni.user.rw}</span>
      )
    },
    {
      key: "rumah",
      header: "Rumah",
      render: (penghuni: Penghuni) => (
        <span>
          {penghuni.user.cluster && penghuni.user.nomor_rumah
            ? `${penghuni.user.cluster} No. ${penghuni.user.nomor_rumah}`
            : "Belum diatur"}
        </span>
      )
    },
    {
      key: "gender",
      header: "Jenis Kelamin",
      render: (penghuni: Penghuni) => (
        <span className={`text-xs px-2 py-1 rounded-full ${
          penghuni.gender === 'laki-laki' 
            ? 'bg-blue-100 text-blue-600' 
            : 'bg-pink-100 text-pink-600'
        }`}>
          {penghuni.gender === 'laki-laki' ? 'Pria' : 'Wanita'}
        </span>
      )
    },
    {
      key: "createdAt",
      header: "Tanggal Registrasi",
      render: (penghuni: Penghuni) => (
        <span>{new Date(penghuni.user.createdAt).toLocaleDateString('id-ID')}</span>
      )
    },
    {
      key: "actions",
      header: "Action",
      render: (penghuni: Penghuni) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => handleOpenDetailModal(penghuni.id)}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Warga</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="mr-2 h-4 w-4" />
          Tambah Penghuni
        </Button>
      </div>

      {/* Filter */}
      <FilterCard>
        <div>
          <Input
            placeholder="Cari nama warga..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div>
          <Select onValueChange={setRtFilter} defaultValue="Semua">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="RT" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua RT</SelectItem>
              <SelectItem value="RT01">RT01</SelectItem>
              <SelectItem value="RT02">RT02</SelectItem>
              <SelectItem value="RT03">RT03</SelectItem>
              <SelectItem value="RT04">RT04</SelectItem>
              <SelectItem value="RT05">RT05</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select onValueChange={setClusterFilter} defaultValue="Semua">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Cluster" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua Cluster</SelectItem>
              <SelectItem value="Chaira Town House">Chaira Town House</SelectItem>
              <SelectItem value="Grand Celeste">Grand Celeste</SelectItem>
              <SelectItem value="Calosa">Calosa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select onValueChange={setKelaminFilter} defaultValue="Semua">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Jenis Kelamin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua</SelectItem>
              <SelectItem value="laki-laki">Pria</SelectItem>
              <SelectItem value="perempuan">Wanita</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterCard>

      {/* Table */}
      <DataTable<Penghuni>
        data={currentData}
        columns={columns}
        loading={loading}
        emptyMessage="Tidak ada data penghuni yang sesuai dengan filter"
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredData.length,
          itemsPerPage,
          onPageChange: handlePageChange
        }}
      />

      {/* Modal Detail Penghuni */}
      <DetailModal 
        penghuniId={selectedPenghuniId}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
};

export default PenghuniPage;

