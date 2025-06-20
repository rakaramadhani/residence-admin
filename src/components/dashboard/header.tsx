"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import axios from "axios"
import { LogOut, User, User2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"

interface UserDetails {
  id: string
  email: string
  username: string
  role: string
}

export function DashboardHeader() {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("adminToken")
        if (!token) {
          router.push("/admin/login")
          return
        }
        // Fungsi untuk mendapatkan headers
        const getHeaders = (token?: string | null) => ({
          "Content-Type": "application/json",
          ...(token ? { Authorization: `${token}` } : {}),
        });

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/details`, {
          headers: getHeaders(token),
        })

        setUserDetails(response.data.data)
      } catch (error) {
        console.error("Error fetching user details:", error)
        // Jika token tidak valid, redirect ke login
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem("adminToken")
          router.push("/admin/login")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserDetails()
  }, [router])

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-gray-200/50 bg-white/95 backdrop-blur-md px-4 md:px-6 shadow-sm">
      <div className="hidden md:block" />

      <div className="flex flex-1 items-center justify-end gap-4">
        {/* <Button variant="outline" size="icon" className="relative" onClick={() => setNotifications(0)}>
          <Bell className="h-4 w-4" />
          {notifications > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {notifications}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button> */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100/80 transition-all duration-200 hover:scale-105 relative group">
              <Avatar className="h-10 w-10 border-2 border-gray-200 shadow-md group-hover:border-blue-400 transition-all duration-200">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  <User2Icon className="h-5 w-5"/>
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-xl rounded-xl p-2 min-w-[280px]">
            {/* Account Information */}
            {!isLoading && userDetails && (
              <>
                <div className="px-3 py-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mx-1 mb-2">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{userDetails.username}</p>
                        <p className="text-sm text-gray-600 truncate">{userDetails.email}</p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm">
                        ✨ {userDetails.role === 'admin' ? 'Administrator' : userDetails.role}
                      </span>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-gray-200/50" />
              </>
            )}
            
            <DropdownMenuItem onClick={async() => {
                const confirm = await Swal.fire({
                  title: "Apakah Anda yakin akan melakukan logout?",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#d33",
                  cancelButtonColor: "#3085d6",
                  confirmButtonText: "Ya, logout",
                  cancelButtonText: "Batal",
                });
                if (!confirm.isConfirmed) return;
                  try {
                    localStorage.removeItem("adminToken");
                    router.push("/admin/login");
                  } catch (error) {
                    console.error("Error logging out:", error);
                  }
                }} className="flex cursor-pointer items-center gap-3 text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-200 rounded-lg mx-1 mb-1 py-2.5 px-3 font-medium">
                <div className="p-1.5 bg-red-100 rounded-lg transition-all duration-200 group-hover:bg-white/20">
                  <LogOut className="h-4 w-4" />
                </div>
                <span >Keluar dari Sistem</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

