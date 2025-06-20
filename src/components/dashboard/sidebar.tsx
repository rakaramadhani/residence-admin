"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  AlertCircle,
  BarChart3,
  Building2,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Speaker,
  Users,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const sidebarGroups = [
  {
    name: "Menu Utama",
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ]
  },
  {
    name: "Pengelolaan",
    items: [
      {
        title: "Peraturan",
        href: "/admin/peraturan",
        icon: FileText,
      },
      {
        title: "Broadcast",
        href: "/admin/broadcast",
        icon: Speaker,
      },
      {
        title: "Manajemen Akun",
        href: "/admin/accounts",
        icon: Users,
      },
      {
        title: "Penghuni",
        href: "/admin/penghuni",
        icon: Users,
      },
      {
        title: "Cluster",
        href: "/admin/cluster",
        icon: Home,
      },
    ]
  },
  {
    name: "Iuran Pengelolaan Lingkungan",
    items: [
      {
        title: "Tagihan IPL",
        href: "/admin/ipl/tagihan",
        icon: BarChart3,
      },
      {
        title: "Riwayat Transaksi",
        href: "/admin/ipl/transaksi",
        icon: CreditCard,
      },
    ]
  },
  {
    name: "Layanan Cherry Field",
    items: [
      {
        title: "Pengaduan",
        href: "/admin/pengaduan",
        icon: MessageSquare,
      },
      {
        title: "Surat",
        href: "/admin/surat",
        icon: FileText,
      },
      {
        title: "Emergency",
        href: "/admin/emergency",
        icon: AlertCircle,
      },
    ]
  }
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-40 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div
        className={cn(
          "fixed inset-0 z-30 bg-background/80 backdrop-blur-sm transition-all md:hidden",
          isOpen ? "block" : "hidden",
        )}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 border-r bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm transition-all duration-300 ease-in-out shadow-xl md:translate-x-0 md:shadow-lg flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center px-4 border-b border-gray-100/50 bg-white/90 backdrop-blur-sm flex-shrink-0">
          <Link href="/admin/dashboard" className="flex items-center gap-3 font-semibold group transition-all duration-200 hover:scale-105">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-md group-hover:shadow-lg transition-all duration-200">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Cherry Field
            </span>
          </Link>
        </div>

        <nav className="py-3 px-3 space-y-3 overflow-y-auto">
          {sidebarGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center">
                <div className="h-px bg-gradient-to-r from-gray-300 to-transparent flex-1 mr-2" />
                <span className="text-xs">{group.name}</span>
                <div className="h-px bg-gradient-to-l from-gray-300 to-transparent flex-1 ml-2" />
              </h3>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                    pathname === item.href
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm hover:shadow-gray-200/40"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <div className={cn(
                    "p-1 rounded-md transition-all duration-200",
                    pathname === item.href
                      ? "bg-white/20"
                      : "bg-gray-100 group-hover:bg-gray-200"
                  )}>
                    <item.icon className={cn(
                      "h-3.5 w-3.5 transition-all duration-200",
                      pathname === item.href
                        ? "text-white"
                        : "text-gray-600 group-hover:text-gray-800"
                    )} />
                  </div>
                  <span className="text-sm">{item.title}</span>
                  {pathname === item.href && (
                    <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white/40 rounded-l-full" />
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}

