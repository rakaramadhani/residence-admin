"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, PlusCircle, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import ClusterFormModal from "./create-modal";
import { createCluster, deleteCluster, fetchClusters, updateCluster } from "./fetcher";

interface Cluster {
  id: number;
  nama_cluster: string;
  nominal_tagihan: number;
  createdAt: string;
  updatedAt: string;
}

export default function ClusterPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentCluster, setCurrentCluster] = useState<Cluster | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadClusters = async () => {
    setLoading(true);
    try {
      const response = await fetchClusters();
      setClusters(response.data || []);
    } catch (error) {
      console.error("Error loading clusters:", error);
      Swal.fire("Error", "Gagal memuat data cluster", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClusters();
  }, []);

  const handleOpenCreateModal = () => {
    setCurrentCluster(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (cluster: Cluster) => {
    setCurrentCluster(cluster);
    setFormModalOpen(true);
  };

  const handleSubmitCluster = async (data: { nama_cluster: string; nominal_tagihan: number }) => {
    setSubmitting(true);
    try {
      if (currentCluster) {
        // Update existing cluster
        await updateCluster(currentCluster.id, data);
        Swal.fire("Berhasil", "Cluster berhasil diperbarui", "success");
      } else {
        // Create new cluster
        await createCluster(data);
        Swal.fire("Berhasil", "Cluster baru berhasil ditambahkan", "success");
      }
      loadClusters();
      setFormModalOpen(false);
    } catch (error) {
      console.error("Error submitting cluster:", error);
      Swal.fire("Error", "Gagal menyimpan data cluster", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCluster = async (id: number) => {
    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Apakah Anda yakin ingin menghapus cluster ini? Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        await deleteCluster(id);
        Swal.fire("Berhasil", "Cluster berhasil dihapus", "success");
        loadClusters();
      } catch (error) {
        console.error("Error deleting cluster:", error);
        Swal.fire("Error", "Gagal menghapus cluster", "error");
      }
    }
  };

  const filteredClusters = clusters.filter(cluster =>
    cluster.nama_cluster.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredClusters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClusters = filteredClusters.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Cluster</h1>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          {/* Search Input - Takes remaining space on desktop */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
              <Input
                placeholder="Cari cluster..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Filters Row - Flex on desktop, stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            {/* Add Button */}
            <div className="w-full sm:w-auto text-white">
              <Button 
                onClick={handleOpenCreateModal}
                className="w-full sm:w-auto px-3 py-3 bg-[#455AF5] hover:bg-[#455AF5]/90 flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Tambah Cluster</span>
                <span className="sm:hidden">Tambah</span>
              </Button>
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
                  Nama Cluster
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Nominal Tagihan (Rp)
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Tanggal Dibuat
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Terakhir Diperbarui
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-white tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">Memuat data...</p>
                  </td>
                </tr>
              ) : paginatedClusters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {searchQuery ? "Tidak ditemukan cluster yang sesuai" : "Belum ada data cluster"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery ? "Coba kata kunci yang berbeda" : "Tambahkan cluster baru untuk memulai"}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedClusters.map((cluster) => (
                  <tr key={cluster.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cluster.nama_cluster}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rp {cluster.nominal_tagihan.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(cluster.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(cluster.updatedAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(cluster)}
                          className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCluster(cluster.id)}
                          className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-red-300 bg-white text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredClusters.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Showing {paginatedClusters.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredClusters.length)} of {filteredClusters.length} entries
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

      {/* Modal for Create/Edit */}
      <ClusterFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleSubmitCluster}
        initialData={currentCluster ? {
          nama_cluster: currentCluster.nama_cluster,
          nominal_tagihan: currentCluster.nominal_tagihan
        } : undefined}
        loading={submitting}
        title={currentCluster ? "Edit Cluster" : "Tambah Cluster"}
      />
    </div>
  );
}