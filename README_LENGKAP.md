# 🏥 Sistem Informasi Posyandu Terpadu

Aplikasi web untuk manajemen Posyandu dengan fitur monitoring kesehatan ibu hamil, balita, dan lansia. Dibangun menggunakan Next.js 15 dengan TypeScript untuk tugas UAS.

## 📸 Screenshot Aplikasi

### Dashboard Utama
Dashboard menampilkan statistik lengkap dengan chart interaktif untuk monitoring data kesehatan.

### Fitur Balita
- Detail balita dengan grafik pertumbuhan berat badan dan tinggi badan
- Data penimbangan dengan status gizi dan stunting
- History penimbangan lengkap

### Sistem Login & Register
- Login dengan username/password apapun untuk demo
- Register user baru dengan validasi
- Responsive design untuk desktop dan mobile

## 🚀 Cara Menjalankan Aplikasi

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Development Server
```bash
npm run dev
```

### 3. Akses Aplikasi
- Buka browser: **http://localhost:3000**
- Login dengan username dan password apapun
- Atau register akun baru terlebih dahulu

## 🎯 Fitur Utama

### 📊 Dashboard
- **Statistik Real-time**: Total balita, ibu menyusui, lansia
- **Chart Interaktif**: Grafik pertumbuhan dan status gizi
- **Widget Informasi**: Ringkasan data penting
- **Responsive Design**: Optimal di semua device

### 👶 Manajemen Balita
- **CRUD Operations**: Create, Read, Update, Delete data balita
- **Detail Balita**: Informasi lengkap dengan chart pertumbuhan
- **Status Gizi**: Otomatis calculate berdasarkan WHO standards
- **Family Data**: Data keluarga dan alamat lengkap

### 📏 Penimbangan
- **Recording**: Pencatatan berat badan, tinggi badan, lingkar kepala
- **Auto-calculation**: Otomatis hitung status gizi dan stunting
- **Integration**: Terintegrasi dengan data balita
- **History Tracking**: Riwayat penimbangan per balita

### 🤱 Ibu Menyusui
- **Data Management**: Kelola data ibu menyusui
- **Health Monitoring**: Pantau kesehatan ibu dan bayi
- **Integration**: Link dengan data balita

### 👴 Lansia
- **Elder Care**: Manajemen data lansia
- **Health Records**: Catatan kesehatan lansia
- **Medical History**: Riwayat pemeriksaan

### 💊 Vitamin & Vaksin
- **Multi-recipient**: Untuk balita, ibu menyusui, dan lansia
- **Type Management**: Berbagai jenis vitamin dan vaksin
- **Scheduling**: Jadwal pemberian
- **Auto-refresh**: Dropdown otomatis update saat ada data baru

### 📈 Rekap Bulanan
- **Comprehensive Report**: Laporan lengkap per bulan
- **Real Data Integration**: Menggunakan data penimbangan aktual
- **Export Feature**: Export ke PDF/print
- **Filter Options**: Filter berdasarkan bulan dan tahun

### 🔐 Authentication
- **Demo Login**: Login dengan credential apapun
- **User Registration**: Daftar user baru
- **Session Management**: Kelola sesi user dengan aman
- **Route Protection**: Proteksi halaman yang memerlukan login

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: CSS-in-JS (styled-jsx)
- **Charts**: Recharts
- **State Management**: React useState & localStorage
- **Authentication**: Mock authentication dengan localStorage
- **Data Storage**: localStorage (untuk demo purposes)

## 📁 Struktur Project

```
posyandu10/
├── app/                          # Next.js App Router
│   ├── (authenticated)/         # Protected routes
│   │   ├── balita/             # Balita management
│   │   │   ├── [id]/           # Dynamic balita detail
│   │   │   └── create/         # Create new balita
│   │   ├── dashboard/          # Main dashboard
│   │   ├── penimbangan/        # Weight recording
│   │   ├── ibu-menyusui/       # Nursing mothers
│   │   ├── lansia/             # Elderly care
│   │   ├── vitamin-vaksin/     # Vitamins & vaccines
│   │   └── rekap-bulanan/      # Monthly reports
│   ├── login/                  # Login page
│   └── register/               # Registration page
├── components/                  # Reusable components
│   ├── ui/                     # UI components
│   └── auth/                   # Auth components
├── lib/                        # Utilities and APIs
│   ├── api/                    # Mock API functions
│   ├── data/                   # Mock data
│   ├── types/                  # TypeScript types
│   └── utils/                  # Utility functions
└── public/                     # Static assets
```

## 💾 Data Management

### Mock Data System
Aplikasi menggunakan sistem mock data yang tersimpan di localStorage untuk keperluan demo:

- **mockData.ts**: Berisi 11 data balita lengkap dengan penimbangan
- **Relational System**: Data saling terhubung antar modul
- **Auto-calculation**: Status gizi dan stunting otomatis terhitung
- **Persistent Storage**: Data tersimpan di browser localStorage

### Data Relationships
- Balita ↔ Penimbangan (One to Many)
- Balita ↔ Vitamin/Vaksin (Many to Many)
- Ibu Menyusui ↔ Vitamin/Vaksin (Many to Many)
- Lansia ↔ Vitamin/Vaksin (Many to Many)

## 🎨 Design & UX

### Color Scheme
- **Primary**: Green theme (#10b981)
- **Background**: Light gray (#f8fafc)
- **Text**: Dark slate (#0f172a)
- **Accent**: Emerald variations

### Responsive Design
- **Desktop First**: Optimized untuk desktop
- **Mobile Friendly**: Fully responsive di semua device
- **Touch Optimized**: Button dan form touch-friendly
- **Progressive Enhancement**: Graceful degradation

## 📋 Panduan untuk Dosen/Penguji

### Demo Credentials
- **Username**: Masukkan apapun (contoh: admin, bidan1, user123)
- **Password**: Masukkan apapun (contoh: password, 123456)
- Sistem akan otomatis login dengan credential apapun

### Fitur yang Bisa Didemonstrasikan

1. **Dashboard Overview**: Statistik dan chart interaktif
2. **CRUD Balita**: Tambah, edit, hapus, detail balita
3. **Chart Pertumbuhan**: Grafik berat badan dan tinggi badan
4. **Penimbangan**: Input data penimbangan baru
5. **Vitamin/Vaksin**: Pemberian vitamin dengan dropdown dinamis
6. **Rekap Bulanan**: Laporan dengan data real dan export
7. **Responsive**: Test di mobile dan desktop
8. **Authentication**: Login, logout, register flow

### Test Data
Aplikasi sudah dilengkapi dengan:
- 11 data balita lengkap
- 35+ data penimbangan
- Data ibu menyusui dan lansia
- History vitamin/vaksin
- Data relational yang saling terhubung

## 🚨 Troubleshooting

### Port Sudah Digunakan
```bash
# Jika port 3000 digunakan, Next.js otomatis pakai port lain
# Lihat terminal output untuk port yang digunakan
```

### Clear Browser Data (Jika Perlu)
```bash
# Buka Developer Tools (F12)
# Application -> Storage -> Clear storage
# Refresh page
```

### Install Dependencies Error
```bash
# Hapus node_modules dan package-lock.json
rm -rf node_modules package-lock.json
npm install
```

## 📝 Catatan Pengembangan

### Untuk UAS/Skripsi
- Aplikasi ini menggunakan mock data untuk demo
- Dalam implementasi real, ganti dengan database (PostgreSQL/MySQL)
- API endpoints bisa diganti dengan backend real (Laravel/Express)
- Authentication bisa diganti dengan JWT/OAuth

### Extensibility
- Mudah ditambahkan fitur baru
- Component-based architecture
- Type-safe dengan TypeScript
- Modular API structure

## 🏆 Credits

Aplikasi ini dibuat untuk tugas UAS dengan fokus pada:
- **Functionality**: Semua fitur bekerja dengan baik
- **User Experience**: Interface yang intuitif dan responsive  
- **Code Quality**: Clean, maintainable, dan well-documented code
- **Demo Ready**: Siap untuk presentasi dan demo

---

**💡 Tip untuk Presentasi:**
1. Start dari dashboard untuk overview
2. Demo CRUD balita dengan chart
3. Tunjukkan relational data (penimbangan → chart update)
4. Demo responsive design di mobile
5. Showcase rekap bulanan dengan export feature

**🎯 Key Selling Points:**
- Comprehensive health monitoring system
- Real-time data visualization
- Mobile-responsive design
- Production-ready architecture
- Easy to extend and maintain