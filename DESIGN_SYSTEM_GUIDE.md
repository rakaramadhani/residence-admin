# 🎨 Design System Guide - Residence Admin

## 📋 Ringkasan Code Review

Setelah melakukan code review menyeluruh pada project ini, ditemukan beberapa inkonsistensi dalam implementasi UI yang telah diperbaiki dengan membuat komponen-komponen reusable.

## 🔧 Komponen UI yang Telah Dibuat/Diperbaiki

### 1. **DataTable** (`src/components/ui/data-table.tsx`)
Komponen tabel yang konsisten dengan fitur:
- Loading state dengan spinner
- Empty state message
- Pagination terintegrasi
- Styling yang seragam menggunakan design system

**Penggunaan:**
```tsx
import { DataTable } from "@/components/ui/data-table"

const columns = [
  {
    key: "nama",
    header: "Nama",
    render: (item) => <span>{item.nama}</span>
  },
  // ... kolom lainnya
]

<DataTable
  data={currentData}
  columns={columns}
  loading={loading}
  emptyMessage="Tidak ada data ditemukan"
  pagination={{
    currentPage,
    totalPages,
    totalItems: filteredData.length,
    itemsPerPage: 10,
    onPageChange: handlePageChange
  }}
/>
```

### 2. **Pagination** (`src/components/ui/pagination.tsx`)
Komponen pagination yang konsisten dengan:
- Navigasi halaman dengan dots untuk halaman yang banyak
- Info jumlah data yang ditampilkan
- Styling yang seragam

**Penggunaan:**
```tsx
import { Pagination } from "@/components/ui/pagination"

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={handlePageChange}
  showInfo={true}
/>
```

### 3. **FilterCard** (`src/components/ui/filter-card.tsx`)
Komponen card untuk filter dengan layout grid yang responsif:

**Penggunaan:**
```tsx
import { FilterCard } from "@/components/ui/filter-card"

<FilterCard title="Filter Data">
  <div>
    <Input placeholder="Cari..." />
  </div>
  <div>
    <Select>...</Select>
  </div>
  // ... filter lainnya
</FilterCard>
```

### 4. **StatusBadge** (`src/components/ui/status-badge.tsx`)
Komponen badge untuk status dengan mapping otomatis:

**Penggunaan:**
```tsx
import { StatusBadge } from "@/components/ui/status-badge"

<StatusBadge 
  status="Lunas" 
  variant="success" // opsional, akan auto-detect jika tidak disediakan
/>
```

## 🎯 Standar Implementasi

### **Struktur Halaman yang Konsisten:**

```tsx
export default function PageName() {
  // 1. State management
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // 2. Data filtering dan pagination
  const filteredData = // ... logic filter
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const currentData = filteredData.slice(startIndex, endIndex)

  // 3. Column definition
  const columns = [
    {
      key: "field",
      header: "Header",
      render: (item) => <span>{item.field}</span>
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Page Title</h1>
          <p className="text-muted-foreground">Page description</p>
        </div>
        {/* Action buttons */}
      </div>

      {/* Filter */}
      <FilterCard title="Filter Title">
        {/* Filter components */}
      </FilterCard>

      {/* Data Table */}
      <DataTable
        data={currentData}
        columns={columns}
        loading={loading}
        pagination={{...}}
      />
    </div>
  )
}
```

## 🚀 Migrasi dari Implementasi Lama

### **Sebelum (Tidak Konsisten):**
```tsx
// Berbagai implementasi tabel yang berbeda
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50"> // atau bg-blue-600
    // ... header yang berbeda-beda
  </thead>
</table>

// Pagination manual yang berbeda-beda
<div className="flex items-center justify-end space-x-2">
  <Button variant="outline" size="sm">Previous</Button>
  // ... implementasi yang berbeda
</div>
```

### **Sesudah (Konsisten):**
```tsx
// Satu komponen untuk semua tabel
<DataTable
  data={data}
  columns={columns}
  loading={loading}
  pagination={paginationConfig}
/>
```

## 📝 Checklist Konsistensi UI

### ✅ **Yang Sudah Diperbaiki:**
- [x] Komponen DataTable yang reusable
- [x] Pagination yang konsisten
- [x] FilterCard dengan layout yang seragam
- [x] StatusBadge dengan mapping otomatis
- [x] Update halaman tagihan IPL
- [x] Update halaman penghuni

### 🔄 **Yang Perlu Diperbaiki Selanjutnya:**
- [ ] Update halaman pengaduan
- [ ] Update halaman transaksi IPL
- [ ] Update halaman surat
- [ ] Update halaman emergency
- [ ] Update halaman broadcast
- [ ] Update halaman cluster
- [ ] Standardisasi modal components
- [ ] Standardisasi form components

## 🎨 Design Tokens

### **Spacing:**
- Container: `space-y-6`
- Card padding: `p-6` atau `pt-6` untuk CardContent
- Grid gap: `gap-4`

### **Typography:**
- Page title: `text-3xl font-bold tracking-tight`
- Page description: `text-muted-foreground`
- Section title: `text-lg` (dalam CardTitle)

### **Colors:**
- Primary: Menggunakan CSS variables dari design system
- Status colors: Otomatis melalui StatusBadge component

## 🔧 Tools untuk Konsistensi

1. **Linter Rules:** ESLint sudah dikonfigurasi untuk mendeteksi inkonsistensi
2. **TypeScript:** Memastikan type safety untuk props komponen
3. **Design System:** Menggunakan shadcn/ui sebagai base dengan customization

## 📚 Referensi

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React TypeScript Best Practices](https://react-typescript-cheatsheet.netlify.app/)

---

**Catatan:** Panduan ini akan terus diupdate seiring dengan perbaikan komponen lainnya. Pastikan untuk selalu menggunakan komponen yang sudah dibuat daripada membuat implementasi custom yang baru. 