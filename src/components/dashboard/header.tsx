"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import axios from "axios"
import { Bell, LogOut, User, User2Icon } from "lucide-react"
import Link from "next/link"
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
  const [notifications, setNotifications] = useState(0)
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

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="hidden md:block" />

      <div className="flex flex-1 items-center justify-end gap-4">
        <Button variant="outline" size="icon" className="relative" onClick={() => setNotifications(0)}>
          <Bell className="h-4 w-4" />
          {notifications > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {notifications}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt="User" />
                <AvatarFallback color="#000000">
                  <User2Icon/>
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {isLoading 
                ? "Loading..." 
                : userDetails?.username || userDetails?.email || "Administrator"
              }
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="flex w-full cursor-pointer items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
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
                }} className="flex cursor-pointer items-center text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

