# 🚀 Panduan Deployment ke Vercel

## Prerequisites
- Repository GitHub sudah dibuat dan berisi kode aplikasi
- Akun Vercel (daftar di [vercel.com](https://vercel.com))
- Backend API sudah running di production
- Database Supabase sudah dikonfigurasi
- Firebase project sudah dikonfigurasi

## Langkah 1: Push ke GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Langkah 2: Import Project ke Vercel
1. Login ke [vercel.com](https://vercel.com)
2. Klik "New Project"
3. Import dari GitHub repository
4. Pilih repository `residence-admin`
5. Klik "Import"

## Langkah 3: Konfigurasi Environment Variables
Di dashboard Vercel, tambahkan environment variables berikut:

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend API Configuration
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
```

### Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_VAPID_KEY=your_vapid_key
```

## Langkah 4: Deploy
1. Setelah environment variables dikonfigurasi, klik "Deploy"
2. Tunggu proses build dan deployment (2-5 menit)
3. Aplikasi akan tersedia di URL yang diberikan Vercel

## Langkah 5: Konfigurasi Custom Domain (Opsional)
1. Di dashboard project, pilih tab "Settings"
2. Klik "Domains"
3. Tambahkan custom domain

## ⚠️ Hal Penting

### CORS Configuration
Pastikan backend API mengizinkan request dari domain Vercel:
```javascript
// Di backend, tambahkan domain Vercel ke CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app',
    'https://your-custom-domain.com'
  ]
}));
```

### Firebase Configuration
Update authorized domains di Firebase Console:
1. Buka Firebase Console
2. Pilih project Anda
3. Authentication > Settings > Authorized domains
4. Tambahkan domain Vercel Anda

### Database Configuration
Pastikan Supabase RLS (Row Level Security) sudah dikonfigurasi dengan benar untuk production.

## 🔄 Auto Deployment
Vercel otomatis akan deploy setiap kali ada push ke branch `main`.

## 🐛 Troubleshooting

### Build Errors
```bash
# Test build locally
npm run build

# Test type checking
npm run type-check

# Fix linting
npm run lint:fix
```

### Environment Variables Issues
- Pastikan semua environment variables sudah ditambahkan
- Restart deployment setelah menambah environment variables
- Periksa nama environment variables (harus diawali NEXT_PUBLIC_)

### API Connection Issues
- Verifikasi backend API URL
- Check CORS settings
- Test API endpoints manually

## 📊 Monitoring
- Monitor performance di Vercel Analytics
- Setup error tracking (Sentry recommended)
- Monitor API response times 