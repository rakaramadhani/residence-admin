"use client";
import { Input } from "@/components/ui/input";
import { Edit, Search, Trash2, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { deleteUser, fetchUserDetail, fetchUsers, verifyUser } from "./fetcher";
import VerifyModal from "./verify-modal";

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
  feedback?: string;
  clusterId?: number;
  clusterRef?: {
    id: number;
    nama_cluster: string;
  };
  penghuni?: Array<{
    id: string;
    nama: string;
    nik: string;
    gender: string;
  }>;
}

export default function UsersDataLite() {
  const [dataUsers, setDataUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
  
  const handleVerifyUser = async (user: User) => {
    try {
      // Fetch detailed user data including penghuni
      const detailResult = await fetchUserDetail(user.id);
      const detailedUser = detailResult.data || user;
      
      setSelectedUser(detailedUser);
      setVerifyModalOpen(true);
    } catch (error) {
      console.error("Error fetching user detail:", error);
      // Fallback to original user data if detail fetch fails
      setSelectedUser(user);
      setVerifyModalOpen(true);
    }
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
    } catch {
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
          } catch (err) {
      console.error("Error deleting user:", err);
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
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Avatar color function for consistency
  const getAvatarColor = (username: string) => {
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", 
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-gray-500"
    ];
    const index = (username || "U").charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-6">
      {/* Filter Card */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          {/* Search Input - Takes remaining space on desktop */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
              <Input
                placeholder="Cari pengguna..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
                  Pengguna
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Kontak
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Alamat
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-white tracking-wider">
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
            ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data pengguna</h3>
                    <p className="mt-1 text-sm text-gray-500">Belum ada data pengguna yang ditemukan.</p>
                  </td>
                </tr>
            ) : (
              paginatedUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 ${getAvatarColor(user.username || user.email)} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                          {(user.username?.[0] || user.email[0]).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username || user.email.split("@")[0]}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.phone || "Belum diatur"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.clusterRef?.nama_cluster || user.cluster || "Belum diatur"} 
                      {user.nomor_rumah && ` No. ${user.nomor_rumah}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isVerified 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.isVerified ? 'Terverifikasi' : 'Belum Diverifikasi'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleVerifyUser(user)}
                          className={`h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border ${
                            user.isVerified 
                              ? 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50' 
                              : 'border-blue-300 bg-white text-blue-600 hover:bg-blue-50'
                          }`}
                          title={user.isVerified ? "Edit" : "Verifikasi"}
                        >
                          {user.isVerified ? <Edit className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-red-300 bg-white text-red-600 hover:bg-red-50"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Showing {paginatedUsers.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} entries
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