'use client';

import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  PencilIcon 
} from '@heroicons/react/24/outline';
import { Emergency } from './fetcher';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergency: Emergency | null;
  onSave: (id: string, data: { kategori: string; detail_kejadian: string }) => Promise<void>;
}

export default function EmergencyModal({ isOpen, onClose, emergency, onSave }: EmergencyModalProps) {
  const [formData, setFormData] = useState({
    kategori: '',
    detail_kejadian: ''
  });
  const [loading, setLoading] = useState(false);

  const kategoriOptions = [
    'Kebakaran',
    'Kecelakaan', 
    'Kesehatan',
    'Keamanan',
    'Bencana Alam',
    'Lainnya'
  ];

  useEffect(() => {
    if (emergency) {
      setFormData({
        kategori: emergency.kategori || '',
        detail_kejadian: emergency.detail_kejadian || ''
      });
    }
  }, [emergency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergency) return;

    setLoading(true);
    try {
      await onSave(emergency.id, formData);
      onClose();
    } catch (error) {
      console.error('Error updating emergency:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <PencilIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <div className="flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Edit Kejadian Darurat
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {emergency && (
                <div className="mt-4">
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Informasi Pelapor:</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Nama:</strong> {emergency.user?.username || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Email:</strong> {emergency.user?.email || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Waktu:</strong> {new Date(emergency.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Lokasi:</strong> {emergency.latitude.toFixed(6)}, {emergency.longitude.toFixed(6)}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="kategori" className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori Kejadian
                      </label>
                      <select
                        id="kategori"
                        name="kategori"
                        value={formData.kategori}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Pilih kategori...</option>
                        {kategoriOptions.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="detail_kejadian" className="block text-sm font-medium text-gray-700 mb-2">
                        Detail Kejadian
                      </label>
                      <textarea
                        id="detail_kejadian"
                        name="detail_kejadian"
                        rows={4}
                        value={formData.detail_kejadian}
                        onChange={handleChange}
                        placeholder="Masukkan detail kejadian..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 resize-none"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
