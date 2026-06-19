"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardApi } from '../../../lib/api';
import { DashboardStats } from '../../../lib/types';
import { LoadingSpinner } from '../../../components/ui/Loading';
import { useToast } from '../../../components/ui/Toast';

// Mock data untuk grafik
const beratBadanData = [
  { bulan: 'Jan', normal: 45, stunting: 5 },
  { bulan: 'Feb', normal: 48, stunting: 3 },
  { bulan: 'Mar', normal: 50, stunting: 4 },
  { bulan: 'Apr', normal: 52, stunting: 2 },
  { bulan: 'Mei', normal: 54, stunting: 3 },
  { bulan: 'Jun', normal: 56, stunting: 1 },
];

const tinggiBadanData = [
  { bulan: 'Jan', rata: 85 },
  { bulan: 'Feb', rata: 87 },
  { bulan: 'Mar', rata: 89 },
  { bulan: 'Apr', rata: 91 },
  { bulan: 'Mei', rata: 93 },
  { bulan: 'Jun', rata: 95 },
];

const aktivitasTerbaru = [
  { id: 1, kegiatan: "Penimbangan Balita", nama: "Siti Aisyah", waktu: "2 jam lalu", status: "success" },
  { id: 2, kegiatan: "Pemberian Vitamin A", nama: "Ahmad Fauzi", waktu: "3 jam lalu", status: "success" },
  { id: 3, kegiatan: "Vaksin BCG", nama: "Fatimah", waktu: "5 jam lalu", status: "success" },
  { id: 4, kegiatan: "Pemeriksaan Ibu Menyusui", nama: "Dewi Sari", waktu: "1 hari lalu", status: "warning" },
  { id: 5, kegiatan: "Pemeriksaan Lansia", nama: "H. Abdullah", waktu: "2 hari lalu", status: "info" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getStats();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        addToast('error', response.error || 'Gagal memuat data dashboard');
      }
    } catch (error) {
      addToast('error', 'Terjadi kesalahan saat memuat dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Dashboard | Posyandu';
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-gray-600">
          <LoadingSpinner size="lg" />
          <span>Memuat dashboard...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Gagal memuat data dashboard</p>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* Welcome */}

      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          Selamat Datang 👋
        </h2>

        <p
          style={{
            marginTop: 6,
            color: "#64748b",
            fontSize: 14,
          }}
        >
          Pantau perkembangan balita, ibu hamil, dan kegiatan Posyandu secara
          digital.
        </p>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: 16,
        }}
      >
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Total Balita</span>
            <span style={{ fontSize: 24 }}>👶</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 10 }}>{data.totalBalita}</div>
          <div style={{ fontSize: 12, color: "#22c55e", marginTop: 5 }}>Terdaftar di Posyandu</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Laki-laki</span>
            <span style={{ fontSize: 24 }}>👦</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 10, color: "#2563eb" }}>{Math.floor(data.totalBalita * 0.6)}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 5 }}>Balita laki-laki</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Perempuan</span>
            <span style={{ fontSize: 24 }}>👧</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 10, color: "#e91e63" }}>{Math.floor(data.totalBalita * 0.4)}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 5 }}>Balita perempuan</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Ibu Menyusui</span>
            <span style={{ fontSize: 24 }}>🤱</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 10, color: "#16a34a" }}>{data.totalIbuMenyusui}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 5 }}>Dalam pemantauan</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Lansia</span>
            <span style={{ fontSize: 24 }}>👴</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 10, color: "#7c3aed" }}>{data.totalLansia}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 5 }}>Terdaftar</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>Balita Stunting</span>
            <span style={{ fontSize: 24 }}>⚠️</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 10, color: "#dc2626" }}>{data.totalStunting}</div>
          <div style={{ fontSize: 12, color: "#dc2626", marginTop: 5 }}>Perlu perhatian khusus</div>
        </div>
      </div>

      {/* Bottom Section */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 20,
        }}
      >
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: 0, marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Menu Cepat</h3>
          <p style={{ marginBottom: 20, color: "#64748b", fontSize: 13 }}>
            Akses fitur utama Posyandu.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: "👶", label: "Data Balita", desc: "Kelola data balita", path: "/balita" },
              { icon: "⚖️", label: "Penimbangan", desc: "Input berat dan tinggi badan", path: "/penimbangan" },
              { icon: "🤱", label: "Ibu Menyusui", desc: "Kelola data ibu menyusui", path: "/ibu-menyusui" },
              { icon: "👴", label: "Data Lansia", desc: "Kelola data lansia", path: "/lansia" },
              { icon: "💉", label: "Vitamin & Vaksin", desc: "Catat pemberian vitamin dan vaksin", path: "/vitamin-vaksin" },
              { icon: "📊", label: "Rekap Bulanan", desc: "Laporan timbangan bulanan", path: "/rekap-bulanan" },
            ].map((item, index) => (
              <div
                key={index}
                onClick={() => router.push(item.path)}
                style={{
                  display: "flex",
                  gap: 15,
                  alignItems: "center",
                  padding: 14,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 24 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{item.desc}</div>
                </div>
                ➜
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: 0, marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Aktivitas Terbaru</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.recentActivities.length > 0 ? (
              data.recentActivities.map((item) => {
                const statusColor = "#10b981";
                return (
                  <div key={item.id} style={{ display: "flex", gap: 12, padding: 12, background: "#f8fafc", borderRadius: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor, marginTop: 6, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>{item.description}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{item.type === 'penimbangan' ? 'Penimbangan' : item.type === 'vitamin' ? 'Vitamin' : item.type === 'vaksin' ? 'Vaksin' : 'Pemeriksaan'}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{new Date(item.date).toLocaleDateString('id-ID')}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", padding: 20, color: "#64748b" }}>
                <p>Belum ada aktivitas terbaru</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

