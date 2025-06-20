'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Modal from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { CheckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Broadcast, updateBroadcast } from './fetcher';
import Image from 'next/image';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  broadcast: Broadcast;
  onSuccess: () => void;
}

export default function ApprovalModal({ isOpen, onClose, broadcast, onSuccess }: ApprovalModalProps) {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (approvalAction: 'approve' | 'reject') => {
    if (approvalAction === 'reject' && !feedback.trim()) {
      setError('Feedback harus diisi untuk penolakan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updateData = {
        status_broadcast: approvalAction === 'approve' ? 'approved' : 'rejected',
        ...(feedback.trim() && { feedback: feedback.trim() })
      };

      await updateBroadcast(broadcast.id, updateData);
      
      setFeedback('');
      setAction(null);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating broadcast:', err);
      setError('Gagal memperbarui status broadcast. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getKategoriBadge = (kategori: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
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

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} title="Approval Broadcast">
      <div className="max-h-[80vh] overflow-y-auto space-y-4">
        {/* Broadcast Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Pembuat Broadcast</h4>
              <div className="text-sm text-gray-900">
                <div className="font-medium">{broadcast.user?.username || 'N/A'}</div>
                <div className="text-gray-600">{broadcast.user?.email || 'N/A'}</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Kategori</h4>
              <Badge className={getKategoriBadge(broadcast.kategori)}>
                {broadcast.kategori}
              </Badge>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Isi Broadcast</h4>
            <div className="text-sm text-gray-900 bg-white p-3 rounded border">
              {broadcast.broadcast}
            </div>
          </div>

          {broadcast.tanggal_acara && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Tanggal Acara</h4>
              <div className="text-sm text-gray-900">
                {formatDate(broadcast.tanggal_acara)}
              </div>
            </div>
          )}

          {broadcast.foto && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Foto</h4>
              <Image 
                width={100}
                height={100}
                src={broadcast.foto} 
                alt="Broadcast foto" 
                className="max-w-full h-32 object-cover rounded border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Status Saat Ini</h4>
              <div className="text-sm">
                <Badge className={
                  broadcast.status_broadcast === 'verifying' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }>
                  {broadcast.status_broadcast}
                </Badge>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Dibuat Pada</h4>
              <div className="text-sm text-gray-900">
                {formatDate(broadcast.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Selection */}
        {!action && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Pilih Tindakan</h4>
            <div className="flex gap-3">
              <Button
                onClick={() => setAction('approve')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Setujui
              </Button>
              <Button
                onClick={() => setAction('reject')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <XCircleIcon className="h-4 w-4 mr-2" />
                Tolak
              </Button>
            </div>
          </div>
        )}

        {/* Feedback Form */}
        {action && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {action === 'approve' ? 'Konfirmasi Persetujuan' : 'Alasan Penolakan'}
            </h4>
            
            {action === 'approve' && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  Anda akan menyetujui broadcast ini untuk dipublikasikan kepada penghuni.
                </p>
              </div>
            )}

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback {action === 'reject' && <span className="text-red-500">*</span>}
              </Label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={
                  action === 'approve' 
                    ? "Tuliskan feedback disini..."
                    : "Tuliskan alasan penolakan disini..."
                }
                rows={3}
              />
              {action === 'reject' && (
                <p className="mt-1 text-xs text-gray-500">
                  Feedback wajib diisi untuk penolakan broadcast
                </p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          {action && (
            <Button
              variant="outline"
              onClick={() => {
                setAction(null);
                setFeedback('');
                setError('');
              }}
              disabled={loading}
            >
              Kembali
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>

          {action && (
            <Button
              onClick={() => handleSubmit(action)}
              disabled={loading}
              className={
                action === 'approve'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {action === 'approve' ? 'Menyetujui...' : 'Menolak...'}
                </>
              ) : (
                action === 'approve' ? 'Setujui' : 'Tolak'
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}