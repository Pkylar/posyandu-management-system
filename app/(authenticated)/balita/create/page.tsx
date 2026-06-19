"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateBalitaPage() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [jenis, setJenis] = useState<"L" | "P" | "">("");
  const [tanggal, setTanggal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("access_token");
    if (!t) {
      router.push("/login");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!nama.trim() || !jenis || !tanggal) {
      setError("Semua field harus diisi.");
      return;
    }
    setLoading(true);
    try {
      const form = new URLSearchParams();
      form.append("nama_lengkap", nama.trim());
      form.append("jenis_kelamin", jenis);
      form.append("tanggal_lahir", tanggal);

      const t = localStorage.getItem("access_token");
      const tt = localStorage.getItem("token_type") || "Bearer";
      const res = await fetch("/api/proxy/balita/create", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `${tt} ${t}` },
        body: form.toString(),
        credentials: "omit",
      });

      const text = await res.text().catch(() => "");
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
      console.log('CREATE /api/proxy/balita/create', res.status, data);
      if (!res.ok) {
        setError(data.message || `HTTP ${res.status}`);
        return;
      }

      // show success notification then go back to list
      setSuccess("Balita berhasil ditambahkan.");
      setTimeout(() => router.push("/dashboard/balita"), 900);
    } catch (err: any) {
      setError(err?.message || "Request gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Buat Balita</h1>
      <p style={{ color: "#6b7280", marginTop: 6 }}>Isi data balita baru.</p>

      <form onSubmit={handleSubmit} style={{ marginTop: 18, maxWidth: 520 }}>
        <label style={{ display: "block", marginBottom: 8, fontSize: 13 }}>Nama Lengkap</label>
        <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama lengkap" style={{ width: "100%", height: 38, padding: 8, borderRadius: 8, border: "1px solid #e4e4e7" }} />

        <label style={{ display: "block", marginTop: 12, marginBottom: 8, fontSize: 13 }}>Jenis Kelamin</label>
        <select value={jenis} onChange={(e) => setJenis(e.target.value as any)} style={{ width: 200, height: 38, padding: 8, borderRadius: 8, border: "1px solid #e4e4e7" }}>
          <option value="">Pilih jenis</option>
          <option value="L">Laki-laki</option>
          <option value="P">Perempuan</option>
        </select>

        <label style={{ display: "block", marginTop: 12, marginBottom: 8, fontSize: 13 }}>Tanggal Lahir</label>
        <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} style={{ width: 220, height: 38, padding: 8, borderRadius: 8, border: "1px solid #e4e4e7" }} />

        {error && <div style={{ marginTop: 12, color: "#dc2626" }}>{error}</div>}
        {success && <div style={{ marginTop: 12, color: "#16a34a" }}>{success}</div>}

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button type="submit" disabled={loading} style={{ height: 38, padding: "0 14px", borderRadius: 8, background: "#18181b", color: "#fff", border: "none" }}>
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <button type="button" onClick={() => router.back()} style={{ height: 38, padding: "0 14px", borderRadius: 8, background: "#fff", border: "1px solid #e4e4e7" }}>
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
