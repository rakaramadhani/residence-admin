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
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token || !isAuthenticated()) {
      router.push("/admin/login");
    }
  }, []);

  // Set mounted state and initial time on client side only
  useEffect(() => {
    setIsMounted(true);
    setCurrentTime(new Date().toLocaleTimeString('id-ID'));
    
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('id-ID'));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Handler untuk refresh data setelah action
  const handleActionComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Show loading during hydration
  if (!isMounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-96" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 bg-gray-100 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Pantau dan kelola sistem perumahan Anda secara real-time
        </p>
      </div>

      {/* Row 1: Overview Cards (12 cols) */}
      <div>
        <Overview key={`overview-${refreshKey}`} />
      </div>

      {/* Row 2: Charts Section (12 cols) - Responsive Grid */}
      <div className="w-full">
        <Component key={`charts-${refreshKey}`} />
      </div>

      {/* Row 3: Tables & Quick Actions Section (12 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Left Column - Pengaduan Management */}
        <RecentItems key={`pengaduan-${refreshKey}`} />
        
        {/* Middle Column - Surat Approval Center */}
        <SuratApprovalCenter key={`surat-${refreshKey}`} />

        
      </div>

      {/* Row 5: Cluster Management Section (12 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <ClusterOverview key={`cluster-${refreshKey}`} />
        {/* Right Column - Guest Management */}
        <GuestManagement key={`guest-${refreshKey}`} />
      </div>

      {/* Footer - Enhanced Status Bar */}
      <div className="mt-8 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="text-xs">
            <span className="text-gray-500">Powered by</span>
            <span className="font-semibold text-blue-600 ml-1">Cherry Field</span>
            {isMounted && (
              <span className="text-gray-400 ml-2 hidden sm:inline">
                • Last sync: {currentTime}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 