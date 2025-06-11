// src/app/admin/cluster/create-modal.tsx
"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import { useEffect, useState } from "react";

interface ClusterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { nama_cluster: string; nominal_tagihan: number }) => Promise<void>;
  initialData?: { nama_cluster: string; nominal_tagihan: number };
  loading?: boolean;
  title?: string;
}

const ClusterFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading,
  title = "Tambah Cluster",
}: ClusterFormProps) => {
  const [nama, setNama] = useState("");
  const [nominal, setNominal] = useState("");

  useEffect(() => {
    setNama(initialData?.nama_cluster || "");
    setNominal(initialData?.nominal_tagihan?.toString() || "");
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !nominal) return;
    await onSubmit({ nama_cluster: nama, nominal_tagihan: Number(nominal) });
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Nama Cluster</label>
          <Input value={nama} onChange={e => setNama(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Nominal Tagihan</label>
          <Input
            type="number"
            value={nominal}
            onChange={e => setNominal(e.target.value)}
            required
            min={0}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" className="bg-[#455AF5] text-white hover:bg-[#455AF5]/90" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ClusterFormModal;