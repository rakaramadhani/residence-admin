"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"], // path to show error
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    // Ambil token dari URL query parameter
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      console.log("Token reset password ditemukan:", tokenFromUrl);
    } else {
      setError("Token reset password tidak ditemukan. Pastikan Anda mengakses halaman ini melalui link yang dikirim ke email Anda.");
    }
  }, [searchParams]);

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setError("");
    setMessage("");

    if (!token) {
      setError("Token tidak valid. Silakan minta reset password ulang.");
      return;
    }

    try {
      // Memanggil API backend untuk reset password
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://residence-api-production.up.railway.app/api"}/admin/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: "cors",
        body: JSON.stringify({ 
          token,
          password: data.password 
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message + " Anda akan diarahkan ke halaman login.");
        setTimeout(() => router.push("/admin/login"), 3000);
      } else {
        setError(result.message || "Gagal mengubah password. Silakan coba lagi.");
      }
    } catch (error) {
      console.error('Error:', error);
      setError("Gagal mengubah password. Periksa koneksi internet Anda.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 shadow-md rounded-lg w-[400px] max-w-full border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Atur Ulang Password</h2>

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
            {error}
          </div>
        )}
        
        {!message && (
        <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Password Baru
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Masukkan password baru"
                className="pl-10 pr-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Konfirmasi Password Baru
            </label>
             <div className="relative">
               <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Konfirmasi password baru"
                className="pl-10 pr-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                disabled={isSubmitting}
              />
               <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Password Baru"}
          </button>
        </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/admin/login" className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-2">
            <ArrowLeft size={16} />
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gray-50">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
} 