# Sistem Emergency Alert Admin (Realtime)

## Overview
Sistem emergency alert menggunakan **Supabase Realtime Subscription** untuk menerima notifikasi real-time ketika ada laporan emergency baru dari penghuni, lengkap dengan modal warning dan alarm sound.

## Komponen Utama

### 1. Emergency Fetcher (`src/utils/emergency-fetcher.ts`)
- Menghandle API calls ke backend emergency
- Endpoints:
  - `GET /admin/emergency/alert` - Mendapatkan emergency terbaru yang belum ditangani
  - `GET /admin/emergency` - Mendapatkan semua emergency

### 2. Supabase Client (`src/lib/supabase.ts`)
- **BARU**: Setup Supabase client untuk realtime subscription
- Subscribe ke perubahan tabel Emergency
- Handle realtime events (INSERT, UPDATE, DELETE)

### 3. Emergency Context (`src/contexts/emergency-context.tsx`)
- **DIPERBARUI**: Menggunakan Supabase Realtime subscription
- **TIDAK LAGI POLLING**: Menghapus sistem polling setiap 5 detik
- Real-time detection ketika ada emergency baru
- Auto-check ketika user kembali ke tab (visibility change)
- Hanya aktif jika user adalah admin (memiliki adminToken)

### 4. Emergency Alert Modal (`src/components/emergency-alert-modal.tsx`)
- Modal dengan warning visual dan audio alarm
- Menampilkan detail emergency dan informasi pelapor
- **Hanya satu tombol "BERI TINDAKAN"** yang redirect ke halaman emergency

### 5. Emergency Indicator (`src/components/emergency-indicator.tsx`)
- Indikator visual di pojok kanan atas layar
- **Dapat diklik untuk langsung redirect ke halaman emergency**
- Muncul ketika ada emergency alert aktif

## Setup dan Integrasi

### 1. Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Layout Integration
```tsx
// src/app/layout.tsx
<EmergencyProvider>
  {children}
  <EmergencyIndicator />
</EmergencyProvider>
```

### 3. Backend & Database Requirements

#### Supabase Setup:
1. **Enable Realtime** untuk tabel Emergency:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE emergency;
```

2. **RLS Policies** (jika diperlukan):
```sql
-- Policy untuk admin bisa subscribe ke emergency changes
CREATE POLICY "Admin can subscribe to emergency changes" ON emergency
  FOR SELECT USING (auth.role() = 'admin');
```

#### Backend Response Format:
```json
{
  "message": "Success",
  "data": {
    "id": "emergency-id",
    "userId": "user-id", 
    "latitude": -6.123456,
    "longitude": 106.123456,
    "kategori": "Keamanan",
    "detail_kejadian": "Detail kejadian...",
    "created_at": "2024-01-01T12:00:00.000Z",
    "user": {
      "username": "john_doe",
      "email": "john@example.com",
      "phone": "081234567890",
      "cluster": "Cluster A"
    }
  },
  "hasAlert": true
}
```

## Cara Kerja (Realtime)

1. **🔗 Subscription Setup**: Context setup Supabase subscription ke tabel Emergency
2. **⚡ Real-time Detection**: Ketika ada INSERT baru di tabel Emergency:
   - Supabase langsung trigger event
   - Frontend receive realtime event
   - Auto-fetch detail emergency terbaru
   - Menampilkan modal emergency alert + alarm + indicator
3. **🎯 User Action**: Admin hanya bisa:
   - **"BERI TINDAKAN"** - Redirect ke halaman `/admin/emergency`
   - **Klik indicator** - Shortcut ke halaman emergency

## Keuntungan Realtime vs Polling

| Aspek | Polling (Lama) | Realtime (Baru) |
|-------|----------------|------------------|
| **Response Time** | 5 detik delay | Instant (< 1 detik) |
| **Network Usage** | Request setiap 5 detik | Hanya saat ada perubahan |
| **Server Load** | Tinggi | Minimal |
| **Battery Life** | Buruk (mobile) | Optimal |
| **Scalability** | Terbatas | Sangat baik |

## Audio System

Tetap sama seperti sebelumnya:
- Frequency: 800Hz
- Beep pattern: 0.2s beep, 0.3s pause
- Volume: 30% untuk tidak terlalu mengganggu
- Auto-stop ketika admin mengklik "BERI TINDAKAN"

## Testing

### Testing Realtime Connection:
```tsx
import { useEmergencyTest } from '@/hooks/use-emergency-test';

const { checkRealtimeConnection, logEmergencyStatus } = useEmergencyTest();

// Check connection status
checkRealtimeConnection();

// Full emergency status
logEmergencyStatus();
```

### Testing Emergency Trigger:
1. **Insert emergency baru** di database
2. **Modal muncul instant** (< 1 detik)
3. **Check browser console** untuk realtime events

### Development Indicator:
Dalam development mode, ada indicator di kiri bawah:
- 🟢 **Realtime Connected** - Subscription aktif
- 🔴 **Realtime Disconnected** - Ada masalah koneksi

## Troubleshooting

### Realtime tidak terhubung:
1. **Check Supabase URL & Key** di environment variables
2. **Verify Realtime enabled** untuk tabel Emergency
3. **Check browser console** untuk error subscription
4. **Network** - pastikan WebSocket connection tidak diblokir

### Modal tidak muncul saat ada emergency baru:
1. **Check realtime indicator** - harus hijau
2. **Console logs** - lihat "Emergency realtime event detected"
3. **Table name** - pastikan nama tabel di subscription benar
4. **Backend API** - pastikan endpoint `/admin/emergency/alert` berfungsi

### Audio tidak bunyi:
1. Sama seperti troubleshooting sebelumnya
2. Browser autoplay policy
3. User interaction requirement

### Subscription terputus:
- **Auto-reconnect**: Supabase client otomatis reconnect
- **Manual check**: Refresh halaman untuk reset subscription
- **Fallback**: Visibility change trigger manual check

## Performance & Security

### Performance:
- ✅ **Zero polling overhead**
- ✅ **Instant notifications**
- ✅ **Auto cleanup** subscription on unmount
- ✅ **Memory efficient**

### Security:
- ✅ **Admin-only**: Hanya admin dengan token yang subscribe
- ✅ **RLS Support**: Row Level Security di Supabase
- ✅ **Rate limiting**: Built-in Supabase rate limiting
- ✅ **Secure WebSocket**: Encrypted connection

## Migration dari Polling

Jika sebelumnya menggunakan polling:
1. **Backup** context lama jika diperlukan
2. **Update** environment variables
3. **Enable** Realtime di Supabase
4. **Test** dengan emergency baru
5. **Monitor** connection indicator

**Sistem emergency alert realtime siap digunakan!** ⚡🚨 