/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../../../utils/auth";
import { Component } from "@/app/admin/dashboard/chart";
import { Overview } from "@/app/admin/dashboard/overview";
import { RecentItems } from "@/app/admin/dashboard/recent-items";


export default function AdminDashboard() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token || !isAuthenticated()) {
      router.push("/admin/login");
    } else {
      router.push("/admin/dashboard");
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
      </div>
      <div>
        <Overview />
      </div>
      <div>
        <RecentItems />
      </div>
      <div>
        <Component />
      </div>
    </div>
  );
}
