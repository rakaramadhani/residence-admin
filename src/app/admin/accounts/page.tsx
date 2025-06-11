"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { z } from "zod";
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
      try {
        const result = await fetchClusters();
        setClusters(result.data || []);
      } catch (error) {
        console.error("Error loading clusters:", error);
      }
    };
    
    loadClusters();
  }, []);

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
        "http://localhost:5000/api/admin/create-user",
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
  className="space-y-6"
>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-x-12 flex">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••••••"
                        {...form.register("password")}
                        className="md:w-full"
                      />
                      {form.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••••••"
                        {...form.register("confirmPassword")}
                        className="md:w-full"
                      />
                      {form.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rw">RW</Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("rw", value, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="RW" />
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
                      <p className="text-sm text-destructive">
                        {form.formState.errors.rw.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rt">RT</Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("rt", value, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="RT" />
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
                      <p className="text-sm text-destructive">
                        {form.formState.errors.rt.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clusterId">Cluster</Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("clusterId", value === "null" ? null : parseInt(value, 10), {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
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
                      <p className="text-sm text-destructive">
                        {form.formState.errors.clusterId.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nomor_rumah">Nomor Rumah</Label>
                    <Input
                      id="nomor_rumah"
                      type="text"
                      placeholder="162x"
                      {...form.register("nomor_rumah")}
                    />
                    {form.formState.errors.nomor_rumah && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.nomor_rumah.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-blue-500"
                  disabled={isSubmitting}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Creating..." : "Create User"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div>
        <UsersData />
      </div>
    </div>
  );
}
