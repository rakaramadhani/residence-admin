"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const facilities = [
  {
    name: "Building A",
    status: "Operational",
    maintenance: 5,
  },
  {
    name: "Building B",
    status: "Maintenance",
    maintenance: 65,
  },
  {
    name: "Building C",
    status: "Operational",
    maintenance: 12,
  },
  {
    name: "Building D",
    status: "Operational",
    maintenance: 8,
  },
  {
    name: "Building E",
    status: "Critical",
    maintenance: 92,
  },
]

export function FacilityStatus() {
  return (
    <div className="space-y-4">
      {facilities.map((facility) => (
        <div key={facility.name} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">{facility.name}</span>
            <Badge
              variant={
                facility.status === "Operational"
                  ? "default"
                  : facility.status === "Maintenance"
                    ? "outline"
                    : "destructive"
              }
            >
              {facility.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={facility.maintenance} className="h-2" />
            <span className="text-xs text-muted-foreground w-10">{facility.maintenance}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

