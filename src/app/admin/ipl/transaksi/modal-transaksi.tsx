"use client";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchDetailTransaksi, Transaksi } from "./fetcher";

interface TransaksiModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaksiId: string | null;
}

const TransaksiModal = ({ isOpen, onClose, transaksiId }: TransaksiModalProps) => {
  const [transaksi, setTransaksi] = useState<Transaksi | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && transaksiId) {
      loadTransaksiDetail();
    }
  }, [isOpen, transaksiId]);

  const loadTransaksiDetail = async () => {
    if (!transaksiId) return;
    
    setLoading(true);
    try {
      const response = await fetchDetailTransaksi(transaksiId);
      if (response.data) {
        setTransaksi(response.data);
      }
    } catch (error) {
      console.error("Error loading transaksi detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(parseInt(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold">Detail Transaksi</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 rounded-full mx-auto" />
              <p className="mt-2 text-gray-500">Memuat detail transaksi...</p>
            </div>
          ) : transaksi ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Informasi Transaksi</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">ID Transaksi:</span>
                    <p className="font-mono">{transaksi.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Order ID:</span>
                    <p className="font-mono">{transaksi.orderId}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Waktu:</span>
                    <p>{formatDate(transaksi.transactionTime)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Nominal:</span>
                    <p className="font-semibold">{formatCurrency(transaksi.grossAmount)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Metode:</span>
                    <p className="capitalize">{transaksi.paymentType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p className="capitalize">{transaksi.transactionStatus}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Informasi Pengguna</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Username:</span>
                    <p>{transaksi.order.user.username}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p>{transaksi.order.user.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Telepon:</span>
                    <p>{transaksi.order.user.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Cluster:</span>
                    <p>{transaksi.order.user.cluster}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Data transaksi tidak ditemukan</p>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransaksiModal;
