import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Calendar, Clock } from "lucide-react"
import { Peraturan, Kategori_Peraturan } from "./fetcher"

interface PeraturanCardProps {
  peraturan: Peraturan
  onEdit: (peraturan: Peraturan) => void
  onDelete: (id: number) => void
}

const getKategoriVariant = (kategori: Kategori_Peraturan) => {
  switch (kategori) {
    case Kategori_Peraturan.Keamanan:
      return 'danger'
    case Kategori_Peraturan.Infrastruktur:
      return 'info'
    case Kategori_Peraturan.Kebersihan:
      return 'success'
    case Kategori_Peraturan.Pelayanan:
      return 'pending'
    default:
      return 'default'
  }
}

export default function PeraturanCard({ peraturan, onEdit, onDelete }: PeraturanCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <StatusBadge 
            status={peraturan.kategori}
            variant={getKategoriVariant(peraturan.kategori)}
          />
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(peraturan)}
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(peraturan.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {peraturan.judul}
        </h3>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 mb-4">
          <p className="text-sm text-gray-700 line-clamp-3">
            {stripHtml(peraturan.isi_peraturan)}
          </p>
        </div>
        
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Dibuat pada: {formatDate(peraturan.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Diperbarui pada: {formatDate(peraturan.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 