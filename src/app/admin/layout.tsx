"use client"
import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { usePathname } from "next/navigation";


export default function DashboardLayout({
    
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();

    // Jika halaman login, tidak gunakan layout
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }
// Jika halaman dashboard, gunakan layout
    return (
        
        <div className="flex min-h-screen flex-col md:flex-row">
            <DashboardSidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <DashboardHeader />
                <main className="flex-1 p-4 w-full md:p-6">{children}</main>
            </div>
        </div>
    )
}

