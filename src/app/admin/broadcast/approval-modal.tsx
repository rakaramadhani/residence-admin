'use client';

import { CheckIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Broadcast, updateBroadcast } from './fetcher';

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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75" />
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Approval Broadcast
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Broadcast Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
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
                  <span className={getKategoriBadge(broadcast.kategori)}>
                    {broadcast.kategori}
                  </span>
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
                  <img 
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
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      broadcast.status_broadcast === 'verifying' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {broadcast.status_broadcast}
                    </span>
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
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Pilih Tindakan</h4>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setAction('approve')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Setujui
                  </button>
                  <button
                    onClick={() => setAction('reject')}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    Tolak
                  </button>
                </div>
              </div>
            )}

            {/* Feedback Form */}
            {action && (
              <div className="mb-6">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feedback {action === 'reject' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={
                      action === 'approve' 
                        ? "Tuliskan feedback disini..."
                        : "Tuliskan alasan penolakan disini..."
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
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
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              {action && (
                <button
                  onClick={() => {
                    setAction(null);
                    setFeedback('');
                    setError('');
                  }}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Kembali
                </button>
              )}
              
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Batal
              </button>

              {action && (
                <button
                  onClick={() => handleSubmit(action)}
                  disabled={loading}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    action === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  {loading 
                    ? (action === 'approve' ? 'Menyetujui...' : 'Menolak...') 
                    : (action === 'approve' ? 'Setujui' : 'Tolak')
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}