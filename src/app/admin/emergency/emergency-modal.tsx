'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Modal from '@/components/ui/modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    ClockIcon,
    ExclamationTriangleIcon,
    MapPinIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
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
    <Modal onClose={onClose} title="Detail Kejadian Darurat">
      <div className="max-h-[80vh] overflow-y-auto space-y-4">
        {emergency && (
          <>
            {/* Current Status Badge */}
            <div className="mb-4">
              <Badge className={getCurrentStatusColor()}>
                Status: {statusOptions.find(s => s.value === formData.status)?.label || 'Pending'}
              </Badge>
            </div>

            {/* User Information Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
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

            {/* Emergency Details Card */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Status and Category in one row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Status Update */}
                <div>
                  <Label className="block text-sm font-medium mb-2">
                    Update Status
                  </Label>
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
                  <Label className="block text-sm font-medium mb-2">
                    Kategori Kejadian
                  </Label>
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
                <Label htmlFor="detail_kejadian" className="block text-sm font-medium mb-2">
                  Detail Kejadian
                </Label>
                <Textarea
                  id="detail_kejadian"
                  name="detail_kejadian"
                  rows={3}
                  value={formData.detail_kejadian}
                  onChange={handleChange}
                  placeholder="Masukkan detail kejadian darurat..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
