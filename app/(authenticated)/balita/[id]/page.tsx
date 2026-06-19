"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DetailBalitaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [balitaData, setBalitaData] = useState<any>(null);
  const [penimbanganHistory, setPenimbanganHistory] = useState<any[]>([]);

  useEffect(() => {
    document.title = `Detail Balita | Posyandu`;
    if (id) {
      loadBalitaDetail();
    }
  }, [id]);

  // Generate chart data from penimbangan history
  const generateChartData = (penimbanganData: any[]) => {
    if (!penimbanganData || penimbanganData.length === 0) {
      return { chartDataBerat: [], chartDataTinggi: [] };
    }

    // Sort by date (oldest first)
    const sortedData = penimbanganData.sort((a, b) => 
      new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
    );

    const chartDataBerat = sortedData.map(item => ({
      bulan: new Date(item.tanggal).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      berat: item.berat_badan,
      tanggal: item.tanggal
    }));

    const chartDataTinggi = sortedData.map(item => ({
      bulan: new Date(item.tanggal).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
      tinggi: item.tinggi_badan,
      tanggal: item.tanggal
    }));

    return { chartDataBerat, chartDataTinggi };
  };

  // Get chart data
  const { chartDataBerat, chartDataTinggi } = generateChartData(penimbanganHistory);

  const loadBalitaDetail = async () => {
    setLoading(true);
    
    try {
      const { balitaApi } = await import('../../../../lib/api');
      
      balitaApi.init();
      const allResponse = await balitaApi.getAll();
      
      if (allResponse.success && allResponse.data && allResponse.data.length > 0) {
        let foundBalita = null;
        
        // Exact string match
        foundBalita = allResponse.data.find(b => String(b.id) === String(id));
        
        // Index-based match
        if (!foundBalita) {
          const idNum = parseInt(id);
          if (!isNaN(idNum) && idNum >= 1 && idNum <= allResponse.data.length) {
            foundBalita = allResponse.data[idNum - 1];
          }
        }
        
        // Fallback to first
        if (!foundBalita && allResponse.data.length > 0) {
          foundBalita = allResponse.data[0];
        }
        
        if (foundBalita) {
          const detailData = {
            id: foundBalita.id,
            nama_lengkap: foundBalita.name,
            jenis_kelamin: foundBalita.gender,
            tempat_lahir: foundBalita.birthPlace || "Jakarta",
            tanggal_lahir: foundBalita.birthDate,
            nama_ayah: foundBalita.fatherName || "Ayah " + foundBalita.name,
            nama_ibu: foundBalita.motherName || foundBalita.parentName,
            golongan_darah: foundBalita.bloodType || "O",
            berat_lahir: foundBalita.birthWeight || 3.2,
            panjang_lahir: foundBalita.birthHeight || 48,
            alamat: foundBalita.address,
            rt: foundBalita.rt || "02",
            rw: foundBalita.rw || "01",
          };
          
          setBalitaData(detailData);
          
          // Load actual penimbangan data for this balita
          try {
            const { penimbanganApi } = await import('../../../../lib/api');
            penimbanganApi.init();
            console.log('Loading penimbangan for balita ID:', foundBalita.id);
            const penimbanganResponse = await penimbanganApi.getByBalitaId(foundBalita.id);
            
            console.log('Penimbangan API Response:', penimbanganResponse);
            
            if (penimbanganResponse.success && penimbanganResponse.data) {
              console.log('Raw penimbangan data:', penimbanganResponse.data);
              // Transform API data to match component structure
              const transformedData = penimbanganResponse.data.map(p => ({
                id: p.id,
                tanggal: p.date,
                umur_bulan: p.age,
                berat_badan: p.weight,
                tinggi_badan: p.height,
                lingkar_kepala: 48, // Default value since not in API
                status_gizi: p.nutritionStatus === 'normal' ? 'Gizi Baik' : 
                            p.nutritionStatus === 'kurang' ? 'Gizi Kurang' : 
                            p.nutritionStatus === 'berlebih' ? 'Gizi Berlebih' : 'Obesitas',
                status_stunting: p.stuntingStatus === 'normal' ? 'Normal' : 
                                p.stuntingStatus === 'stunting' ? 'Stunting' : 'Severely Stunted',
              }));
              console.log('Transformed penimbangan data:', transformedData);
              setPenimbanganHistory(transformedData);
            } else {
              console.log('No penimbangan data found or API failed');
              setPenimbanganHistory([]);
            }
          } catch (error) {
            console.error('Error loading penimbangan data:', error);
            setPenimbanganHistory([]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading balita detail:', error);
    }

    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const ageMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    const years = Math.floor(ageMonths / 12);
    const months = ageMonths % 12;
    return `${years} tahun ${months} bulan`;
  };

  const getStatusColor = (status: string) => {
    if (status.includes("Normal") || status.includes("Baik")) return "#10b981";
    if (status.includes("Kurang")) return "#f59e0b";
    return "#dc2626";
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
        Memuat detail balita...
      </div>
    );
  }

  if (!id || !balitaData) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#dc2626" }}>
        <h2>Data balita tidak ditemukan</h2>
        <button
          onClick={() => router.push('/balita')}
          style={{
            padding: "8px 16px",
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            cursor: "pointer",
            marginTop: 16
          }}
        >
          ← Kembali ke Data Balita
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "Inter, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
          <button
            onClick={() => router.push('/balita')}
            style={{
              padding: "8px 16px",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 14,
              cursor: "pointer"
            }}
          >
            ← Kembali
          </button>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
            Detail Balita
          </h1>
        </div>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
          Informasi lengkap dan riwayat pertumbuhan balita
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Data Diri */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24 }}>
          <h3 style={{ margin: 0, marginBottom: 20, fontSize: 18, fontWeight: 600, color: "#0f172a" }}>
            Data Diri Balita
          </h3>
          
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#64748b" }}>Nama Lengkap</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{balitaData.nama_lengkap}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#64748b" }}>Jenis Kelamin</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>
                {balitaData.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#64748b" }}>Tempat Lahir</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{balitaData.tempat_lahir}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#64748b" }}>Tanggal Lahir</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{formatDate(balitaData.tanggal_lahir)}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#64748b" }}>Umur</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{calculateAge(balitaData.tanggal_lahir)}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#64748b" }}>Golongan Darah</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{balitaData.golongan_darah}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#64748b" }}>Berat Lahir</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{balitaData.berat_lahir} kg</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#64748b" }}>Panjang Lahir</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{balitaData.panjang_lahir} cm</span>
            </div>
          </div>
        </div>

        {/* Data Keluarga */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24 }}>
          <h3 style={{ margin: 0, marginBottom: 20, fontSize: 18, fontWeight: 600, color: "#0f172a" }}>
            Data Keluarga & Alamat
          </h3>
          
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#64748b" }}>Nama Ayah</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{balitaData.nama_ayah}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#64748b" }}>Nama Ibu</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{balitaData.nama_ibu}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "start" }}>
              <span style={{ fontSize: 14, color: "#64748b" }}>Alamat</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a", lineHeight: 1.5 }}>{balitaData.alamat}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "center" }}>
              <span style={{ fontSize: 14, color: "#64748b" }}>RT / RW</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{balitaData.rt} / {balitaData.rw}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Riwayat Penimbangan */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24, marginTop: 24 }}>
        <h3 style={{ margin: 0, marginBottom: 20, fontSize: 18, fontWeight: 600, color: "#0f172a" }}>
          Riwayat Penimbangan ({penimbanganHistory.length} data)
        </h3>
        
        {penimbanganHistory.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: 40, 
            color: "#64748b", 
            fontSize: 14,
            border: "2px dashed #e2e8f0",
            borderRadius: 8
          }}>
            <div style={{ marginBottom: 16 }}>
              <strong>Belum ada data penimbangan untuk balita ini.</strong>
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>
              Debug Info:
              <br />• ID Balita: {balitaData?.id}
              <br />• Nama: {balitaData?.nama_lengkap}
              <br />• Total data penimbangan: {penimbanganHistory.length}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>Tanggal</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>Umur</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>BB (kg)</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>TB (cm)</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>LK (cm)</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>Status Gizi</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>Status Stunting</th>
              </tr>
            </thead>
            <tbody>
              {penimbanganHistory.map((record) => (
                <tr key={record.id}>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#0f172a" }}>
                    {formatDate(record.tanggal)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#0f172a" }}>
                    {record.umur_bulan} bulan
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#0f172a" }}>
                    {record.berat_badan}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#0f172a" }}>
                    {record.tinggi_badan}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#0f172a" }}>
                    {record.lingkar_kepala}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                      background: getStatusColor(record.status_gizi) + "20",
                      color: getStatusColor(record.status_gizi)
                    }}>
                      {record.status_gizi}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                      background: getStatusColor(record.status_stunting) + "20",
                      color: getStatusColor(record.status_stunting)
                    }}>
                      {record.status_stunting}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Grafik Pertumbuhan */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
        gap: 24, 
        marginTop: 24 
      }}>
        {/* Grafik Berat Badan */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24 }}>
          <h3 style={{ margin: 0, marginBottom: 20, fontSize: 18, fontWeight: 600, color: "#0f172a" }}>
            Grafik Berat Badan
          </h3>
          <div style={{ height: 300, width: "100%" }}>
            {chartDataBerat.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartDataBerat}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="bulan" 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    label={{ value: 'Berat (kg)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value, name) => [`${value} kg`, 'Berat Badan']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="berat" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                height: "100%", 
                color: "#64748b", 
                fontSize: 14 
              }}>
                Belum ada data penimbangan
              </div>
            )}
          </div>
        </div>

        {/* Grafik Tinggi Badan */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24 }}>
          <h3 style={{ margin: 0, marginBottom: 20, fontSize: 18, fontWeight: 600, color: "#0f172a" }}>
            Grafik Tinggi Badan
          </h3>
          <div style={{ height: 300, width: "100%" }}>
            {chartDataTinggi.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartDataTinggi}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="bulan" 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    label={{ value: 'Tinggi (cm)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value, name) => [`${value} cm`, 'Tinggi Badan']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tinggi" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                height: "100%", 
                color: "#64748b", 
                fontSize: 14 
              }}>
                Belum ada data penimbangan
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}