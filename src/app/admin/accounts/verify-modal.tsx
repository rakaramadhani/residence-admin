"use client"
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

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

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onVerify: (userId: string, isVerified: boolean, feedback: string) => Promise<void>;
}

const VerifyModal = ({ isOpen, onClose, user, onVerify }: VerifyModalProps) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  
  useEffect(() => {
    if (user) {
      setFeedback(user.feedback || "");
      setIsVerified(user.isVerified === true);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleVerify = async () => {
    setLoading(true);
    try {
      await onVerify(user.id, isVerified, feedback);
    } catch (error) {
      console.error("Error verifying user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Data penghuni dari API
  const penghuni = user.penghuni || [];

  return (
    <Modal onClose={onClose} title="Verifikasi Akun">
      <div className="space-y-6 overflow-scroll h-[500px] p-4">
        {/* Informasi Akun */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Informasi Akun</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Email</label>
                <Input value={user.email} readOnly className="bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Nomor HP</label>
                <Input value={user.phone || "08123172138"} readOnly className="bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Cluster</label>
                <Select defaultValue={user.clusterId?.toString() || ''} disabled>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={user.clusterRef?.nama_cluster || user.cluster || "Grand Calista"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Grand Calista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Nomor</label>
                <Input value={user.nomor_rumah || "162x"} readOnly className="bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500">RT</label>
                <Input value={user.rt || "RT02"} readOnly className="bg-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500">RW</label>
                <Input value={user.rw || "RW01"} readOnly className="bg-white" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Feedback */}
        <div>
          <label className="text-sm text-gray-500 block mb-2">Feedback (Opsional)</label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Berikan catatan tentang verifikasi ini (opsional)"
            className="w-full bg-white"
            rows={2}
          />
        </div>
        
        {/* Informasi Penghuni */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Informasi Penghuni</h3>
          {penghuni.length > 0 ? (
            penghuni.map((p, index) => (
              <div key={p.id} className="bg-gray-50 p-4 rounded-md space-y-4 mb-4">
                <h4 className="text-sm font-medium">Penghuni {index + 1}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">Nama</label>
                    <Input value={p.nama} readOnly className="bg-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">NIK</label>
                    <Input value={p.nik} readOnly className="bg-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">Jenis Kelamin</label>
                    <Input value={p.gender} readOnly className="bg-white" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 p-4 rounded-md text-center">
              <p className="text-sm text-gray-500">Belum ada data penghuni</p>
            </div>
          )}
        </div>
        
        {/* Status Verifikasi */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="verifikasi" 
            checked={isVerified}
            onCheckedChange={(checked) => setIsVerified(checked as boolean)}
          />
          <label htmlFor="verifikasi" className="text-sm font-medium cursor-pointer">
            Setujui Registrasi
          </label>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-gray-300"
          >
            Batal
          </Button>
          <Button
            onClick={handleVerify}
            disabled={loading}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Check className="h-4 w-4 mr-1" />
            Simpan
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default VerifyModal;