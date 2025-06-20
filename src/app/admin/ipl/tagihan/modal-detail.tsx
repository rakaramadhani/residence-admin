'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Modal from '@/components/ui/modal';
import { Tagihan } from './fetcher';

interface ModalDetailTagihanProps {
  isOpen: boolean;
  onClose: () => void;
  tagihan: Tagihan | null;
  onUpdate: () => void;
}

export default function ModalDetailTagihan({ 
  isOpen, 
  onClose, 
  tagihan 
}: ModalDetailTagihanProps) {
  const bulanOptions = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  const getBulanNama = (bulan: number) => {
    const bulanObj = bulanOptions.find(b => b.value === bulan);
    return bulanObj ? bulanObj.label : bulan.toString();
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-full";
    if (status === 'lunas') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
  };

  if (!isOpen || !tagihan) return null;

  return (
    <Modal onClose={onClose} title="Informasi Tagihan">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label className="block text-sm font-medium mb-1">Nomor Tagihan</Label>
            <Input value={tagihan.id} readOnly className="bg-gray-50" />
          </div>
          
          <div>
            <Label className="block text-sm font-medium mb-1">Pengguna</Label>
            <Input value={tagihan.user?.username || 'Belum Mengisikan'} readOnly className="bg-gray-50" />
          </div>
          
          <div>
            <Label className="block text-sm font-medium mb-1">Email</Label>
            <Input value={tagihan.user?.email || 'Belum Memiliki Email'} readOnly className="bg-gray-50" />
          </div>
          
          <div>
            <Label className="block text-sm font-medium mb-1">Kontak</Label>
            <Input value={tagihan.user?.phone || 'Belum Mengisikan'} readOnly className="bg-gray-50" />
          </div>
          
          <div>
            <Label className="block text-sm font-medium mb-1">Rumah</Label>
            <Input 
              value={`${tagihan.user?.cluster || ''} No. ${tagihan.user?.nomor_rumah || ''}`} 
              readOnly 
              className="bg-gray-50" 
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium mb-1">Bulan</Label>
            <Input value={`${getBulanNama(tagihan.bulan)} ${tagihan.tahun}`} readOnly className="bg-gray-50" />
          </div>
          
          <div>
            <Label className="block text-sm font-medium mb-1">Nominal Tagihan</Label>
            <Input 
              value={`Rp. ${tagihan.nominal.toLocaleString('id-ID')}`} 
              readOnly 
              className="bg-gray-50 font-semibold" 
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium mb-1">Status Tagihan</Label>
            <Badge className={getStatusBadge(tagihan.status_bayar)}>
              {tagihan.status_bayar === 'lunas' ? 'Lunas' : 'Belum Lunas'}
            </Badge>
          </div>
        </div>

        {/* Footer */}
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
}
