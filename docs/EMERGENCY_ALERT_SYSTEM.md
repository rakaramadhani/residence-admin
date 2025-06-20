# Sistem Emergency Alert - Dokumentasi

## Deskripsi
Sistem Emergency Alert adalah fitur yang memungkinkan admin untuk menerima notifikasi real-time ketika penghuni menekan panic button. Sistem ini menggunakan Supabase Realtime untuk komunikasi real-time antara aplikasi user dan admin.

## Arsitektur Sistem

### Frontend Admin (residence-admin)
1. **EmergencyAlertContext** - Context untuk mengelola state emergency alert
2. **EmergencyAlertModal** - Modal untuk menampilkan detail emergency
3. **EmergencyAlertSound** - Komponen audio notification
4. **EmergencyTestButton** - Tombol untuk testing (dev mode)

### Backend API (residence-API)
1. **User Controller** - `createEmergency()` untuk membuat laporan darurat
2. **Admin Controller** - `getEmergencyAlert()` untuk mengambil alert terbaru
3. **Supabase Realtime** - Broadcast event untuk notifikasi real-time

## Alur Kerja

### 1. User Menekan Panic Button
```
User App → POST /api/user/emergency/create
├── Data disimpan ke database
├── Broadcast via Supabase Realtime
└── Channel: "all_changes", Event: "new_emergency"
```

### 2. Admin Menerima Alert
```
Admin App (Realtime Listener)
├── Listen channel "all_changes"
├── Receive event "new_emergency"
├── Fetch detail dari /api/admin/emergency/alert
├── Show modal + sound notification
└── Admin dapat respond atau dismiss
```

## Implementasi Frontend

### 1. Setup Context Provider
```typescript
// src/app/admin/layout.tsx
<EmergencyAlertProvider>
  {/* Layout content */}
  <EmergencyAlertModal />
  <EmergencyAlertSound />
</EmergencyAlertProvider>
```

### 2. Emergency Alert Context
```typescript
// src/contexts/EmergencyAlertContext.tsx
const channel = supabase.channel('all_changes')
  .on('broadcast', { event: 'new_emergency' }, (payload) => {
    fetchEmergencyDetails()
  })
  .subscribe()
```

### 3. Modal Component
```typescript
// src/components/emergency/EmergencyAlertModal.tsx
- Menampilkan informasi penghuni
- Detail kejadian darurat
- Lokasi (Google Maps integration)
- Tombol aksi (Respon Darurat, Hubungi)
```

## Konfigurasi Environment

### Frontend (.env)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=https://residence-api-production.up.railway.app/api
```

### Backend (.env)
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing

### Manual Testing
1. Gunakan `EmergencyTestButton` di halaman `/admin/emergency`
2. Click tombol "Test Emergency Alert"
3. Modal akan muncul dengan data simulasi
4. Audio notification akan diputar

### Integration Testing
1. Setup user app untuk call API `createEmergency`
2. Pastikan broadcast event terkirim
3. Verify admin app menerima realtime notification
4. Check modal content dan functionality

## Troubleshooting

### Modal Tidak Muncul
1. Check console untuk Supabase connection errors
2. Verify channel name dan event name match
3. Check API endpoint `/admin/emergency/alert` response

### Audio Tidak Bersuara
1. Browser policy mungkin block autoplay audio
2. User harus interact dengan page terlebih dahulu
3. Check browser audio permissions

### Realtime Connection Issues
1. Verify Supabase credentials
2. Check network connectivity
3. Monitor Supabase dashboard untuk connection status

## Keamanan

### Authorization
- Admin harus login untuk menerima alerts
- API endpoints protected dengan authentication
- Supabase RLS (Row Level Security) untuk data access

### Data Privacy
- Emergency data hanya accessible oleh admin
- Lokasi data di-encrypt dalam transmisi
- User data minimal sesuai kebutuhan emergency

## Performance

### Optimizations
- Context hanya re-render saat alert state berubah
- Audio component lazy load
- Modal conditional rendering
- Efficient Supabase subscription management

### Monitoring
- Track emergency response time
- Monitor realtime connection uptime
- Alert delivery success rate

## Future Enhancements

1. **Push Notifications** - Browser push notifications
2. **Email Alerts** - Fallback notification via email
3. **SMS Integration** - Critical emergency SMS alerts
4. **Alert Escalation** - Auto-escalate jika tidak direspon
5. **Analytics Dashboard** - Emergency response analytics
6. **Multi-language Support** - Internationalization
7. **Mobile App Integration** - React Native support

## API Endpoints

### User Endpoints
- `POST /api/user/emergency/create` - Buat laporan darurat

### Admin Endpoints
- `GET /api/admin/emergency/alert` - Get pending emergency alert
- `GET /api/admin/emergency` - List all emergencies
- `PUT /api/admin/emergency/:id` - Update emergency status
- `DELETE /api/admin/emergency/:id` - Delete emergency record

## Database Schema

### Emergency Table
```sql
CREATE TABLE emergencies (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  latitude DECIMAL,
  longitude DECIMAL,
  kategori VARCHAR(50),
  detail_kejadian TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Deployment Notes

### Production Checklist
- [ ] Environment variables configured
- [ ] Supabase realtime enabled
- [ ] CORS settings updated
- [ ] SSL certificates valid
- [ ] Database indexes optimized
- [ ] Error monitoring setup
- [ ] Backup procedures in place

### Monitoring
- Setup alerts for failed emergency notifications
- Monitor API response times
- Track realtime connection stability
- Log emergency creation and response metrics 