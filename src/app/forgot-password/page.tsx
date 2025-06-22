"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setMessage("");
    setError("");
    
    try {
      // Memanggil API backend yang sebenarnya
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://residence-api-production.up.railway.app/api"}/admin/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',   
        },
        mode: "cors",
        body: JSON.stringify({ email: data.email })
      });
  
      const result = await response.json();
  
      if (response.ok) {
        setMessage(result.message);
      } else {
        setError(result.message || "Gagal mengirim permintaan. Silakan coba lagi.");
      }
    } catch (error) {
      console.error('Error:', error);
      setError("Gagal mengirim permintaan. Periksa koneksi internet Anda.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 shadow-md rounded-lg w-[400px] max-w-full border border-gray-200">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Lupa Password</h2>
        <p className="text-sm text-gray-600 mb-6">
          Masukkan alamat email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
        </p>

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
          <form onSubmit={handleSubmit(handleForgotPassword)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="Masukkan email Anda"
                  {...register("email")}
                  className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Tautan Reset"}
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