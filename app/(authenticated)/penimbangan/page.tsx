"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { relationalService } from '../../../lib/api';
import { useToast } from '../../../components/ui/Toast';

export default function PenimbanganPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [penimbanganList, setPenimbanganList] = useState<any[]>([]);
  const [balitaOptions, setBalitaOptions] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    balitaId: "",
    balitaName: "",
    date: new Date().toISOString().split('T')[0],
    weight: "",
    height: "",
    notes: "",
  });

  useEffect(() => {
    document.title = "Data Penimbangan | Posyandu";
    loadPenimbanganData();
    loadBalitaOptions();
  }, []);

  const loadPenimbanganData = async () => {
    try {
      // Hit server API route (logs appear in terminal)
      fetch('/api/penimbangan').catch(() => {});
      
      const { penimbanganApi } = await import('../../../lib/api');
      const response = await penimbanganApi.getAll();
      if (response.success && response.data) {
        setPenimbanganList(response.data);
      }
    } catch (error) {
      console.error('Error loading penimbangan data:', error);
    }
  };

  const loadBalitaOptions = async () => {
    try {
      const options = await relationalService.getRecipientOptions('balita');
      setBalitaOptions(options);
    } catch (error) {
      console.error('Error loading balita options:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const penimbanganData = {
        ...formData,
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height)
      };

      if (editMode && selectedId) {
        const { penimbanganApi } = await import('../../../lib/api');
        const response = await penimbanganApi.update(selectedId, penimbanganData);
        if (response.success) {
          fetch('/api/penimbangan', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({action:'update', id: selectedId, ...penimbanganData}) }).catch(() => {});
          addToast('success', response.message);
          loadPenimbanganData();
        } else {
          addToast('error', response.error || 'Gagal update data');
        }
      } else {
        // Use relational service to create with activity
        const response = await relationalService.createPenimbanganWithActivity(penimbanganData);
        if (response.success) {
          fetch('/api/penimbangan', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({action:'create', ...penimbanganData}) }).catch(() => {});
          addToast('success', 'Data penimbangan berhasil ditambahkan dan aktivitas tercatat');
          loadPenimbanganData();
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

  const handleBalitaChange = (balitaId: string) => {
    const selectedBalita = balitaOptions.find(b => b.id === balitaId);
    setFormData({
      ...formData,
      balitaId,
      balitaName: selectedBalita ? selectedBalita.name : ""
    });
  };

  const handleEdit = (item: any) => {
    setFormData({
      balitaId: item.balitaId,
      balitaName: item.balitaName,
      date: item.date,
      weight: item.weight.toString(),
      height: item.height.toString(),
      notes: item.notes || "",
    });
    setSelectedId(item.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data penimbangan ini?")) {
      try {
        const { penimbanganApi } = await import('../../../lib/api');
        const response = await penimbanganApi.delete(id);
        if (response.success) {
          addToast('success', response.message);
          loadPenimbanganData();
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
      balitaId: "",
      balitaName: "",
      date: new Date().toISOString().split('T')[0],
      weight: "",
      height: "",
      notes: "",
    });
    setEditMode(false);
    setSelectedId(null);
  };

  const filteredData = penimbanganList.filter(item => 
    item.balitaName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return "#10b981";
      case 'kurang': return "#f59e0b";
      case 'berlebih': return "#3b82f6";
      case 'obesitas': return "#dc2626";
      default: return "#64748b";
    }
  };

  const getStuntingColor = (status: string) => {
    switch (status) {
      case 'normal': return "#10b981";
      case 'stunting': return "#f59e0b";
      case 'severely_stunted': return "#dc2626";
      default: return "#64748b";
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
            Data Penimbangan
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
              + Tambah Penimbangan
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
          Catat dan pantau perkembangan berat dan tinggi badan balita
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
              placeholder="Cari nama balita..."
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
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚖️</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
            {penimbanganList.length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Total Penimbangan</div>
        </div>
        
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#10b981" }}>
            {penimbanganList.filter(p => p.nutritionStatus === "normal").length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Gizi Normal</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#f59e0b" }}>
            {penimbanganList.filter(p => p.nutritionStatus === "kurang").length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Gizi Kurang</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🚨</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#dc2626" }}>
            {penimbanganList.filter(p => p.stuntingStatus !== "normal").length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Kasus Stunting</div>
        </div>
      </div>

      {/* Daftar Penimbangan */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: 20, borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
            Riwayat Penimbangan ({filteredData.length})
          </h3>
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>No</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>Nama Balita</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>Tanggal</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>Berat/Tinggi</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>Status Gizi</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>Status Stunting</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={item.id}>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#64748b" }}>{index + 1}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{item.balitaName}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Umur: {item.age} bulan</div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#0f172a" }}>
                    {new Date(item.date).toLocaleDateString("id-ID")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{item.weight} kg</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{item.height} cm</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                      background: getStatusColor(item.nutritionStatus) + "20",
                      color: getStatusColor(item.nutritionStatus)
                    }}>
                      {item.nutritionStatus}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                      background: getStuntingColor(item.stuntingStatus) + "20",
                      color: getStuntingColor(item.stuntingStatus)
                    }}>
                      {item.stuntingStatus}
                    </span>
                  </td>
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
            maxWidth: 500,
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                {editMode ? "Edit Data Penimbangan" : "Tambah Penimbangan"}
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
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                  Pilih Balita
                </label>
                <select
                  value={formData.balitaId}
                  onChange={(e) => handleBalitaChange(e.target.value)}
                  required
                  disabled={editMode}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    fontSize: 14,
                    background: editMode ? "#f8fafc" : "#fff"
                  }}
                >
                  <option value="">Pilih Balita</option>
                  {balitaOptions.map(balita => (
                    <option key={balita.id} value={balita.id}>
                      {balita.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                    Berat (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
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
                    Tinggi (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
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
                  Catatan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    fontSize: 14,
                    resize: "vertical"
                  }}
                  placeholder="Catatan tambahan (opsional)"
                />
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