"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { relationalService } from '../../../lib/api';
import { IbuMenyusui } from '../../../lib/types';
import { useToast } from '../../../components/ui/Toast';

export default function IbuMenyusuiPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  const [ibuMenyusuiList, setIbuMenyusuiList] = useState<IbuMenyusui[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    nik: "",
    birthDate: "",
    address: "",
    phone: "",
    childBirthDate: "",
    breastfeedingStatus: "eksklusif" as "eksklusif" | "campuran" | "formula",
    healthStatus: "sehat" as "sehat" | "perlu_perhatian" | "rujukan",
    notes: ""
  });

  useEffect(() => {
    document.title = "Data Ibu Menyusui | Posyandu";
    loadIbuMenyusuiData();
  }, []);

  const loadIbuMenyusuiData = async () => {
    try {
      const { ibuMenyusuiApi } = await import('../../../lib/api');
      const response = await ibuMenyusuiApi.getAll();
      if (response.success && response.data) {
        setIbuMenyusuiList(response.data);
      }
    } catch (error) {
      console.error('Error loading ibu menyusui data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editMode && selectedId) {
        const { ibuMenyusuiApi } = await import('../../../lib/api');
        const response = await ibuMenyusuiApi.update(selectedId, formData);
        if (response.success) {
          addToast('success', response.message);
          loadIbuMenyusuiData();
        } else {
          addToast('error', response.error || 'Gagal update data');
        }
      } else {
        const { ibuMenyusuiApi } = await import('../../../lib/api');
        const response = await ibuMenyusuiApi.create(formData);
        if (response.success) {
          addToast('success', 'Data ibu menyusui berhasil ditambahkan');
          loadIbuMenyusuiData();
          
          // Add activity
          await relationalService.addActivity({
            type: 'checkup',
            description: `Ibu menyusui baru ${formData.name} telah didaftarkan`,
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

  const handleEdit = (item: IbuMenyusui) => {
    setFormData({
      name: item.name,
      nik: item.nik,
      birthDate: item.birthDate,
      address: item.address,
      phone: item.phone,
      childBirthDate: item.childBirthDate,
      breastfeedingStatus: item.breastfeedingStatus,
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
        const { ibuMenyusuiApi } = await import('../../../lib/api');
        const response = await ibuMenyusuiApi.delete(id);
        if (response.success) {
          addToast('success', response.message);
          loadIbuMenyusuiData();
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
      birthDate: "",
      address: "",
      phone: "",
      childBirthDate: "",
      breastfeedingStatus: "eksklusif",
      healthStatus: "sehat",
      notes: ""
    });
    setEditMode(false);
    setSelectedId(null);
  };

  const filteredData = ibuMenyusuiList.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       item.nik.includes(searchQuery);
    const matchStatus = statusFilter === "" || item.breastfeedingStatus === statusFilter;
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
      case "eksklusif": return "#10b981";
      case "campuran": return "#f59e0b";
      case "formula": return "#dc2626";
      default: return "#64748b";
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "sehat": return "#10b981";
      case "perlu_perhatian": return "#f59e0b";
      case "rujukan": return "#dc2626";
      default: return "#64748b";
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
            Data Ibu Menyusui
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
              + Tambah Ibu Menyusui
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
          Kelola data ibu menyusui dan status ASI mereka
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
              placeholder="Cari nama ibu atau NIK..."
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
                minWidth: 120
              }}
            >
              <option value="">Semua Status ASI</option>
              <option value="eksklusif">Eksklusif</option>
              <option value="campuran">Campuran</option>
              <option value="formula">Formula</option>
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
          <div style={{ fontSize: 24, marginBottom: 8 }}>🤱</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
            {ibuMenyusuiList.length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Total Ibu Menyusui</div>
        </div>
        
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#10b981" }}>
            {ibuMenyusuiList.filter(i => i.breastfeedingStatus === "eksklusif").length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>ASI Eksklusif</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#f59e0b" }}>
            {ibuMenyusuiList.filter(i => i.breastfeedingStatus === "campuran").length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>ASI Campuran</div>
        </div>
      </div>

      {/* Daftar Ibu Menyusui */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: 20, borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
            Daftar Ibu Menyusui ({filteredData.length})
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
                  Nama Ibu
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                  Umur
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                  Bayi
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                  Status ASI
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
              {filteredData.map((item, index) => (
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
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>Bayi Lahir:</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {new Date(item.childBirthDate).toLocaleDateString("id-ID")}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                      background: getStatusColor(item.breastfeedingStatus) + "20",
                      color: getStatusColor(item.breastfeedingStatus)
                    }}>
                      {item.breastfeedingStatus}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                      background: getHealthStatusColor(item.healthStatus) + "20",
                      color: getHealthStatusColor(item.healthStatus)
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
              ))}
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
                {editMode ? "Edit Data Ibu Menyusui" : "Tambah Ibu Menyusui"}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                    Tanggal Melahirkan
                  </label>
                  <input
                    type="date"
                    value={formData.childBirthDate}
                    onChange={(e) => setFormData({ ...formData, childBirthDate: e.target.value })}
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
                    Status ASI
                  </label>
                  <select
                    value={formData.breastfeedingStatus}
                    onChange={(e) => setFormData({ ...formData, breastfeedingStatus: e.target.value as any })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  >
                    <option value="eksklusif">ASI Eksklusif</option>
                    <option value="campuran">ASI + Formula</option>
                    <option value="formula">Formula Saja</option>
                  </select>
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