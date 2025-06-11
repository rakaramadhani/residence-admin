"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        <div className="flex gap-6 items-center w-full">
          {/* Search Input - Takes remaining space */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari cluster..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 px-3 py-3 w-full"
              />
            </div>
          </div>
          
          {/* Add Button */}
          <div className="w-40">
            <Button 
              onClick={handleOpenCreateModal}
              className="w-full px-3 py-3 bg-[#455AF5] hover:bg-[#455AF5]/90 flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Tambah Cluster
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-hidden bg-white shadow">
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <h3 className="text-lg font-semibold">Daftar Cluster Perumahan</h3>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Nama Cluster</TableHead>
              <TableHead className="font-semibold">Nominal Tagihan (Rp)</TableHead>
              <TableHead className="font-semibold">Tanggal Dibuat</TableHead>
              <TableHead className="font-semibold">Terakhir Diperbarui</TableHead>
              <TableHead className="font-semibold text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Memuat data...</TableCell>
              </TableRow>
            ) : paginatedClusters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  {searchQuery ? "Tidak ditemukan cluster yang sesuai" : "Belum ada data cluster"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedClusters.map((cluster) => (
                <TableRow key={cluster.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{cluster.nama_cluster}</TableCell>
                  <TableCell>RP. {cluster.nominal_tagihan.toLocaleString("id-ID")}</TableCell>
                  <TableCell>{new Date(cluster.createdAt).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell>{new Date(cluster.updatedAt).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditModal(cluster)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCluster(cluster.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        {filteredClusters.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Showing {paginatedClusters.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredClusters.length)} of {filteredClusters.length} entries
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
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
                  <Button 
                    key={i} 
                    variant={currentPage === pageToShow ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageToShow)}
                    className={currentPage === pageToShow ? "bg-blue-600 text-white" : ""}
                  >
                    {pageToShow}
                  </Button>
                );
              })}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </Button>
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