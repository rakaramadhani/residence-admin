import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
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

