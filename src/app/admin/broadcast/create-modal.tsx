'use client';

import React, { useState } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { createBroadcast } from './fetcher';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateModal({ isOpen, onClose, onSuccess }: CreateModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    kategori: '',
    broadcast: '',
    tanggal_acara: '',
    foto: null as File | null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const kategoriOptions = [
    'Keamanan',
    'Infrastruktur', 
    'Kebersihan',
    'Pelayanan',
    'Kehilangan',
    'Kegiatan',
    'Promosi',
    'Lainnya'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi form
    const newErrors: Record<string, string> = {};
    
    if (!formData.kategori) {
      newErrors.kategori = 'Silakan pilih kategori';
    }
    if (!formData.broadcast.trim()) {
      newErrors.broadcast = 'Isi pengumuman harus diisi';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Prepare data untuk dikirim
      const broadcastData = {
        kategori: formData.kategori,
        broadcast: formData.broadcast.trim(),
        ...(formData.tanggal_acara && { tanggal_acara: formData.tanggal_acara }),
        ...(formData.foto && { foto: formData.foto })
      };

      await createBroadcast(broadcastData);
      
      // Reset form
      setFormData({
        kategori: '',
        broadcast: '',
        tanggal_acara: '',
        foto: null
      });
      setPreviewImage(null);
      setErrors({});
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating broadcast:', error);
      setErrors({ submit: 'Gagal membuat pengumuman. Silakan coba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error ketika user mulai mengetik
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi tipe file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, foto: 'Format file harus JPG, PNG, atau GIF' }));
        return;
      }

      // Validasi ukuran file (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, foto: 'Ukuran file maksimal 5MB' }));
        return;
      }

      setFormData(prev => ({ ...prev, foto: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear error
      if (errors.foto) {
        setErrors(prev => ({ ...prev, foto: '' }));
      }
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, foto: null }));
    setPreviewImage(null);
    // Reset input file
    const fileInput = document.getElementById('foto-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Buat Pengumuman
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.kategori}
                  onChange={(e) => handleInputChange('kategori', e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.kategori ? 'border-red-500' : ''
                  }`}
                  disabled={loading}
                >
                  <option value="">Pilih Kategori</option>
                  {kategoriOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.kategori && (
                  <p className="mt-1 text-sm text-red-600">{errors.kategori}</p>
                )}
              </div>

              {/* Isi Pengumuman */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Isi Pengumuman <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.broadcast}
                  onChange={(e) => handleInputChange('broadcast', e.target.value)}
                  placeholder="Assalamualaikum, sehubungan dengan adanya perbaikan listrik, maka lampu PJU utara mati selama 2 hari."
                  rows={4}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.broadcast ? 'border-red-500' : ''
                  }`}
                  disabled={loading}
                />
                {errors.broadcast && (
                  <p className="mt-1 text-sm text-red-600">{errors.broadcast}</p>
                )}
              </div>

              {/* Tanggal Acara (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Acara (Opsional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.tanggal_acara}
                  onChange={(e) => handleInputChange('tanggal_acara', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              {/* Foto Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foto (Opsional)
                </label>
                
                {!previewImage ? (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="foto-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload foto</span>
                          <input
                            id="foto-upload"
                            name="foto-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={loading}
                          />
                        </label>
                        <p className="pl-1">atau drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF maksimal 5MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      disabled={loading}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                {errors.foto && (
                  <p className="mt-1 text-sm text-red-600">{errors.foto}</p>
                )}
              </div>

              {errors.submit && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {errors.submit}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Membuat...' : 'Buat Pengumuman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
