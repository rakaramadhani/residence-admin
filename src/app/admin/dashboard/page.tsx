"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../../../utils/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/dashboard/overview";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { TenantDistribution } from "@/components/dashboard/tenant";
import { FacilityStatus } from "@/components/dashboard/facility";
import { Currency } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    "https://lrubxwgdcidlxqyjjbsk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxydWJ4d2dkY2lkbHhxeWpqYnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NDM2MzIsImV4cCI6MjA1NzIxOTYzMn0.Tos7GIZdn21TnuVo93PjAj9VImuJHqKWrGEAEX2lTqw"
);

export default function AdminDashboard() {
    const router = useRouter();
    const [dataPenghuni, setDataPenghuni] = useState([]);
    const [dataKendala, setDataKendala] = useState([]);
    
    useEffect(() => {
        // Redirect
        if (!isAuthenticated()) {
            router.push("/admin/login");
        }
        
        // Fetch data user
        const fetchUsers = async () => {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                console.error("Token not found");
                return;
            }
            try {
                const response = await fetch("http://localhost:5000/api/admin/users", {
                    method: "GET",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${token}`,
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Error ${response.status}: ${errorData.message}`);
                }
                const user = await response.json();
                setDataPenghuni(user.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchUsers();

        // Fetch data kendala
        const fetchKendala = async () => {
            const token = localStorage.getItem("adminToken");
            if (!token) {
                console.error("Token not found");
                return;
            }
            try {
                const response = await fetch("http://localhost:5000/api/admin/kendala", {
                    method: "GET",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${token}`,
                    },
                    cache: "no-store",
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Error ${response.status}: ${errorData.message}`);
                }
                const kendala = await response.json();
                setDataKendala(kendala.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchKendala();
        
        // Supabase Realtime Subscription
        const subscription = supabase
            .channel("all_changes")
            .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
                console.log("Database changed:", payload);
                if (payload.table === "Kendala") {
                    fetchKendala();
                }
                if (payload.table === "User") {
                    fetchUsers();
                }
            })
            .subscribe();
        return () => {
            supabase.removeChannel(subscription); // Clean up listener on component unmount
        };
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
            </div>
        
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 ">
                <Card className="min-h-[200px]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Penghuni Terdaftar</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-h1-desktop font-bold text-blue-600">
                            {dataPenghuni ? dataPenghuni.length : "Loading..."} <span className="text-[16px] font-medium text-gray-600">penghuni</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="min-h-[200px]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 overflow-auto">
                        <CardTitle className="text-sm font-medium">Total Pengaduan Masuk</CardTitle>
                        <Currency className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent className="md:grid-cols-2">
                        <div className="text-h1-desktop font-bold text-blue-600">
                            {dataKendala ? dataKendala.length : "Loading..."} <span className="text-[16px] font-medium text-gray-600">pengaduan</span>
                        </div>
                        <div className="grid gap-2 grid-cols-2 xl:grid-cols-2 [w>=1280px]:grid-cols-3">
                            <div className="flex gap-2 p-2 bg-blue-200 shadow justify-center items-center w-fit h-fit rounded-xl">
                                <span className="text-blue-600 font-bold text-2xl">{dataKendala ? dataKendala.filter((kendala) => kendala.status_kendala === "PengajuanBaru").length : "Loading..."}</span>
                                <p className="text-xs"> pengajuan baru</p>
                            </div>
                            <div className="flex gap-2 p-2 bg-blue-200 shadow justify-center items-center w-fit h-fit rounded-xl">
                                <span className="text-green-600 font-bold text-2xl">{dataKendala ? dataKendala.filter((kendala) => kendala.status_kendala === "Selesai").length : "Loading..."}</span>
                                <p className="text-xs"> berhasil ditangani</p>
                            </div>
                            <div className="flex gap-2 p-2 bg-blue-200 shadow justify-center items-center w-fit h-fit rounded-xl"> 
                                <span className="text-green-600 font-bold text-2xl">{dataKendala ? dataKendala.filter((kendala) => kendala.status_kendala === "Ditangani").length : "Loading..."}</span>
                                <p className="text-xs"> sedang ditangani</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
