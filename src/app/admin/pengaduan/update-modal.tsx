"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Modal from '@/components/ui/modal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { fetchPengaduanbyID, updatePengaduan } from './fetcher'

interface User {
  id: string;
  email: string;
  username?: string;
  phone?: string;
  cluster?: string;
  nomor_rumah?: string;
  rt?: string;
  rw?: string;
}

interface Pengaduan {
  id: string;
  userId: string;
  pengaduan: string;
  kategori: string;
  status_pengaduan: string;
  feedback?: string;
  foto?: string;
  created_at: string;
  updatedAt: string;
  user: User;
}

interface UpdateModalProps {
  pengaduanId: string | null;
  onClose: () => void;
  isOpen: boolean;
  onUpdateSuccess: () => void;
}

const UpdateModal = ({ pengaduanId, onClose, isOpen, onUpdateSuccess }: UpdateModalProps) => {
  const [pengaduan, setPengaduan] = useState<Pengaduan | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [updating, setUpdating] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string>("")
  const [status, setStatus] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      if (!pengaduanId || !isOpen) return;
      
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetchPengaduanbyID(pengaduanId)
        if (response && response.data) {
          setPengaduan(response.data)
          setFeedback(response.data.feedback || "")
          setStatus(response.data.status_pengaduan)
        } else {
          setError('Data pengaduan tidak ditemukan')
        }
      } catch (err) {
        console.error('Error fetching pengaduan detail:', err)
        setError('Gagal memuat data pengaduan')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [pengaduanId, isOpen])

  const handleUpdate = async () => {
    if (!pengaduanId) return;
    
    setUpdating(true)
    setError(null)
    
    try {
      const data = {
        status_pengaduan: status,
        feedback
      }
      
      const response = await updatePengaduan(pengaduanId, data)
      
      if (response && response.success) {
        onUpdateSuccess()
        onClose()
      } else {
        setError('Gagal memperbarui status pengaduan')
      }
    } catch (err) {
      console.error('Error updating pengaduan:', err)
      setError('Terjadi kesalahan saat memperbarui data')
    } finally {
      setUpdating(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal onClose={onClose} title="Detail Pengaduan">
      <div className='max-h-[80vh] overflow-y-auto'>
      {loading ? (
        <div className="flex justify-center items-center py-12 ">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Memuat data...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
          <Button onClick={onClose} variant="outline" className="mt-4">
            Tutup
          </Button>
        </div>
      ) : pengaduan ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Informasi Pemohon</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Pengguna</label>
                <Input 
                  value={pengaduan.user.username || pengaduan.user.email} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Kontak</label>
                <Input 
                  value={pengaduan.user.phone || 'N/A'} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="col-span-2">
                <label className="block text-sm text-gray-500 mb-1">Cluster</label>
                <Input 
                  value={pengaduan.user.cluster || 'N/A'} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Nomor</label>
                <Input 
                  value={pengaduan.user.nomor_rumah || 'N/A'} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="block text-sm text-gray-500 mb-1">RT</label>
                <Input 
                  value={pengaduan.user.rt || 'N/A'} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">RW</label>
                <Input 
                  value={pengaduan.user.rw || 'N/A'} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Permasalahan</h3>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Keterangan</label>
              <Textarea 
                value={pengaduan.pengaduan} 
                readOnly 
                className="bg-gray-50 min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 mt-2">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Kategori</label>
                <Input 
                  value={pengaduan.kategori} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
            </div>
            {pengaduan.foto && (
              <div className="mt-2">
                <label className="block text-sm text-gray-500 mb-1">Bukti Foto</label>
                <div className="border border-gray-200 rounded overflow-hidden">
                  <a href={pengaduan.foto} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="border border-gray-300 rounded overflow-hidden">
                      <Image 
                        width={100}
                        height={100}
                        src={pengaduan.foto} 
                        alt="Bukti pengaduan" 
                        className="object-contain w-full max-h-[200px]"
                      />
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Feedback</h3>
            <div className="mb-2">
              <label className="block text-sm text-gray-500 mb-1">Status Pengaduan</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PengajuanBaru">Pengajuan Baru</SelectItem>
                  <SelectItem value="Ditangani">Ditangani</SelectItem>
                  <SelectItem value="Selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Tanggapan</label>
              <Textarea 
                placeholder="Berikan tanggapan di sini..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={updating}
            >
              Tutup
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleUpdate}
              disabled={updating}
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : 'Simpan'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p>Tidak ada data yang dipilih</p>
          <Button onClick={onClose} variant="outline" className="mt-4">
            Tutup
          </Button>
        </div>
      )}
      </div>
    </Modal>
  )
}

export default UpdateModal
