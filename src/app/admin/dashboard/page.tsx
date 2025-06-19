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
import { useEffect } from "react";
import { isAuthenticated } from "../../../utils/auth";

export default function EnhancedAdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token || !isAuthenticated()) {
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          Dashboard Overview
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          Pantau dan kelola sistem perumahan secara real-time
        </p>
      </div>

      {/* TIER 1: Critical Metrics - Overview Cards */}
      <div className="h-auto">
        <Overview />
      </div>

      {/* TIER 2: Daily Operations - Analytics & Quick Management */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-auto xl:h-[500px]">
        {/* Charts Section - Main Analytics */}
        <div className="xl:col-span-3 h-full">
          <div className="h-full overflow-hidden">
            <Component />
          </div>
        </div>
        
        {/* Quick Actions Panel - Fixed Height */}
        <div className="xl:col-span-1 h-full">
          <div className="h-full">
            <QuickActions />
          </div>
        </div>
      </div>

      {/* TIER 3: Administrative Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6 h-auto lg:h-[600px]">
        {/* Complaint Management */}
        <div className="lg:col-span-1 xl:col-span-2 h-full">
          <div className="h-full overflow-hidden">
            <RecentItems />
          </div>
        </div>
        
        {/* Billing Table */}
        <div className="lg:col-span-1 xl:col-span-2 h-full">
          <div className="h-full overflow-hidden">
            <TagihanTable />
          </div>
        </div>
        
        {/* Document Approval */}
        <div className="lg:col-span-2 xl:col-span-1 h-full">
          <div className="h-full overflow-hidden">
            <SuratApprovalCenter />
          </div>
        </div>
      </div>

      {/* TIER 4: Monitoring & Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[500px]">
        {/* Guest Management */}
        <div className="h-full">
          <div className="h-full overflow-hidden">
            <GuestManagement />
          </div>
        </div>
        
        {/* Cluster Overview */}
        <div className="h-full">
          <div className="h-full overflow-hidden">
            <ClusterOverview />
          </div>
        </div>
      </div>

      {/* Compact Status Footer */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium">Live</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Real-time</span>
            </div>
          </div>
          <div className="text-xs">
            <span className="font-semibold text-blue-600">Residence Admin</span>
            <span className="text-gray-400 ml-2">
              {new Date().toLocaleTimeString('id-ID', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 