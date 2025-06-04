import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

interface FilterCardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function FilterCard({ title, children, className }: FilterCardProps) {
  return (
    <Card className={cn("mb-6", className)}>
      {title && (
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? "pt-0" : "pt-6"}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {children}
        </div>
      </CardContent>
    </Card>
  )
} 