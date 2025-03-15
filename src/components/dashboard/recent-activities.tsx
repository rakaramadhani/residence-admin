"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activities = [
  {
    id: 1,
    user: {
      name: "John Doe",
      avatar: "/placeholder-user.jpg",
      initials: "JD",
    },
    action: "added a new tenant",
    target: "Sarah Johnson",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    user: {
      name: "Alice Smith",
      avatar: "/placeholder-user.jpg",
      initials: "AS",
    },
    action: "resolved complaint",
    target: "#1234 - Water Leak",
    timestamp: "4 hours ago",
  },
  {
    id: 3,
    user: {
      name: "Robert Brown",
      avatar: "/placeholder-user.jpg",
      initials: "RB",
    },
    action: "scheduled maintenance",
    target: "Building B - Elevator",
    timestamp: "Yesterday",
  },
  {
    id: 4,
    user: {
      name: "Emma Wilson",
      avatar: "/placeholder-user.jpg",
      initials: "EW",
    },
    action: "approved payment",
    target: "Invoice #5678",
    timestamp: "Yesterday",
  },
  {
    id: 5,
    user: {
      name: "Michael Clark",
      avatar: "/placeholder-user.jpg",
      initials: "MC",
    },
    action: "sent letter",
    target: "Rent Increase Notice",
    timestamp: "2 days ago",
  },
]

export function RecentActivities() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            <AvatarFallback>{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              <span className="font-semibold">{activity.user.name}</span> {activity.action}{" "}
              <span className="font-semibold">{activity.target}</span>
            </p>
            <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

