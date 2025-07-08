'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Modal from '@/components/ui/modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
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
    setErrors({});
    
    try {
      // Prepare data untuk dikirim
      const broadcastData = {
        kategori: formData.kategori,
        broadcast: formData.broadcast.trim(),
        ...(formData.tanggal_acara && { 
          tanggal_acara: new Date(formData.tanggal_acara).toISOString()
        }),
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
    <Modal onClose={onClose} title="Buat Pengumuman">
      <div className="max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kategori */}
          <div>
            <Label className="block text-sm font-medium mb-1">
              Kategori <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.kategori} 
              onValueChange={(value) => handleInputChange('kategori', value)}
            >
              <SelectTrigger className={errors.kategori ? 'border-red-500' : ''}>
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {kategoriOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.kategori && (
              <p className="mt-1 text-sm text-red-600">{errors.kategori}</p>
            )}
          </div>

          {/* Isi Pengumuman */}
          <div>
            <Label className="block text-sm font-medium mb-1">
              Isi Pengumuman <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={formData.broadcast}
              onChange={(e) => handleInputChange('broadcast', e.target.value)}
              placeholder="Tuliskan detail pengumuman..."
              rows={4}
              className={errors.broadcast ? 'border-red-500' : ''}
            />
            {errors.broadcast && (
              <p className="mt-1 text-sm text-red-600">{errors.broadcast}</p>
            )}
          </div>

          {/* Tanggal Acara (Optional) */}
          <div>
            <Label className="block text-sm font-medium mb-1">
              Tanggal Acara (Opsional)
            </Label>
            <Input
              type="datetime-local"
              value={formData.tanggal_acara}
              onChange={(e) => handleInputChange('tanggal_acara', e.target.value)}
            />
          </div>

          {/* Foto Upload */}
          <div>
            <Label className="block text-sm font-medium mb-1">
              Foto (Opsional)
            </Label>
            
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
                <Image 
                  width={100}
                  height={100}
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
                  <X className="h-4 w-4" />
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat...
                </>
              ) : (
                'Buat Pengumuman'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
