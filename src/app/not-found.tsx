import Link from "next/link"
import { Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Building2 className="h-10 w-10 text-blue-600" />
          <h1 className="text-2xl font-bold">Housing Admin</h1>
        </div>
        
        <h2 className="text-4xl font-extrabold">404</h2>
        <h3 className="text-xl font-semibold">Halaman Tidak Ditemukan</h3>
        
        <p className="text-muted-foreground">
          Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
        </p>
        
        <Button asChild className="mt-6">
          <Link href="/admin/dashboard">
            Kembali ke Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}