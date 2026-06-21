"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { relationalService } from '../../../lib/api';
import { Lansia } from '../../../lib/types';
import { useToast } from '../../../components/ui/Toast';

export default function LansiaPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  const [lansiaList, setLansiaList] = useState<Lansia[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    nik: "",
    gender: "L" as "L" | "P",
    birthDate: "",
    address: "",
    phone: "",
    weight: 0,
    height: 0,
    bloodPressure: "",
    healthStatus: "sehat" as "sehat" | "perlu_perhatian" | "rujukan",
    notes: ""
  });

  useEffect(() => {
    document.title = "Data Lansia | Posyandu";
    loadLansiaData();
  }, []);

  const loadLansiaData = async () => {
    try {
      // Hit server API route (logs appear in terminal)
      fetch('/api/lansia').catch(() => {});
      
      const { lansiaApi } = await import('../../../lib/api');
      const response = await lansiaApi.getAll();
      if (response.success && response.data) {
        setLansiaList(response.data);
      }
    } catch (error) {
      console.error('Error loading lansia data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editMode && selectedId) {
        const { lansiaApi } = await import('../../../lib/api');
        const response = await lansiaApi.update(selectedId, formData);
        if (response.success) {
          addToast('success', response.message);
          loadLansiaData();
        } else {
          addToast('error', response.error || 'Gagal update data');
        }
      } else {
        const { lansiaApi } = await import('../../../lib/api');
        const response = await lansiaApi.create(formData);
        if (response.success) {
          addToast('success', 'Data lansia berhasil ditambahkan');
          loadLansiaData();
          
          // Add activity
          await relationalService.addActivity({
            type: 'checkup',
            description: `Lansia baru ${formData.name} telah didaftarkan`,
            date: new Date().toISOString()
          });
        } else {
          addToast('error', response.error || 'Gagal tambah data');
        }
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      addToast('error', 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Lansia) => {
    setFormData({
      name: item.name,
      nik: item.nik,
      gender: item.gender,
      birthDate: item.birthDate,
      address: item.address,
      phone: item.phone,
      weight: item.weight,
      height: item.height,
      bloodPressure: item.bloodPressure,
      healthStatus: item.healthStatus,
      notes: item.notes || ""
    });
    setSelectedId(item.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const { lansiaApi } = await import('../../../lib/api');
        const response = await lansiaApi.delete(id);
        if (response.success) {
          addToast('success', response.message);
          loadLansiaData();
        } else {
          addToast('error', response.error || 'Gagal hapus data');
        }
      } catch (error) {
        addToast('error', 'Terjadi kesalahan');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      nik: "",
      gender: "L",
      birthDate: "",
      address: "",
      phone: "",
      weight: 0,
      height: 0,
      bloodPressure: "",
      healthStatus: "sehat",
      notes: ""
    });
    setEditMode(false);
    setSelectedId(null);
  };

  const filteredData = lansiaList.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       item.nik.includes(searchQuery);
    const matchStatus = statusFilter === "" || item.healthStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sehat": return "#10b981";
      case "perlu_perhatian": return "#f59e0b";
      case "rujukan": return "#dc2626";
      default: return "#64748b";
    }
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return "Kurus";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Gemuk";
    return "Obesitas";
  };

  return (
    <div style={{ padding: 24, fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
            Data Lansia
          </h1>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => { setShowModal(true); resetForm(); }}
              style={{
                padding: "8px 16px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              + Tambah Data Lansia
            </button>
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
          Kelola data lansia dan monitoring kesehatan mereka
        </p>
      </div>

      {/* Filter dan Search */}
      <div style={{ 
        background: "#fff", 
        borderRadius: 12, 
        border: "1px solid #e2e8f0", 
        padding: 20,
        marginBottom: 20
      }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input
              type="text"
              placeholder="Cari nama atau NIK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                fontSize: 14
              }}
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                fontSize: 14,
                minWidth: 150
              }}
            >
              <option value="">Semua Status</option>
              <option value="sehat">Sehat</option>
              <option value="perlu_perhatian">Perlu Perhatian</option>
              <option value="rujukan">Rujukan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: 16, 
        marginBottom: 24 
      }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>👴</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
            {lansiaList.length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Total Lansia</div>
        </div>
        
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#10b981" }}>
            {lansiaList.filter(l => l.healthStatus === "sehat").length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Status Sehat</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#f59e0b" }}>
            {lansiaList.filter(l => l.healthStatus === "perlu_perhatian").length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Perlu Perhatian</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🚨</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#dc2626" }}>
            {lansiaList.filter(l => l.healthStatus === "rujukan").length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Rujukan</div>
        </div>
      </div>

      {/* Daftar Lansia */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: 20, borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
            Daftar Lansia ({filteredData.length})
          </h3>
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                  No
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                  Nama
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                  Umur
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                  Tekanan Darah
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                  BMI
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                  Status Kesehatan
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                  No HP
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => {
                const bmiStatus = getBMIStatus(item.bmi);
                return (
                  <tr key={item.id}>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#64748b" }}>{index + 1}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>NIK: {item.nik}</div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#0f172a" }}>
                      {calculateAge(item.birthDate)} tahun
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: 14, color: "#0f172a" }}>{item.bloodPressure}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>mmHg</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: 14, color: "#0f172a" }}>{item.bmi}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>({bmiStatus})</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 500,
                        background: getStatusColor(item.healthStatus) + "20",
                        color: getStatusColor(item.healthStatus)
                      }}>
                        {item.healthStatus}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#0f172a" }}>{item.phone}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleEdit(item)}
                          style={{
                            padding: "4px 8px",
                            background: "#fff",
                            border: "1px solid #3b82f6",
                            borderRadius: 4,
                            color: "#3b82f6",
                            fontSize: 12,
                            cursor: "pointer"
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{
                            padding: "4px 8px",
                            background: "#fff",
                            border: "1px solid #dc2626",
                            borderRadius: 4,
                            color: "#dc2626",
                            fontSize: 12,
                            cursor: "pointer"
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            width: "90%",
            maxWidth: 600,
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                {editMode ? "Edit Data Lansia" : "Tambah Data Lansia"}
              </h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "#64748b"
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                    NIK
                  </label>
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    required
                    maxLength={16}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as "L" | "P" })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                    Nomor HP
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                  Alamat
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    fontSize: 14,
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                    Tekanan Darah
                  </label>
                  <input
                    type="text"
                    value={formData.bloodPressure}
                    onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                    placeholder="120/80"
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                    Berat Badan (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight || ""}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                    Tinggi Badan (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.height || ""}
                    onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                  Status Kesehatan
                </label>
                <select
                  value={formData.healthStatus}
                  onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value as any })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    fontSize: 14
                  }}
                >
                  <option value="sehat">Sehat</option>
                  <option value="perlu_perhatian">Perlu Perhatian</option>
                  <option value="rujukan">Rujukan</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  style={{
                    padding: "8px 16px",
                    background: "#fff",
                    color: "#64748b",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    fontSize: 14,
                    cursor: "pointer"
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "8px 16px",
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 14,
                    cursor: "pointer",
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? "Menyimpan..." : editMode ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}