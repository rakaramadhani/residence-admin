"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Eye, Search, UserPlus } from "lucide-react"
import { useEffect, useState } from "react"
import DetailModal from "./detail-modal"
import { fetchPenghuni } from "./fetcher"

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Warga</h1>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          {/* Search Input - Takes remaining space on desktop */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
              <Input
                placeholder="Cari nama warga..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Filters Row - Flex on desktop, stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            {/* RT Filter */}
            <div className="w-full sm:w-auto">
              <Select onValueChange={setRtFilter} defaultValue="Semua">
                <SelectTrigger className="px-3 py-3 w-full sm:w-auto min-w-[100px]">
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
            
            {/* Cluster Filter */}
            <div className="w-full sm:w-auto">
              <Select onValueChange={setClusterFilter} defaultValue="Semua">
                <SelectTrigger className="px-3 py-3 w-full sm:w-auto min-w-[120px]">
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
            
            {/* Gender Filter */}
            <div className="w-full sm:w-auto">
              <Select onValueChange={setKelaminFilter} defaultValue="Semua">
                <SelectTrigger className="px-3 py-3 w-full sm:w-auto min-w-[100px]">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua Gender</SelectItem>
                  <SelectItem value="laki-laki">Pria</SelectItem>
                  <SelectItem value="perempuan">Wanita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-[16px] overflow-hidden bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#263186]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  RT/RW
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Rumah
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Jenis Kelamin
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Tanggal Registrasi
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">Memuat data...</p>
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data penghuni yang sesuai dengan filter</h3>
                    <p className="mt-1 text-sm text-gray-500">Belum ada data penghuni yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                currentData.map((penghuni) => (
                  <tr key={penghuni.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          penghuni.gender === 'laki-laki' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-pink-100 text-pink-600'
                        }`}>
                          {penghuni.nama.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{penghuni.nama}</div>
                          <div className="text-xs text-gray-500">
                            {penghuni.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {penghuni.user.rt}/{penghuni.user.rw}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {penghuni.user.cluster && penghuni.user.nomor_rumah
                        ? `${penghuni.user.cluster} No. ${penghuni.user.nomor_rumah}`
                        : "Belum diatur"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        penghuni.gender === 'laki-laki' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-pink-100 text-pink-600'
                      }`}>
                        {penghuni.gender === 'laki-laki' ? 'Pria' : 'Wanita'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(penghuni.user.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleOpenDetailModal(penghuni.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Showing {currentData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                let pageToShow = i + 1;
                
                if (totalPages > 3) {
                  if (currentPage <= 2) {
                    pageToShow = i + 1;
                  } else if (currentPage >= totalPages - 1) {
                    pageToShow = totalPages - 2 + i;
                  } else {
                    pageToShow = currentPage - 1 + i;
                  }
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => handlePageChange(pageToShow)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                      pageToShow === currentPage
                        ? 'z-10 bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageToShow}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

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

