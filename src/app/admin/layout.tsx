"use client"

import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { EmergencyAlertModal } from "@/components/emergency/EmergencyAlertModal";
import { EmergencyAlertSound } from "@/components/emergency/EmergencyAlertSound";
import { EmergencyAlertProvider } from "@/contexts/EmergencyAlertContext";
import { usePathname } from "next/navigation";
import type React from "react";

interface AdminLayoutProps {
    children: React.ReactNode
}

export default function AdminLayout({
    children,
}: AdminLayoutProps) {
    const pathname = usePathname();

    // Skip layout for login page
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    // Apply full dashboard layout with emergency alert system
    return (
        <EmergencyAlertProvider>
            <div className="flex min-h-screen flex-col md:flex-row">
                <DashboardSidebar />
                <div className="flex flex-1 flex-col md:ml-64">
                    <DashboardHeader />
                    <main className="flex-1 p-4 w-full md:p-6">{children}</main>
                </div>
            </div>
            
            {/* Emergency Alert Components */}
            <EmergencyAlertModal />
            <EmergencyAlertSound />
        </EmergencyAlertProvider>
    )
}

