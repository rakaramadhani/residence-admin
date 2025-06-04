import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "./card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"
import { Pagination } from "./pagination"

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyMessage?: string
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    onPageChange: (page: number) => void
  }
  className?: string
}

export function DataTable<T = Record<string, unknown>>({
  data,
  columns,
  loading = false,
  emptyMessage = "Tidak ada data ditemukan",
  pagination,
  className
}: DataTableProps<T>) {
  const getValue = (item: T, key: keyof T | string): unknown => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj: unknown, k: string) => {
        return obj && typeof obj === 'object' && k in obj 
          ? (obj as Record<string, unknown>)[k] 
          : undefined
      }, item)
    }
    return item[key as keyof T]
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
              <p className="ml-3 text-muted-foreground">Memuat data...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column, index) => (
                    <TableHead key={index} className={column.className}>
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex} className={column.className}>
                        {column.render 
                          ? column.render(item)
                          : String(getValue(item, column.key) ?? '')
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {pagination && data.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  )
} 