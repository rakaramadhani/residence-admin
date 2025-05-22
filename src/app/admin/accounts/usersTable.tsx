"use client";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, UserCheck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fetchUsers, verifyUser, deleteUser } from "./fetcher";
import VerifyModal from "./verify-modal";
import Swal from "sweetalert2";

interface User {
  id: string;
  email: string;
  username?: string;
  phone?: string;
  cluster?: string;
  nomor_rumah?: string;
  rt?: string;
  rw?: string;
  isVerified: boolean | null;
  clusterRef?: {
    nama_cluster: string;
  };
  penghuni?: any[];
}

export default function UsersDataLite() {
  const [dataUsers, setDataUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await fetchUsers();
      setDataUsers(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = (user: User) => {
    setSelectedUser(user);
    setVerifyModalOpen(true);
  };

  const handleVerifySubmit = async (userId: string, isVerified: boolean, feedback: string) => {
    try {
      await verifyUser(userId, { isVerified, feedback });
      Swal.fire({
        title: "Berhasil!",
        text: "Status pengguna berhasil diperbarui",
        icon: "success",
      });
      setVerifyModalOpen(false);
      loadUsers();
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Gagal memperbarui status pengguna",
        icon: "error",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Akun ini akan dihapus dan tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(userId);
        Swal.fire({
          title: "Berhasil!",
          text: "Akun berhasil dihapus",
          icon: "success"
        });
        loadUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire({
          title: "Error!",
          text: "Gagal menghapus akun",
          icon: "error"
        });
      }
    }
  };

  // Filter users berdasarkan pencarian
  const filteredUsers = dataUsers.filter(user => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(search) ||
      (user.username || "").toLowerCase().includes(search) ||
      (user.cluster || "").toLowerCase().includes(search) ||
      (user.clusterRef?.nama_cluster || "").toLowerCase().includes(search)
    );
  });
  
  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  
  const goToPage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Daftar Pengguna</h2>
        <Input
          placeholder="Cari pengguna..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Rumah</TableHead>
              <TableHead>Penghuni</TableHead>
              <TableHead>Status Registrasi</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Tidak ada data ditemukan</TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                        {(user.username?.[0] || user.email[0]).toUpperCase()}
                      </div>
                      <div>
                        <div>{user.username || user.email.split("@")[0]}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.phone || "Belum memasukkan nomor telepon"}</TableCell>
                  <TableCell>
                    {user.clusterRef?.nama_cluster || user.cluster || "Grand Calista"} No. {user.nomor_rumah || "162x"}
                  </TableCell>
                  <TableCell>{(user.penghuni?.length || "Belum memasukkan penghuni")}</TableCell>
                  <TableCell>
                    {user.isVerified ? (
                      <Badge className="bg-green-100 text-green-800 border-green-300 px-3 py-1">
                        Terverifikasi
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 px-3 py-1">
                        Belum Diverifikasi
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!user.isVerified && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleVerifyUser(user)}
                          className="border-blue-500 text-blue-500 hover:bg-blue-50"
                        >
                          <UserCheck className="h-3.5 w-3.5 mr-1" /> Verifikasi
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleVerifyUser(user)}
                        className="border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
            // Jika total 3 halaman atau kurang, tampilkan semua
            let pageToShow = i + 1;
            
            // Jika total lebih dari 3, tampilkan halaman sekitar current page
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
                onClick={() => goToPage(pageToShow)}
              >
                {pageToShow}
              </Button>
            );
          })}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>
      
      {verifyModalOpen && (
        <VerifyModal
          isOpen={verifyModalOpen}
          onClose={() => setVerifyModalOpen(false)}
          user={selectedUser}
          onVerify={handleVerifySubmit}
        />
      )}
    </div>
  );
}