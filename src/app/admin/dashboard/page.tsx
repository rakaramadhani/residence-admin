
"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {isAuthenticated} from "../../../utils/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { TenantDistribution } from "@/components/dashboard/tenant"
import { FacilityStatus } from "@/components/dashboard/facility"


export default function AdminDashboard() {
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated()) {
        router.push("/admin/login");
        }
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your housing management system</p>
            </div>
        
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
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
                    <div className="text-2xl font-bold">1,248</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
                </Card>
        
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
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
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">86.5%</div>
                    <p className="text-xs text-muted-foreground">+2.3% from last month</p>
                </CardContent>
                </Card>
        
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Open Complaints</CardTitle>
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
