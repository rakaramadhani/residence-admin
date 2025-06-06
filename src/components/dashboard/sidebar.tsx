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
    name: "Main",
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ]
  },
  {
    name: "Management",
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
        title: "User Management",
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
    name: "Financial",
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
    name: "Services",
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
          "fixed inset-y-0 left-0 z-30 w-64 border-r bg-background transition-transform md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center px-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
            <Building2 className="h-6 w-6" />
            <span>Cherry Field Admin</span>
          </Link>
        </div>

        <nav className="py-4 space-y-6 px-2">
          {sidebarGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {group.name}
              </h3>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-blue-600 text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}

