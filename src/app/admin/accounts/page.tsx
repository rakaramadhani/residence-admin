"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Home, Lock, Mail, MapPin, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { z } from "zod";
import { fetchClusters, fetchUsers } from "./fetcher";
import UsersData from "./users-table";

const Cluster = ["Chaira Town House", "Grand Celeste", "Calosa"];

const RW = ["RW01"];
const RT = ["RT01", "RT02", "RT03", "RT04", "RT05"];

// Schema Validation
const createAccountSchema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
  confirmPassword: z.string().refine(val => val !== "", {
    message: "Konfirmasi password harus diisi",
  }),
  rw: z.string().min(1, { message: "RW wajib diisi" }),
  rt: z.string().min(1, { message: "RT wajib diisi" }),
  nomor_rumah: z.string().min(1, { message: "Nomor rumah wajib diisi" }),
  clusterId: z.union([
    z.number().int().positive(), 
    z.string().transform(val => val === "null" ? null : parseInt(val, 10)),
    z.null()
  ]),
}).refine(data => data.password === data.confirmPassword, {
  message: "Konfirmasi password tidak sesuai",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof createAccountSchema>;

interface Cluster {
  id: number;
  nama_cluster: string;
}
export default function Accounts() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(createAccountSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      rt: "",
      rw: "",
      nomor_rumah: "",
      clusterId: null
    },
  });

  // Get token on client-side
  useEffect(() => {
    setToken(localStorage.getItem("adminToken"));
  }, []);

  
  useEffect(() => {
    const loadClusters = async () => {
      if (!token) {
        console.log("Token not available yet, waiting...");
        return;
      }
      
      try {
        console.log("Fetching clusters with token:", token);
        const result = await fetchClusters();
        console.log("Clusters response:", result);
        
        // Parse response data - sesuaikan dengan format dari API cluster
        let clustersData = [];
        
        if (result.success && Array.isArray(result.data)) {
          clustersData = result.data;
        } else if (Array.isArray(result.data)) {
          clustersData = result.data;
        } else if (Array.isArray(result)) {
          clustersData = result;
        }
        
        console.log("Clusters data:", clustersData);
        setClusters(clustersData);
      } catch (error) {
        console.error("Error loading clusters:", error);
        setError("Gagal memuat data cluster. Silakan refresh halaman.");
      }
    };
    
    loadClusters();
  }, [token]); // Tambahkan token sebagai dependency

  // Handle Submit
  const handleSubmit = async (values: FormValues) => {
    if (!token) {
      setError("Anda belum login atau sesi telah berakhir");
      return;
    }
    
    try {
      const result = await Swal.fire({
        title: "Apakah Anda yakin?",
        text: "Akun ini akan dibuat!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, buat!",
        cancelButtonText: "Batal",
      });
      
      if (!result.isConfirmed) return;
      
      setIsSubmitting(true);
      setError("");

      const requestBody = {
        email: values.email,
        password: values.password,
        rw: values.rw,
        rt: values.rt,
        clusterId: values.clusterId,
        nomor_rumah: values.nomor_rumah,
      };

      console.log("Request Body:", requestBody);
      console.log("Token:", token);

              const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://residence-api-production.up.railway.app/api"}/admin/create-user`,
          {
            method: "POST",
                          headers: {
                "Content-Type": "application/json",
                Authorization: `${token}`,
              },
          mode: "cors",
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      console.log("Response:", data);

      if (response.ok) {
        Swal.fire({
          title: "Berhasil!",
          text: "Akun berhasil dibuat",
          icon: "success",
        });
        form.reset();
        fetchUsers();
      } else {
        setError(data.message || "Gagal membuat akun");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Terjadi kesalahan saat mengirim data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Manajemen Pengguna
        </h1>
        <p className="text-muted-foreground" />
      </div>
      <Tabs defaultValue="create" className="w-full">
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tambah Pengguna</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

<form 
  onSubmit={form.handleSubmit(handleSubmit)}
  className="space-y-8"
>
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Left Column - Credentials */}
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Lock className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Informasi Akun</h3>
          <p className="text-sm text-gray-500">Data login dan keamanan</p>
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            {...form.register("email")}
            className={`pl-10 h-10 transition-all duration-200 ${
              form.formState.errors.email 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password minimal 8 karakter"
            {...form.register("password")}
            className={`pl-10 pr-10 h-10 transition-all duration-200 ${
              form.formState.errors.password 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Retype Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Ulangi password yang sama"
            {...form.register("confirmPassword")}
            className={`pl-10 pr-10 h-10 transition-all duration-200 ${
              form.formState.errors.confirmPassword 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>
    </div>

    {/* Right Column - Address */}
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
        <div className="p-2 bg-green-100 rounded-lg">
          <MapPin className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Informasi Alamat</h3>
          <p className="text-sm text-gray-500">Detail lokasi tempat tinggal</p>
        </div>
      </div>

      {/* RT & RW */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rt" className="text-sm font-medium text-gray-700">RT</Label>
          <Select
            onValueChange={(value) =>
              form.setValue("rt", value, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className={`h-10 transition-all duration-200 ${
              form.formState.errors.rt 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}>
              <SelectValue placeholder="Pilih RT" />
            </SelectTrigger>
            <SelectContent>
              {RT.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.rt && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {form.formState.errors.rt.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="rw" className="text-sm font-medium text-gray-700">RW</Label>
          <Select
            onValueChange={(value) =>
              form.setValue("rw", value, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className={`h-10 transition-all duration-200 ${
              form.formState.errors.rw 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}>
              <SelectValue placeholder="Pilih RW" />
            </SelectTrigger>
            <SelectContent>
              {RW.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.rw && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {form.formState.errors.rw.message}
            </p>
          )}
        </div>
      </div>

      {/* Cluster */}
      <div className="space-y-2">
        <Label htmlFor="clusterId" className="text-sm font-medium text-gray-700">Cluster</Label>
        <Select
          onValueChange={(value) =>
            form.setValue("clusterId", value === "null" ? null : parseInt(value, 10), {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger className={`h-10 transition-all duration-200 ${
            form.formState.errors.clusterId 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}>
            <SelectValue placeholder="Pilih Cluster" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="null">Tidak Ada</SelectItem>
            {clusters.map((cluster) => (
              <SelectItem key={cluster.id} value={cluster.id.toString()}>
                {cluster.nama_cluster}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.clusterId && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {form.formState.errors.clusterId.message}
          </p>
        )}
      </div>

      {/* Nomor Rumah */}
      <div className="space-y-2">
        <Label htmlFor="nomor_rumah" className="text-sm font-medium text-gray-700">Nomor Rumah</Label>
        <div className="relative">
          <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="nomor_rumah"
            type="text"
            placeholder="Contoh: 162x"
            {...form.register("nomor_rumah")}
            className={`pl-10 h-10 transition-all duration-200 ${
              form.formState.errors.nomor_rumah 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
        </div>
        {form.formState.errors.nomor_rumah && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {form.formState.errors.nomor_rumah.message}
          </p>
        )}
      </div>
    </div>
  </div>

  {/* Submit Button */}
  <div className="pt-6 border-t border-gray-200">
    <Button
      type="submit"
      className="px-8 py-3 bg-gradient-to-r bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      disabled={isSubmitting}
    >
      <UserPlus className="mr-2 h-5 w-5" />
      {isSubmitting ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Membuat Akun...
        </div>
      ) : (
        "Buat Akun"
      )}
    </Button>
  </div>
</form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Filter Card for Users */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Daftar Pengguna</h2>
          <div className="text-sm text-gray-500">Kelola dan verifikasi akun pengguna</div>
        </div>
      </div>
      
      <div>
        <UsersData />
      </div>
    </div>
  );
}
