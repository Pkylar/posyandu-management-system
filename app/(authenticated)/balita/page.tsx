"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { relationalService } from '../../../lib/api';
import { Balita } from '../../../lib/types';
import { useToast } from '../../../components/ui/Toast';

export default function BalitaPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("");
  
  const [balitaList, setBalitaList] = useState<Balita[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    nik: "",
    gender: "L" as "L" | "P",
    birthDate: "",
    parentName: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    document.title = "Data Balita | Posyandu";
    loadBalitaData();
  }, []);

  const loadBalitaData = async () => {
    try {
      const response = await relationalService.getRecipientOptions('balita');
      setBalitaList(response.map(item => ({
        id: item.id,
        name: item.name,
        nik: '', // Will be loaded properly
        gender: 'L' as 'L' | 'P',
        birthDate: '',
        parentName: '',
        address: '',
        phone: '',
        createdAt: '',
        updatedAt: ''
      })));
      
      // Load full data
      const { balitaApi } = await import('../../../lib/api');
      const fullResponse = await balitaApi.getAll();
      if (fullResponse.success && fullResponse.data) {
        setBalitaList(fullResponse.data);
      }
    } catch (error) {
      console.error('Error loading balita data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editMode && selectedId) {
        const { balitaApi } = await import('../../../lib/api');
        const response = await balitaApi.update(selectedId, formData);
        if (response.success) {
          addToast('success', response.message);
          
          // Update related data if name changed
          const oldBalita = balitaList.find(b => b.id === selectedId);
          if (oldBalita && oldBalita.name !== formData.name) {
            await relationalService.updateBalitaNameInRelatedData(selectedId, formData.name);
          }
          
          loadBalitaData();
        } else {
          addToast('error', response.error || 'Gagal update data');
        }
      } else {
        // Use relational service for creating new balita
        const response = await relationalService.createBalitaWithDefaults(formData);
        if (response.success) {
          addToast('success', response.message + ' (Data balita berhasil ditambahkan dengan koneksi terkait)');
          loadBalitaData();
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

  const handleEdit = (item: Balita) => {
    setFormData({
      name: item.name,
      nik: item.nik,
      gender: item.gender,
      birthDate: item.birthDate,
      parentName: item.parentName,
      address: item.address,
      phone: item.phone,
    });
    setSelectedId(item.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini? Semua data terkait (penimbangan, vitamin/vaksin) juga akan ikut terhapus.")) {
      try {
        // Use relational service to delete with related data
        const response = await relationalService.deleteBalitaWithRelatedData(id);
        if (response.success) {
          addToast('success', 'Data balita dan semua data terkait berhasil dihapus');
          loadBalitaData();
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
      parentName: "",
      address: "",
      phone: "",
    });
    setEditMode(false);
    setSelectedId(null);
  };

  const filteredData = balitaList.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       item.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       item.nik.includes(searchQuery);
    const matchGender = genderFilter === "" || item.gender === genderFilter;
    return matchSearch && matchGender;
  });

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const diffTime = today.getTime() - birth.getTime();
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    
    if (years > 0) {
      return `${years} tahun ${months} bulan`;
    } else {
      return `${months} bulan`;
    }
  };

  const getGenderColor = (gender: string) => {
    return gender === "L" ? "#3b82f6" : "#ec4899";
  };

  return (
    <div style={{ padding: 24, fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
            Data Balita
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
              + Tambah Balita
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
          Kelola data balita dan pantau perkembangan mereka
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
              placeholder="Cari nama balita, NIK, atau nama orang tua..."
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
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                fontSize: 14,
                minWidth: 120
              }}
            >
              <option value="">Semua Gender</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
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
          <div style={{ fontSize: 24, marginBottom: 8 }}>👶</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
            {balitaList.length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Total Balita</div>
        </div>
        
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>👦</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#3b82f6" }}>
            {balitaList.filter(b => b.gender === "L").length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Laki-laki</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>👧</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#ec4899" }}>
            {balitaList.filter(b => b.gender === "P").length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Perempuan</div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🆕</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#10b981" }}>
            {balitaList.filter(b => {
              const birthYear = new Date(b.birthDate).getFullYear();
              return birthYear >= 2022;
            }).length}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Balita Baru</div>
        </div>
      </div>

      {/* Daftar Balita */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: 20, borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
            Daftar Balita ({filteredData.length})
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
                  Nama Balita
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                  Gender
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                  Umur
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500, color: "#64748b" }}>
                  Orang Tua
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
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                      background: getGenderColor(item.gender) + "20",
                      color: getGenderColor(item.gender)
                    }}>
                      {item.gender === "L" ? "👦 Laki-laki" : "👧 Perempuan"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#0f172a" }}>
                    {calculateAge(item.birthDate)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{item.parentName}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      Lahir: {new Date(item.birthDate).toLocaleDateString("id-ID")}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#0f172a" }}>{item.phone}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => {
                          router.push(`/balita/${item.id}`);
                        }}
                        style={{
                          padding: "4px 8px",
                          background: "#fff",
                          border: "1px solid #10b981",
                          borderRadius: 4,
                          color: "#10b981",
                          fontSize: 12,
                          cursor: "pointer",
                          marginRight: 8
                        }}
                      >
                        Detail
                      </button>
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
                {editMode ? "Edit Data Balita" : "Tambah Balita"}
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
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                    Nama Orang Tua
                  </label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
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

              <div style={{ marginBottom: 20 }}>
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