"use client";
import { useState, useEffect } from "react";
import { fetchClusters, createCluster, updateCluster, deleteCluster } from "./fetcher";
import ClusterFormModal from "./create-modal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Edit2, Trash2, Search } from "lucide-react";
import Swal from "sweetalert2";

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Cluster</h1>
        <Button 
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Cluster
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari cluster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clusters List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Cluster Perumahan</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-6">Memuat data...</div>
          ) : filteredClusters.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              {searchQuery ? "Tidak ditemukan cluster yang sesuai" : "Belum ada data cluster"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Cluster</TableHead>
                  <TableHead>Nominal Tagihan (Rp)</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead>Terakhir Diperbarui</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClusters.map((cluster) => (
                  <TableRow key={cluster.id}>
                    <TableCell className="font-medium">{cluster.nama_cluster}</TableCell>
                    <TableCell>{cluster.nominal_tagihan.toLocaleString("id-ID")}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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