
"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {isAuthenticated} from "../../../utils/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { TenantDistribution } from "@/components/dashboard/tenant"
import { FacilityStatus } from "@/components/dashboard/facility"
import { Currency } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function AdminDashboard() {
    const router = useRouter();
    const [dataPenghuni, setDataPenghuni] = useState<User[]>([]);
    const [dataKendala, setDataKendala] = useState<Kendala[]>([]);
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
                setDataPenghuni(()=>{
                    return user.data
                });
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchUsers();

        // Fetch data user
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
                setDataKendala(() => {
                    return kendala.data;
                });
                
                console.log(kendala.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchKendala();
        // const refreshData = () => {
        //     fetchUsers();
        //     fetchKendala();
        // };

    }, []);


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your housing management system</p>
            </div>
            {/* <button className="py-2 px-4 bg-blue-600 text-white rounded-md" onClick={refreshData()}>
            </button> */}
        
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
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
                        <p className="text-xs text-muted-foreground"></p>
                    </CardContent>
                </Card>

                {/* Total Pengaduan Masuk */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pengaduan Masuk</CardTitle>
                        <Currency className="h-4 w-4 text-muted-foreground"/>
                        
                    </CardHeader>
                    <CardContent>
                        <div className="text-h1-desktop font-bold text-blue-600">
                            {dataKendala ? dataKendala.length : "Loading..."} <span className="text-[16px] font-medium text-gray-600">penghuni</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{dataKendala ? dataKendala.filter((kendala)=>kendala.status_kendala=="Selesai").length : "Loading..."} berhasil ditangani</p>
                        <p className="text-xs text-muted-foreground">{dataKendala ? dataKendala.filter((kendala)=>kendala.status_kendala=="Ditangani").length : "Loading..."} sedang ditangani</p>
                    </CardContent>
                </Card>
        
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pengaduan Masuk</CardTitle>
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
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">-8% from last month</p>
                </CardContent>
                </Card>
        
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Maintenance Requests</CardTitle>
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
                    <path d="M5 8h14M5 12h14M12 16h7M5 16h3" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">42</div>
                    <p className="text-xs text-muted-foreground">+6% from last month</p>
                </CardContent>
                </Card>
            </div>
        
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Monthly Overview</CardTitle>
                    <CardDescription>Tenant occupancy and revenue for the past 6 months</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <Overview />
                </CardContent>
                </Card>
        
                <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Tenant Distribution</CardTitle>
                    <CardDescription>Distribution by property type</CardDescription>
                </CardHeader>
                <CardContent>
                    <TenantDistribution />
                </CardContent>
                </Card>
            </div>
        
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                    <CardDescription>Latest system activities and updates</CardDescription>
                </CardHeader>
                <CardContent>
                    <RecentActivities />
                </CardContent>
                </Card>
        
                <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Facility Status</CardTitle>
                    <CardDescription>Current status of housing facilities</CardDescription>
                </CardHeader>
                <CardContent>
                    <FacilityStatus />
                </CardContent>
                </Card>
            </div>
            </div>
    )
}
