'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ClockIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { Emergency } from './fetcher';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergency: Emergency | null;
  onSave: (id: string, data: { kategori: string; detail_kejadian: string; status?: string }) => Promise<void>;
}

export default function EmergencyModal({ isOpen, onClose, emergency, onSave }: EmergencyModalProps) {
  const [formData, setFormData] = useState({
    kategori: '',
    detail_kejadian: '',
    status: 'pending'
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

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'ditindaklanjuti', label: 'Ditindaklanjuti', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'selesai', label: 'Selesai', color: 'bg-green-100 text-green-800 border-green-200' }
  ];

  useEffect(() => {
    if (emergency) {
      setFormData({
        kategori: emergency.kategori || '',
        detail_kejadian: emergency.detail_kejadian || '',
        status: emergency.status || 'pending'
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const getCurrentStatusColor = () => {
    const currentStatus = statusOptions.find(s => s.value === formData.status);
    return currentStatus?.color || statusOptions[0].color;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Enhanced Background overlay */}
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Enhanced Modal - Reduced width for better fit */}
        <div className="relative w-full max-w-xl mx-auto bg-white rounded-2xl shadow-2xl transform transition-all overflow-hidden">
          
          {/* Modern Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Detail Kejadian Darurat</h3>
                  <p className="text-red-100 text-sm">Kelola informasi emergency</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Enhanced Content */}
          <div className="p-6 max-h-[75vh] overflow-y-auto">
            {emergency && (
              <>
                {/* Current Status Badge */}
                <div className="mb-6">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getCurrentStatusColor()}`}>
                    Status: {statusOptions.find(s => s.value === formData.status)?.label || 'Pending'}
                  </span>
                </div>

                {/* User Information Card - Compact */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                  <h4 className="flex items-center font-semibold text-gray-900 mb-3">
                    <UserIcon className="h-5 w-5 mr-2 text-gray-600" />
                    Informasi Pelapor
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Nama:</span>
                      <p className="font-medium text-gray-900">{emergency.user?.username || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Cluster:</span>
                      <p className="font-medium text-gray-900">{emergency.user?.cluster || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium text-gray-900 truncate">{emergency.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">No. HP:</span>
                      <p className="font-medium text-gray-900">{emergency.user?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Details Card - Compact */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                  <h4 className="flex items-center font-semibold text-gray-900 mb-3">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-orange-600" />
                    Detail Kejadian
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <span className="text-gray-500">Waktu:</span>
                        <p className="font-medium text-gray-900">{formatDate(emergency.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <span className="text-gray-500">Koordinat:</span>
                        <p className="font-medium text-gray-900">
                          {emergency.latitude.toFixed(4)}, {emergency.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Status and Category in one row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Status Update */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Update Status
                      </label>
                      <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori Kejadian
                      </label>
                      <Select value={formData.kategori} onValueChange={(value) => handleSelectChange('kategori', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {kategoriOptions.map(option => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Incident Details */}
                  <div>
                    <label htmlFor="detail_kejadian" className="block text-sm font-medium text-gray-700 mb-2">
                      Detail Kejadian
                    </label>
                    <textarea
                      id="detail_kejadian"
                      name="detail_kejadian"
                      rows={3}
                      value={formData.detail_kejadian}
                      onChange={handleChange}
                      placeholder="Masukkan detail kejadian darurat..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all duration-200"
                    />
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Menyimpan...
                        </div>
                      ) : (
                        'Simpan Perubahan'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
