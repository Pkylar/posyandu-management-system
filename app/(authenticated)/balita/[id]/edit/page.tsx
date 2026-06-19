"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props { params: { id: string } }

export default function Page({ params }: Props) {
  return <EditClient id={params.id} />;
}

function EditClient({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const tt = typeof window !== 'undefined' ? localStorage.getItem('token_type') || 'Bearer' : 'Bearer';
    if (!t) { router.push('/login'); return; }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/proxy/balita/view/${id}`, { method: 'GET', headers: { Authorization: `${tt} ${t}`, Accept: 'application/json' }, credentials: 'omit' });
        const text = await res.text().catch(() => '');
        let body: any = {};
        try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
        if (!res.ok) throw new Error(body?.message || body?.raw || `HTTP ${res.status}`);
        // Normalize API shape: some endpoints return { data: { ... } }
        setData(body?.data ?? body);
      } catch (err: any) {
        setError(err?.message || 'Gagal memuat data');
      } finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSave() {
    const t = localStorage.getItem('access_token');
    const tt = localStorage.getItem('token_type') || 'Bearer';
    if (!t) { router.push('/login'); return; }
    try {
      setSaving(true);
      const form = new URLSearchParams();
      const fields = ['nama_lengkap','jenis_kelamin','tanggal_lahir','tempat_lahir','nama_ayah','nama_ibu','rt','rw'];
      for (const f of fields) if (data && data[f] != null) form.append(f, String(data[f]));
      const res = await fetch(`/api/proxy/balita/update/${id}`, { method: 'POST', headers: { Authorization: `${tt} ${t}`, Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }, body: form.toString(), credentials: 'omit' });
      const text = await res.text().catch(() => '');
      let body: any = {};
      try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
      if (!res.ok) throw new Error(body?.message || body?.raw || `HTTP ${res.status}`);
      router.push('/dashboard/balita');
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan');
    } finally { setSaving(false); }
  }

  return (
    <div style={{ padding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <button onClick={() => router.push(`/dashboard/balita/${id}`)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e4e4e7', background: '#fff' }}>Kembali</button>
        <h2 style={{ margin: 0 }}>Edit Balita</h2>
      </div>
      {loading && <div>Memuat...</div>}
      {error && <div style={{ color: '#b91c1c', marginBottom: 8 }}>{error}</div>}
      {data && (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Nama Lengkap</label>
              <input value={data.nama_lengkap || ''} onChange={(e) => setData({ ...data, nama_lengkap: e.target.value })} style={{ width: '100%', height: 36, padding: 8, borderRadius: 6, border: '1px solid #e4e4e7' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Jenis Kelamin</label>
              <select value={data.jenis_kelamin || ''} onChange={(e) => setData({ ...data, jenis_kelamin: e.target.value })} style={{ width: '100%', height: 36, padding: 8, borderRadius: 6, border: '1px solid #e4e4e7' }}>
                <option value="">Pilih</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Tanggal Lahir</label>
              <input type="date" value={data.tanggal_lahir ? String(data.tanggal_lahir).slice(0,10) : ''} onChange={(e) => setData({ ...data, tanggal_lahir: e.target.value })} style={{ width: '100%', height: 36, padding: 8, borderRadius: 6, border: '1px solid #e4e4e7' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Tempat Lahir</label>
              <input value={data.tempat_lahir || ''} onChange={(e) => setData({ ...data, tempat_lahir: e.target.value })} style={{ width: '100%', height: 36, padding: 8, borderRadius: 6, border: '1px solid #e4e4e7' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Nama Ayah</label>
              <input value={data.nama_ayah || ''} onChange={(e) => setData({ ...data, nama_ayah: e.target.value })} style={{ width: '100%', height: 36, padding: 8, borderRadius: 6, border: '1px solid #e4e4e7' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Nama Ibu</label>
              <input value={data.nama_ibu || ''} onChange={(e) => setData({ ...data, nama_ibu: e.target.value })} style={{ width: '100%', height: 36, padding: 8, borderRadius: 6, border: '1px solid #e4e4e7' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>RT</label>
              <input value={data.rt || ''} onChange={(e) => setData({ ...data, rt: e.target.value })} style={{ width: '100%', height: 36, padding: 8, borderRadius: 6, border: '1px solid #e4e4e7' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>RW</label>
              <input value={data.rw || ''} onChange={(e) => setData({ ...data, rw: e.target.value })} style={{ width: '100%', height: 36, padding: 8, borderRadius: 6, border: '1px solid #e4e4e7' }} />
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving} style={{ height: 38, padding: '0 14px', borderRadius: 8, background: '#0f172a', color: '#fff', border: 'none' }}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
            <button type="button" onClick={() => router.push(`/dashboard/balita/${id}`)} style={{ height: 38, padding: '0 14px', borderRadius: 8, background: '#fff', border: '1px solid #e4e4e7' }}>Batal</button>
          </div>
        </form>
      )}
    </div>
  );
}
