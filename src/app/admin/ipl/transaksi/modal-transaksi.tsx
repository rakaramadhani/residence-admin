"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/ui/modal";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { fetchDetailTransaksi, Transaksi } from "./fetcher";

interface TransaksiModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaksiId: string | null;
}

const TransaksiModal = ({ isOpen, onClose, transaksiId }: TransaksiModalProps) => {
  const [transaksi, setTransaksi] = useState<Transaksi | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTransaksiDetail = useCallback(async () => {
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
  }, [transaksiId]);

  useEffect(() => {
    if (isOpen && transaksiId) {
      loadTransaksiDetail();
    }
  }, [isOpen, transaksiId, loadTransaksiDetail]);

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
    <Modal onClose={onClose} title="Detail Transaksi">
      <div className="max-h-[80vh] overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Memuat detail transaksi...</p>
          </div>
        ) : transaksi ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Informasi Transaksi</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm text-gray-500 mb-1">ID Transaksi</Label>
                  <Input value={transaksi.id} readOnly className="bg-gray-50 font-mono text-xs" />
                </div>
                <div>
                  <Label className="block text-sm text-gray-500 mb-1">Order ID</Label>
                  <Input value={transaksi.orderId} readOnly className="bg-gray-50 font-mono text-xs" />
                </div>
                <div>
                  <Label className="block text-sm text-gray-500 mb-1">Waktu</Label>
                  <Input value={formatDate(transaksi.transactionTime)} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label className="block text-sm text-gray-500 mb-1">Nominal</Label>
                  <Input value={formatCurrency(transaksi.grossAmount)} readOnly className="bg-gray-50 font-semibold" />
                </div>
                <div>
                  <Label className="block text-sm text-gray-500 mb-1">Metode</Label>
                  <Input value={transaksi.paymentType} readOnly className="bg-gray-50 capitalize" />
                </div>
                <div>
                  <Label className="block text-sm text-gray-500 mb-1">Status</Label>
                  <Input value={transaksi.transactionStatus} readOnly className="bg-gray-50 capitalize" />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Informasi Pengguna</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm text-gray-500 mb-1">Username</Label>
                  <Input value={transaksi.order.user.username} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label className="block text-sm text-gray-500 mb-1">Email</Label>
                  <Input value={transaksi.order.user.email} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label className="block text-sm text-gray-500 mb-1">Telepon</Label>
                  <Input value={transaksi.order.user.phone} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label className="block text-sm text-gray-500 mb-1">Cluster</Label>
                  <Input value={transaksi.order.user.cluster} readOnly className="bg-gray-50" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Data transaksi tidak ditemukan</p>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TransaksiModal;
