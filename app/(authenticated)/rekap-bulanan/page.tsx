"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RekapData {
  id: string;
  nama_balita: string;
  jenis_kelamin: string;
  tanggal_timbang: string;
  berat_badan: number;
  tinggi_badan: number;
  status_gizi: string;
  status_stunting: string;
  umur_bulan: number;
}

export default function RekapBulananPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [rekapData, setRekapData] = useState<RekapData[]>([]);
  const [balitaData, setBalitaData] = useState<any[]>([]);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  useEffect(() => {
    document.title = "Rekap Bulanan | Posyandu";
    loadRekapData();
  }, [selectedMonth, selectedYear]);

  const loadRekapData = async () => {
    setLoading(true);
    try {
      // Load balita data for gender reference
      const { balitaApi } = await import('../../../lib/api');
      balitaApi.init();
      const balitaResponse = await balitaApi.getAll();
      
      if (balitaResponse.success && balitaResponse.data) {
        setBalitaData(balitaResponse.data);
      }

      // Load penimbangan data
      const { penimbanganApi } = await import('../../../lib/api');
      penimbanganApi.init();
      const penimbanganResponse = await penimbanganApi.getAll();
      
      if (penimbanganResponse.success && penimbanganResponse.data) {
        // Transform penimbangan data to rekap format
        const transformedData = penimbanganResponse.data.map(p => {
          const balita = balitaResponse.data?.find(b => b.id === p.balitaId);
          return {
            id: p.id,
            nama_balita: p.balitaName,
            jenis_kelamin: balita?.gender || 'L',
            tanggal_timbang: p.date,
            berat_badan: p.weight,
            tinggi_badan: p.height,
            status_gizi: p.nutritionStatus === 'normal' ? 'Gizi Baik' : 
                        p.nutritionStatus === 'kurang' ? 'Gizi Kurang' : 
                        p.nutritionStatus === 'berlebih' ? 'Gizi Berlebih' : 'Obesitas',
            status_stunting: p.stuntingStatus === 'normal' ? 'Normal' : 
                           p.stuntingStatus === 'stunting' ? 'Berisiko Stunting' : 'Stunting Berat',
            umur_bulan: p.age
          };
        });
        
        setRekapData(transformedData);
      }
    } catch (error) {
      console.error('Error loading rekap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = rekapData.filter(item => {
    const itemDate = new Date(item.tanggal_timbang);
    return itemDate.getMonth() + 1 === selectedMonth && itemDate.getFullYear() === selectedYear;
  });

  const calculateStats = () => {
    const totalBalita = filteredData.length;
    const totalDitimbang = filteredData.length;
    const totalNormal = filteredData.filter(item => item.status_gizi === "Gizi Baik").length;
    const totalStunting = filteredData.filter(item => 
      item.status_stunting === "Berisiko Stunting" || item.status_stunting === "Stunting Berat"
    ).length;
    const totalGiziKurang = filteredData.filter(item => item.status_gizi === "Gizi Kurang").length;
    const totalGiziBerlebih = filteredData.filter(item => 
      item.status_gizi === "Gizi Berlebih" || item.status_gizi === "Obesitas"
    ).length;
    
    return {
      totalBalita,
      totalDitimbang,
      totalNormal,
      totalStunting,
      totalGiziKurang,
      totalGiziBerlebih,
      persentaseNormal: totalBalita ? Math.round((totalNormal / totalBalita) * 100) : 0,
      persentaseStunting: totalBalita ? Math.round((totalStunting / totalBalita) * 100) : 0,
      persentaseGiziKurang: totalBalita ? Math.round((totalGiziKurang / totalBalita) * 100) : 0,
    };
  };

  const stats = calculateStats();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = `
        <html>
          <head>
            <title>Rekap Penimbangan ${monthNames[selectedMonth - 1]} ${selectedYear}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { text-align: center; color: #0f172a; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f8fafc; }
              .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
              .stat-card { border: 1px solid #e2e8f0; padding: 15px; text-align: center; }
            </style>
          </head>
          <body>
            <h1>Rekap Penimbangan Posyandu</h1>
            <h2>${monthNames[selectedMonth - 1]} ${selectedYear}</h2>
            
            <div class="stats">
              <div class="stat-card">
                <h3>Total Balita</h3>
                <p style="font-size: 24px; font-weight: bold;">${stats.totalBalita}</p>
              </div>
              <div class="stat-card">
                <h3>Gizi Normal</h3>
                <p style="font-size: 24px; font-weight: bold; color: #10b981;">${stats.totalNormal} (${stats.persentaseNormal}%)</p>
              </div>
              <div class="stat-card">
                <h3>Stunting</h3>
                <p style="font-size: 24px; font-weight: bold; color: #dc2626;">${stats.totalStunting} (${stats.persentaseStunting}%)</p>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Balita</th>
                  <th>JK</th>
                  <th>Umur</th>
                  <th>Tanggal Timbang</th>
                  <th>BB (kg)</th>
                  <th>TB (cm)</th>
                  <th>Status Gizi</th>
                  <th>Status Stunting</th>
                </tr>
              </thead>
              <tbody>
                ${filteredData.map((item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.nama_balita}</td>
                    <td>${item.jenis_kelamin}</td>
                    <td>${item.umur_bulan} bulan</td>
                    <td>${new Date(item.tanggal_timbang).toLocaleDateString('id-ID')}</td>
                    <td>${item.berat_badan}</td>
                    <td>${item.tinggi_badan}</td>
                    <td>${item.status_gizi}</td>
                    <td>${item.status_stunting}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleExport = () => {
    const headers = ['No', 'Nama Balita', 'JK', 'Umur (bulan)', 'Tanggal Timbang', 'BB (kg)', 'TB (cm)', 'Status Gizi', 'Status Stunting'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map((item, index) => [
        index + 1,
        `"${item.nama_balita}"`,
        item.jenis_kelamin,
        item.umur_bulan,
        new Date(item.tanggal_timbang).toLocaleDateString('id-ID'),
        item.berat_badan,
        item.tinggi_badan,
        `"${item.status_gizi}"`,
        `"${item.status_stunting}"`
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rekap_${monthNames[selectedMonth - 1]}_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    if (status.includes("Normal") || status.includes("Baik")) return "#10b981";
    if (status.includes("Kurang") || status.includes("Berisiko")) return "#f59e0b";
    if (status.includes("Berlebih")) return "#3b82f6";
    return "#dc2626";
  };

  return (
    <div style={{ padding: 24, fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
            Rekap Timbangan Bulanan
          </h1>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                padding: "8px 16px",
                background: "#fff",
                color: "#64748b",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
                cursor: "pointer"
              }}
            >
              ← Kembali
            </button>
          </div>
        </div>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
          Laporan hasil penimbangan balita per bulan dengan data real dari sistem
        </p>
      </div>

      {/* Filter */}
      <div style={{ 
        background: "#fff", 
        borderRadius: 12, 
        border: "1px solid #e2e8f0", 
        padding: 20,
        marginBottom: 20
      }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
              Pilih Bulan
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              style={{
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                fontSize: 14,
                minWidth: 120
              }}
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
              Pilih Tahun
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                fontSize: 14,
                minWidth: 100
              }}
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button
              onClick={handlePrint}
              disabled={filteredData.length === 0}
              style={{
                padding: "8px 16px",
                background: filteredData.length === 0 ? "#e2e8f0" : "#3b82f6",
                color: filteredData.length === 0 ? "#64748b" : "white",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                cursor: filteredData.length === 0 ? "not-allowed" : "pointer"
              }}
            >
              🖨️ Print
            </button>
            <button
              onClick={handleExport}
              disabled={filteredData.length === 0}
              style={{
                padding: "8px 16px",
                background: filteredData.length === 0 ? "#e2e8f0" : "#10b981",
                color: filteredData.length === 0 ? "#64748b" : "white",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                cursor: filteredData.length === 0 ? "not-allowed" : "pointer"
              }}
            >
              📊 Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
        gap: 16, 
        marginBottom: 24 
      }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>👶</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
            {stats.totalBalita}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Total Balita</div>
        </div>
        
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚖️</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#3b82f6" }}>
            {stats.totalDitimbang}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Total Ditimbang</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#10b981" }}>
            {stats.totalNormal}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            Gizi Normal ({stats.persentaseNormal}%)
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#dc2626" }}>
            {stats.totalStunting}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            Stunting ({stats.persentaseStunting}%)
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🟡</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#f59e0b" }}>
            {stats.totalGiziKurang}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            Gizi Kurang ({stats.persentaseGiziKurang}%)
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔵</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#3b82f6" }}>
            {stats.totalGiziBerlebih}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Gizi Berlebih</div>
        </div>
      </div>

      {/* Tabel Rekap */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: 20, borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
            Rekap {monthNames[selectedMonth - 1]} {selectedYear} ({filteredData.length} data)
          </h3>
        </div>
        
        {loading ? (
          <div style={{ 
            padding: 60, 
            textAlign: "center", 
            color: "#64748b",
            fontSize: 14 
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <div>Memuat data rekap...</div>
          </div>
        ) : filteredData.length === 0 ? (
          <div style={{ 
            padding: 60, 
            textAlign: "center", 
            color: "#64748b",
            fontSize: 14 
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <div>Tidak ada data penimbangan untuk {monthNames[selectedMonth - 1]} {selectedYear}</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>
              Coba pilih bulan Oktober, November, atau Desember 2024 untuk melihat data yang tersedia
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                    No
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                    Nama Balita
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                    JK
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                    Umur
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                    Tanggal Timbang
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                    BB (kg)
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                    TB (cm)
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                    Status Gizi
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                    Status Stunting
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.id}>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#64748b" }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "#0f172a" }}>
                      {item.nama_balita}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#0f172a" }}>
                      {item.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#0f172a" }}>
                      {item.umur_bulan} bulan
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#0f172a" }}>
                      {new Date(item.tanggal_timbang).toLocaleDateString("id-ID")}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#0f172a" }}>
                      {item.berat_badan}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#0f172a" }}>
                      {item.tinggi_badan}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 500,
                        background: getStatusColor(item.status_gizi) + "20",
                        color: getStatusColor(item.status_gizi)
                      }}>
                        {item.status_gizi}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 500,
                        background: getStatusColor(item.status_stunting) + "20",
                        color: getStatusColor(item.status_stunting)
                      }}>
                        {item.status_stunting}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}