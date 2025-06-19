/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { Component } from "@/app/admin/dashboard/chart";
import { ClusterOverview } from "@/app/admin/dashboard/cluster-overview";
import { GuestManagement } from "@/app/admin/dashboard/guest-management";
import { Overview } from "@/app/admin/dashboard/overview";
import { QuickActions } from "@/app/admin/dashboard/quick-actions";
import { RecentItems } from "@/app/admin/dashboard/recent-items";
import { SuratApprovalCenter } from "@/app/admin/dashboard/surat-approval";
import { TagihanTable } from "@/app/admin/dashboard/tagihan-table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../../../utils/auth";

export default function EnhancedAdminDashboard() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token || !isAuthenticated()) {
      router.push("/admin/login");
    }
  }, []);

  // Handler untuk refresh data setelah action
  const handleActionComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Pantau dan kelola sistem perumahan Anda secara real-time
        </p>
      </div>

      {/* Row 1: Overview Cards (12 cols) */}
      <div>
        <Overview key={`overview-${refreshKey}`} />
      </div>

      {/* Row 2: Charts Section (12 cols) */}
      <div>
        <Component key={`charts-${refreshKey}`} />
      </div>

      {/* Row 3: Tables & Quick Actions Section (12 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tagihan Table (8 cols equivalent) */}
        <div className="lg:col-span-2">
          <TagihanTable key={`tagihan-${refreshKey}`} />
        </div>
        
        {/* Right Column - Quick Actions (4 cols equivalent) */}
        <div>
          <QuickActions onActionComplete={handleActionComplete} />
        </div>
      </div>

      {/* Row 4: Management Widgets Section (12 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Pengaduan Management */}
        <RecentItems key={`pengaduan-${refreshKey}`} />
        
        {/* Middle Column - Surat Approval Center */}
        <SuratApprovalCenter key={`surat-${refreshKey}`} />

        {/* Right Column - Guest Management */}
        <GuestManagement key={`guest-${refreshKey}`} />
      </div>

      {/* Row 5: Cluster Management Section (12 cols) */}
      <div>
        <ClusterOverview key={`cluster-${refreshKey}`} />
      </div>

      {/* Footer - Enhanced Status Bar */}
      <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium">Live Dashboard</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Real-time Sync</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span>Supabase Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span>Emergency Monitoring</span>
            </div>
          </div>
          <div className="text-xs">
            <span className="text-gray-500">Powered by</span>
            <span className="font-semibold text-blue-600 ml-1">Residence Admin v2.0</span>
            <span className="text-gray-400 ml-2">
              • Last sync: {new Date().toLocaleTimeString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 