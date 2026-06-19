"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { relationalService } from '../../../lib/api';
import { useToast } from '../../../components/ui/Toast';

interface VitaminVaksin {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientType: 'balita' | 'ibu_menyusui' | 'lansia';
  type: 'vitamin' | 'vaksin';
  name: string;
  date: string;
  notes?: string;
}

export default function VitaminVaksinPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<string>("");
  const [recipientTypeFilter, setRecipientTypeFilter] = useState<string>("");
  
  const [vitaminVaksinList, setVitaminVaksinList] = useState<VitaminVaksin[]>([]);
  const [balitaOptions, setBalitaOptions] = useState<any[]>([]);
  const [ibuMenyusuiOptions, setIbuMenyusuiOptions] = useState<any[]>([]);
  const [lansiaOptions, setLansiaOptions] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    recipientId: "",
    recipientName: "",
    recipientType: "balita" as 'balita' | 'ibu_menyusui' | 'lansia',
    type: "vitamin" as 'vitamin' | 'vaksin',
    name: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const vitaminOptions = [
    "Vitamin A (200.000 IU)",
    "Vitamin A (100.000 IU)", 
    "Vitamin C",
    "Vitamin D",
    "Tablet Tambah Darah (Fe)",
    "Kalsium Lactate",
    "Multivitamin Senior"
  ];

  const vaksinOptions = [
    "BCG",
    "Hepatitis B",
    "Polio (OPV)",
    "Polio (IPV)",
    "DPT-HB-Hib (Pentabio)",
    "Pneumokokus (PCV)",
    "Rotavirus",
    "Campak Rubella (MR)",
    "Japanese Encephalitis (JE)",
    "Varicella",
    "Influenza",
    "Hepatitis A",
    "Tifoid"
  ];

  useEffect(() => {
    document.title = "Vitamin & Vaksin | Posyandu";
    loadVitaminVaksinData();
    loadRecipientOptions();
  }, []);

  // Refresh recipient options when modal opens
  useEffect(() => {
    if (showModal) {
      loadRecipientOptions();
    }
  }, [showModal]);

  const loadVitaminVaksinData = async () => {
    try {
      const { vitaminVaksinApi } = await import('../../../lib/api');
      vitaminVaksinApi.init();
      const response = await vitaminVaksinApi.getAll();
      if (response.success && response.data) {
        setVitaminVaksinList(response.data);
      }
    } catch (error) {
      console.error('Error loading vitamin vaksin data:', error);
    }
  };

  const loadRecipientOptions = async () => {
    try {
      const [balitaOpts, ibuOpts, lansiaOpts] = await Promise.all([
        relationalService.getRecipientOptions('balita'),
        relationalService.getRecipientOptions('ibu_menyusui'),
        relationalService.getRecipientOptions('lansia')
      ]);
      
      console.log('Balita options:', balitaOpts);
      console.log('Ibu Menyusui options:', ibuOpts);
      console.log('Lansia options:', lansiaOpts);
      
      setBalitaOptions(balitaOpts);
      setIbuMenyusuiOptions(ibuOpts);
      setLansiaOptions(lansiaOpts);
    } catch (error) {
      console.error('Error loading recipient options:', error);
    }
  };

  const getCurrentRecipientOptions = () => {
    switch (formData.recipientType) {
      case 'balita': return balitaOptions;
      case 'ibu_menyusui': return ibuMenyusuiOptions;
      case 'lansia': return lansiaOptions;
      default: return [];
    }
  };

  const getCurrentVitaminVaksinOptions = () => {
    return formData.type === 'vitamin' ? vitaminOptions : vaksinOptions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const vitaminVaksinData = {
        ...formData
      };

      if (editMode && selectedId) {
        const { vitaminVaksinApi } = await import('../../../lib/api');
        const response = await vitaminVaksinApi.update(selectedId, vitaminVaksinData);
        if (response.success) {
          addToast('success', response.message);
          loadVitaminVaksinData();
        } else {
          addToast('error', response.error || 'Gagal update data');
        }
      } else {
        // Use relational service to create with activity
        const response = await relationalService.createVitaminVaksinWithActivity(vitaminVaksinData);
        if (response.success) {
          addToast('success', 'Data vitamin/vaksin berhasil ditambahkan dan aktivitas tercatat');
          loadVitaminVaksinData();
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

  const handleRecipientChange = (recipientId: string) => {
    const currentOptions = getCurrentRecipientOptions();
    const selectedRecipient = currentOptions.find(r => r.id === recipientId);
    setFormData({
      ...formData,
      recipientId,
      recipientName: selectedRecipient ? selectedRecipient.name : ""
    });
  };

  const handleEdit = (item: VitaminVaksin) => {
    setFormData({
      recipientId: item.recipientId,
      recipientName: item.recipientName,
      recipientType: item.recipientType,
      type: item.type,
      name: item.name,
      date: item.date,
      notes: item.notes || "",
    });
    setSelectedId(item.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus record ini?")) {
      try {
        const { vitaminVaksinApi } = await import('../../../lib/api');
        const response = await vitaminVaksinApi.delete(id);
        if (response.success) {
          addToast('success', response.message);
          loadVitaminVaksinData();
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
      recipientId: "",
      recipientName: "",
      recipientType: "balita",
      type: "vitamin",
      name: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setEditMode(false);
    setSelectedId(null);
  };

  const filteredData = vitaminVaksinList.filter(item => {
    const matchSearch = item.recipientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori = kategoriFilter === "" || item.type === kategoriFilter;
    const matchRecipientType = recipientTypeFilter === "" || item.recipientType === recipientTypeFilter;
    return matchSearch && matchKategori && matchRecipientType;
  });

  const getTypeColor = (type: string) => {
    return type === "vitamin" ? "#10b981" : "#3b82f6";
  };

  const getRecipientTypeLabel = (type: string) => {
    switch (type) {
      case 'balita': return 'Balita';
      case 'ibu_menyusui': return 'Ibu Menyusui';
      case 'lansia': return 'Lansia';
      default: return type;
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
            Vitamin & Vaksin
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
              + Tambah Record
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
          Kelola pemberian vitamin dan vaksinasi untuk balita, ibu menyusui, dan lansia
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
              placeholder="Cari nama penerima..."
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
              value={recipientTypeFilter}
              onChange={(e) => setRecipientTypeFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                fontSize: 14,
                minWidth: 120
              }}
            >
              <option value="">Semua Kategori</option>
              <option value="balita">Balita</option>
              <option value="ibu_menyusui">Ibu Menyusui</option>
              <option value="lansia">Lansia</option>
            </select>
          </div>
          <div>
            <select
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                fontSize: 14,
                minWidth: 120
              }}
            >
              <option value="">Semua Tipe</option>
              <option value="vitamin">Vitamin</option>
              <option value="vaksin">Vaksin</option>
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
          <div style={{ fontSize: 24, marginBottom: 8 }}>💉</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
            {vitaminVaksinList.length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Total Record</div>
        </div>
        
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🟢</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#10b981" }}>
            {vitaminVaksinList.filter(v => v.type === "vitamin").length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Pemberian Vitamin</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔵</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#3b82f6" }}>
            {vitaminVaksinList.filter(v => v.type === "vaksin").length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Imunisasi</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📅</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#f59e0b" }}>
            {vitaminVaksinList.filter(v => {
              const recordDate = new Date(v.date);
              const currentMonth = new Date().getMonth();
              return recordDate.getMonth() === currentMonth;
            }).length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Bulan Ini</div>
        </div>
      </div>

      {/* Daftar Records */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: 20, borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
            Riwayat Vitamin & Vaksin ({filteredData.length})
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
                  Nama Penerima
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                  Kategori
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                  Jenis Vitamin/Vaksin
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                  Tanggal Pemberian
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                  Catatan
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
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>
                      {item.recipientName}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {getRecipientTypeLabel(item.recipientType)}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                      background: getTypeColor(item.type) + "20",
                      color: getTypeColor(item.type)
                    }}>
                      {item.type === 'vitamin' ? 'Vitamin' : 'Vaksin'}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#0f172a" }}>
                    {item.name}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#0f172a" }}>
                    {new Date(item.date).toLocaleDateString("id-ID")}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#64748b", maxWidth: 200 }}>
                    <div style={{ 
                      overflow: "hidden", 
                      textOverflow: "ellipsis", 
                      whiteSpace: "nowrap" 
                    }}>
                      {item.notes || "-"}
                    </div>
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
                {editMode ? "Edit Record" : "Tambah Record Baru"}
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
                  Kategori Penerima
                </label>
                <select
                  value={formData.recipientType}
                  onChange={(e) => setFormData({ ...formData, recipientType: e.target.value as any, recipientId: "", recipientName: "" })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    fontSize: 14
                  }}
                >
                  <option value="balita">Balita</option>
                  <option value="ibu_menyusui">Ibu Menyusui</option>
                  <option value="lansia">Lansia</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                  Pilih {getRecipientTypeLabel(formData.recipientType)} ({getCurrentRecipientOptions().length} tersedia)
                </label>
                <select
                  value={formData.recipientId}
                  onChange={(e) => handleRecipientChange(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    fontSize: 14
                  }}
                >
                  <option value="">Pilih {getRecipientTypeLabel(formData.recipientType).toLowerCase()}...</option>
                  {getCurrentRecipientOptions().map(recipient => (
                    <option key={recipient.id} value={recipient.id}>
                      {recipient.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                    Tipe
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any, name: "" })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  >
                    <option value="vitamin">Vitamin</option>
                    <option value="vaksin">Vaksin</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                    Tanggal Pemberian
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
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                  Jenis {formData.type === 'vitamin' ? 'Vitamin' : 'Vaksin'}
                </label>
                <select
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
                >
                  <option value="">Pilih jenis {formData.type}...</option>
                  {getCurrentVitaminVaksinOptions().map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                  Catatan (Opsional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Masukkan catatan tambahan..."
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