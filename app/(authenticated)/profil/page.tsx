"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  nama: string;
  email: string;
  nomor_hp: string;
  alamat: string;
  jabatan: string;
  posyandu: string;
  tanggal_bergabung: string;
}

export default function ProfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [profileData, setProfileData] = useState<UserProfile>({
    nama: "Bidan Sari Kusuma",
    email: "sari.kusuma@posyandu.id",
    nomor_hp: "081234567890",
    alamat: "Jl. Melati Indah No. 15, RT 02/RW 03, Kelurahan Sumber Jaya",
    jabatan: "Bidan Koordinator",
    posyandu: "Posyandu Melati Indah",
    tanggal_bergabung: "2022-03-15",
  });

  const [formData, setFormData] = useState<UserProfile>(profileData);

  useEffect(() => {
    document.title = "Profil Saya | Posyandu";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setProfileData(formData);
      setEditMode(false);
      setLoading(false);
      alert("Profil berhasil diperbarui!");
    }, 1000);
  };

  const handleCancel = () => {
    setFormData(profileData);
    setEditMode(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const calculateWorkDuration = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();
    
    let totalMonths = years * 12 + months;
    if (now.getDate() < start.getDate()) {
      totalMonths--;
    }
    
    const yearsPart = Math.floor(totalMonths / 12);
    const monthsPart = totalMonths % 12;
    
    if (yearsPart > 0) {
      return `${yearsPart} tahun ${monthsPart} bulan`;
    }
    return `${monthsPart} bulan`;
  };

  return (
    <div style={{ padding: 24, fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
            Profil Saya
          </h1>
          <div style={{ display: "flex", gap: 12 }}>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
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
                ✏️ Edit Profil
              </button>
            )}
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
          Kelola informasi profil dan data personal Anda
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
        {/* Profile Card */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            {/* Avatar */}
            <div style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              color: "white",
              fontWeight: 600,
              margin: "0 auto 16px"
            }}>
              {profileData.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#0f172a" }}>
              {profileData.nama}
            </h3>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
              {profileData.jabatan}
            </p>
          </div>

          {/* Quick Stats */}
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                Posyandu
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>
                {profileData.posyandu}
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                Bergabung Sejak
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>
                {formatDate(profileData.tanggal_bergabung)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                Masa Kerja
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#10b981" }}>
                {calculateWorkDuration(profileData.tanggal_bergabung)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 20, marginTop: 20 }}>
            <button
              onClick={() => router.push("/ubah-password")}
              style={{
                width: "100%",
                padding: "10px 16px",
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
                color: "#374151",
                cursor: "pointer",
                marginBottom: 12
              }}
            >
              🔒 Ubah Password
            </button>
            
            <button
              onClick={() => {
                if (confirm("Apakah Anda yakin ingin logout?")) {
                  localStorage.clear();
                  router.push("/login");
                }
              }}
              style={{
                width: "100%",
                padding: "10px 16px",
                background: "#fff",
                border: "1px solid #fca5a5",
                borderRadius: 8,
                fontSize: 14,
                color: "#dc2626",
                cursor: "pointer"
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Profile Details */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#0f172a" }}>
              {editMode ? "Edit Informasi Profil" : "Informasi Profil"}
            </h3>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
              {editMode ? "Perbarui informasi profil Anda di bawah ini" : "Detail informasi personal dan kontak"}
            </p>
          </div>

          {editMode ? (
            /* Edit Form */
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
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
                    Nomor HP
                  </label>
                  <input
                    type="tel"
                    value={formData.nomor_hp}
                    onChange={(e) => setFormData({ ...formData, nomor_hp: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                    Jabatan
                  </label>
                  <select
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  >
                    <option value="Bidan Koordinator">Bidan Koordinator</option>
                    <option value="Bidan">Bidan</option>
                    <option value="Perawat">Perawat</option>
                    <option value="Kader Posyandu">Kader Posyandu</option>
                    <option value="Dokter">Dokter</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                  Nama Posyandu
                </label>
                <input
                  type="text"
                  value={formData.posyandu}
                  onChange={(e) => setFormData({ ...formData, posyandu: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    fontSize: 14
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                  Alamat
                </label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  required
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    fontSize: 14,
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    padding: "10px 16px",
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
                    padding: "10px 16px",
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 14,
                    cursor: "pointer",
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div style={{ display: "grid", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                    Nama Lengkap
                  </label>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>
                    {profileData.nama}
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                    Email
                  </label>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>
                    {profileData.email}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                    Nomor HP
                  </label>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>
                    {profileData.nomor_hp}
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                    Jabatan
                  </label>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>
                    {profileData.jabatan}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                  Nama Posyandu
                </label>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>
                  {profileData.posyandu}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                  Alamat
                </label>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a", lineHeight: 1.5 }}>
                  {profileData.alamat}
                </div>
              </div>

              <div style={{ 
                background: "#f8fafc", 
                border: "1px solid #e2e8f0", 
                borderRadius: 8, 
                padding: 16,
                marginTop: 16
              }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                  📅 Informasi Akun
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Tanggal Bergabung</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>
                      {formatDate(profileData.tanggal_bergabung)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Status</div>
                    <div style={{ 
                      fontSize: 12, 
                      fontWeight: 500,
                      color: "#10b981",
                      background: "#ecfdf5",
                      padding: "2px 8px",
                      borderRadius: 12,
                      display: "inline-block"
                    }}>
                      Aktif
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}