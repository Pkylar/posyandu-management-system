# Aplikasi Posyandu Digital

Sistem Informasi Posyandu Terpadu untuk monitoring kesehatan ibu hamil, balita, dan lansia.

## Fitur Utama

### 📊 Dashboard
- Statistik lengkap (Total balita, laki-laki, perempuan, ibu menyusui, lansia, stunting)
- Grafik pertumbuhan berat dan tinggi badan
- Aktivitas terbaru
- Menu cepat akses fitur

### 👶 Data Balita
- CRUD lengkap data balita
- Detail balita dengan riwayat penimbangan
- Grafik pertumbuhan per balita
- Search dan filter jenis kelamin
- View, Edit, Delete dengan confirmation

### ⚖️ Penimbangan Balita
- Form input penimbangan bulanan
- Analisis otomatis status gizi dan stunting
- Hasil analisis dengan rekomendasi
- Riwayat penimbangan dalam tabel

### 🤱 Data Ibu Menyusui
- CRUD data ibu menyusui
- Status ASI (Eksklusif/Campuran/Formula)
- Statistik pemberian ASI
- Filter berdasarkan status ASI

### 👴 Data Lansia
- CRUD data lansia dengan perhitungan umur otomatis
- Monitoring kesehatan (tekanan darah, BMI)
- Status kesehatan (Sehat/Perlu Pemantauan/Risiko Tinggi)
- Statistik kondisi kesehatan

### 💉 Vitamin & Vaksin
- Pencatatan pemberian vitamin dan vaksinasi
- Jenis: Vitamin A/B/C, BCG, Polio, DPT, Campak, Hepatitis
- Tracking petugas dan catatan
- Statistik pemberian per kategori

### 📋 Rekap Bulanan
- Laporan penimbangan per bulan/tahun
- Statistik lengkap (normal, stunting, gizi kurang)
- Export CSV dan Print
- Filter bulan dan tahun

### 👤 Profil & Keamanan
- Profil pengguna dengan avatar
- Edit informasi personal
- Ubah password dengan validasi keamanan
- Password strength indicator

## Tech Stack

- **Framework**: Next.js 16.2.9 + React 19
- **Language**: TypeScript
- **Styling**: TailwindCSS + Custom CSS
- **Icons**: Lucide React (untuk beberapa komponen)
- **Charts**: Recharts (untuk grafik)
- **State Management**: React useState/useEffect
- **Routing**: Next.js App Router

## Instalasi

1. **Clone repository**
```bash
git clone <repository-url>
cd posyandu10
```

2. **Install dependencies**
```bash
npm install
```

3. **Jalankan development server**
```bash
npm run dev
```

4. **Buka aplikasi**
Buka [http://localhost:3000](http://localhost:3000) di browser

## Struktur Aplikasi

```
app/
├── (authenticated)/           # Protected routes
│   ├── dashboard/             # Dashboard utama
│   ├── balita/               # Data balita + detail
│   ├── penimbangan/          # Penimbangan balita
│   ├── ibu-menyusui/         # Data ibu menyusui
│   ├── lansia/               # Data lansia
│   ├── vitamin-vaksin/       # Vitamin & vaksin
│   ├── rekap-bulanan/        # Laporan bulanan
│   ├── profil/               # Profil pengguna
│   ├── ubah-password/        # Ubah password
│   └── layout.tsx            # Layout authenticated
├── login/                    # Halaman login
├── register/                 # Halaman register
└── globals.css              # Global styles

components/
├── Sidebar.tsx              # Sidebar navigation
├── Header.tsx               # Header component
└── Footer.tsx               # Footer component
```

## Fitur UI/UX

### 🎨 Design System
- **Warna Utama**: Hijau emerald (#10b981)
- **Typography**: Inter font family
- **Spacing**: Consistent 8px grid system
- **Border Radius**: Rounded corners (8-12px)

### 📱 Responsive Design
- Mobile-first approach
- Sidebar collapsible untuk mobile
- Grid sistem yang adaptif
- Touch-friendly button sizes
- Modal full-screen di mobile

### ✨ Interactive Elements
- Smooth animations dan transitions
- Hover effects pada buttons
- Loading states
- Success/error notifications
- Confirmation dialogs
- Real-time form validation

### 🔐 Security Features
- Password strength validation
- Show/hide password toggle
- Session management
- Protected routes
- Input sanitization

## Data Management

### 📊 Mock Data
Aplikasi menggunakan mock data untuk demo:
- LocalStorage untuk session
- useState untuk data management
- Simulasi API calls dengan setTimeout
- Realistic sample data

### 🔄 State Management
- React hooks (useState, useEffect)
- Local component state
- Props drilling untuk data sharing
- Event handlers untuk user interactions

## Deployment

### Build untuk Production
```bash
npm run build
npm start
```

### Environment Variables
Buat file `.env.local`:
```env
NEXT_PUBLIC_APP_NAME=POSYANDU
NEXT_PUBLIC_APP_SUBTITLE=Sistem Informasi Posyandu Terpadu
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork repository
2. Buat feature branch
3. Commit perubahan
4. Push ke branch
5. Buat Pull Request

## License

MIT License - Lihat file LICENSE untuk detail lengkap.

## Kontak

Untuk pertanyaan atau saran, silakan hubungi tim development.

---

**Posyandu Digital** - Mendukung pelayanan kesehatan ibu hamil, balita, dan lansia secara digital. 🏥👶🤱👴