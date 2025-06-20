'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { CalendarIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline';
import { Broadcast } from './fetcher';
import Image from 'next/image';

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  broadcast: Broadcast;
}

export default function ViewModal({ isOpen, onClose, broadcast }: ViewModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getKategoriBadge = (kategori: string) => {
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-full";
    switch (kategori) {
      case 'Keamanan':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'Infrastruktur':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Kebersihan':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Pelayanan':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'Kehilangan':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'Kegiatan':
        return `${baseClasses} bg-indigo-100 text-indigo-800`;
      case 'Promosi':
        return `${baseClasses} bg-pink-100 text-pink-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 text-sm font-medium rounded-full";
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'verifying':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'uploaded':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Disetujui';
      case 'verifying':
        return 'Dalam Verifikasi';
      case 'uploaded':
        return 'Telah Diunggah';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} title="Detail Broadcast">
      <div className="max-h-[80vh] overflow-y-auto space-y-6">
        {/* Header Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <TagIcon className="h-6 w-6 text-blue-600" />
              <Badge className={getKategoriBadge(broadcast.kategori)}>
                {broadcast.kategori}
              </Badge>
            </div>
            <Badge className={getStatusBadge(broadcast.status_broadcast)}>
              {getStatusText(broadcast.status_broadcast)}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4" />
              <span>Dibuat: {formatDate(broadcast.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Broadcast Content */}
        <div className="border rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Isi Broadcast</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
              {broadcast.broadcast}
            </p>
          </div>
        </div>

        {/* Event Date */}
        {broadcast.tanggal_acara && (
          <div className="border rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Tanggal Acara
            </h4>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-900 font-medium">
                {formatDate(broadcast.tanggal_acara)}
              </p>
            </div>
          </div>
        )}

        {/* Photo */}
        {broadcast.foto && (
          <div className="border rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Foto</h4>
            <div className="rounded-lg overflow-hidden">
            <Image 
                width={100}
                height={100}
                src={broadcast.foto} 
                alt="Broadcast foto" 
                className="w-full max-h-64 object-cover"
                onError={(e) => {
                  e.currentTarget.parentElement!.innerHTML = 
                    '<div class="bg-gray-100 h-32 flex items-center justify-center text-gray-500">Gagal memuat gambar</div>';
                }}
              />
            </div>
            <div className="mt-2">
              <a 
                href={broadcast.foto} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Lihat ukuran penuh →
              </a>
            </div>
          </div>
        )}

        {/* Feedback */}
        {broadcast.feedback && (
          <div className="border rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Feedback Admin</h4>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">{broadcast.feedback}</p>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-2">
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
