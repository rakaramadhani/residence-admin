import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"

type StatusVariant = 
  | "success" 
  | "warning" 
  | "danger" 
  | "info" 
  | "pending"
  | "completed"
  | "cancelled"
  | "default"

interface StatusBadgeProps {
  status: string
  variant?: StatusVariant
  className?: string
}

const statusVariants: Record<StatusVariant, string> = {
  success: "bg-green-100 text-green-800 border-green-300",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-300", 
  danger: "bg-red-100 text-red-800 border-red-300",
  info: "bg-blue-100 text-blue-800 border-blue-300",
  pending: "bg-orange-100 text-orange-800 border-orange-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-gray-100 text-gray-800 border-gray-300",
  default: "bg-gray-100 text-gray-800 border-gray-300"
}

// Mapping status umum ke variant
const getVariantFromStatus = (status: string): StatusVariant => {
  const normalizedStatus = status.toLowerCase()
  
  if (normalizedStatus.includes('lunas') || normalizedStatus.includes('selesai') || normalizedStatus === 'settlement') {
    return 'success'
  }
  if (normalizedStatus.includes('belum') || normalizedStatus === 'pending') {
    return 'warning'
  }
  if (normalizedStatus.includes('batal') || normalizedStatus === 'cancel' || normalizedStatus === 'deny') {
    return 'danger'
  }
  if (normalizedStatus.includes('proses') || normalizedStatus.includes('ditangani')) {
    return 'info'
  }
  if (normalizedStatus === 'expire') {
    return 'cancelled'
  }
  
  return 'default'
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const badgeVariant = variant || getVariantFromStatus(status)
  
  return (
    <Badge 
      className={cn(
        "px-2.5 py-0.5 text-xs font-medium border",
        statusVariants[badgeVariant],
        className
      )}
    >
      {status}
    </Badge>
  )
} 