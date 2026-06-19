"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  function update(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validasi form
    if (!form.fullName.trim() || !form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Semua field harus diisi");
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak sama");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password minimal 6 karakter");
      setLoading(false);
      return;
    }

    // Mock registration process
    setTimeout(() => {
      // Simulasi simpan data user baru ke localStorage
      const existingUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");
      
      // Cek apakah username sudah ada
      if (existingUsers.find((user: any) => user.username === form.username)) {
        setError("Username sudah terdaftar");
        setLoading(false);
        return;
      }

      const newUser = {
        id: Date.now(),
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        password: form.password, // In real app, this should be hashed
        role: "Bidan",
        createdAt: new Date().toISOString()
      };

      existingUsers.push(newUser);
      localStorage.setItem("registered_users", JSON.stringify(existingUsers));
      
      // Redirect ke login dengan success message
      localStorage.setItem("register_success", "Registrasi berhasil! Silakan login dengan akun Anda.");
      router.push("/login");
    }, 1000);
  }

  return (
    <div className="root">
      {/* Panel Kiri - Hanya muncul di Desktop */}
      <div className="left">
        <div className="left-inner">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#ecfdf5" />
              <path
                d="M14 6v16M8 12l6 6 6-6"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{process.env.NEXT_PUBLIC_APP_NAME}</span>
          </div>
          <div className="quote">
            <p>{process.env.NEXT_PUBLIC_APP_JARGON}</p>
          </div>
        </div>
      </div>

      {/* Panel Kanan - Form Register */}
      <div className="right">
        <div className="form-wrap">
          <div className="form-header">
            {/* Logo Mobile - Muncul saat layar kecil */}
            <div className="mobile-logo logo">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="#10b981" />
                <path d="M14 6v16M8 12l6 6 6-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{process.env.NEXT_PUBLIC_APP_NAME}</span>
            </div>
            <h1>Daftar Akun Baru</h1>
            <p>Buat akun untuk mengakses sistem Posyandu</p>

            {/* Info Register */}
            <div style={{
              background: "#ecfdf5",
              border: "1px solid #bbf7d0", 
              borderRadius: "8px",
              padding: "12px 16px",
              marginTop: "16px",
              fontSize: "14px",
              color: "#059669"
            }}>
              💡 <strong>Demo:</strong> Data registrasi disimpan local untuk demo aplikasi
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="fullName">Nama Lengkap</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={form.fullName}
                onChange={update}
                autoComplete="name"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Masukkan username"
                value={form.username}
                onChange={update}
                autoComplete="username"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Masukkan email"
                value={form.email}
                onChange={update}
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={update}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="field">
              <label htmlFor="confirmPassword">Konfirmasi Password</label>
              <div className="input-wrap">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPass ? "text" : "password"}
                  placeholder="Konfirmasi password"
                  value={form.confirmPassword}
                  onChange={update}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  tabIndex={-1}
                >
                  {showConfirmPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="error" aria-live="assertive">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : "Daftar"}
            </button>
          </form>

          <p className="login-link">
            Sudah punya akun?{" "}
            <button onClick={() => router.push("/login")} className="link-btn">
              Masuk di sini
            </button>
          </p>

          <p className="footer-note">© 2026 All rights reserved.</p>
        </div>
      </div>

      <style jsx>{`
        .root {
          display: flex;
          min-height: 100vh;
        }

        /* --- Left panel --- */
        .left {
          width: 450px;
          flex-shrink: 0;
          background: var(--bg-green);
          display: flex;
          align-items: flex-end;
          padding: 60px 50px;
          position: relative;
          overflow: hidden;
        }

        .left::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(167, 243, 208, 0.1) 0%, transparent 40%);
        }

        .left-inner {
          position: relative;
          z-index: 1;
          width: 100%;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .left .logo {
          position: absolute;
          top: -380px;
          left: 0;
        }

        .logo span {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -1px;
        }

        .quote p {
          font-size: 17px;
          line-height: 1.6;
          color: var(--accent-green);
          font-weight: 400;
          letter-spacing: -0.1px;
          border-left: 3px solid var(--primary-green);
          padding-left: 16px;
        }

        /* --- Right panel --- */
        .right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          background: #fcfdfd;
        }

        .form-wrap {
          width: 100%;
          max-width: 380px;
          animation: fadeIn 0.5s ease-out both;
        }

        .form-header {
          margin-bottom: 36px;
        }

        .mobile-logo {
          display: none;
          justify-content: center;
          margin-bottom: 24px;
        }

        .mobile-logo span {
          color: var(--bg-green);
          font-size: 22px;
        }

        .form-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--bg-green);
          letter-spacing: -0.8px;
          margin-bottom: 8px;
        }

        .form-header p {
          font-size: 15px;
          color: var(--text-sub);
          font-weight: 400;
        }

        /* Fields */
        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        label {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          font-size: 15px;
          font-family: inherit;
          color: var(--text-main);
          background: #fff;
          border: 1px solid var(--border-color);
          border-radius: 10px;
          outline: none;
          transition: all 0.2s;
        }

        input::placeholder {
          color: #cbd5e1;
        }

        input:focus {
          border-color: var(--primary-green);
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .input-wrap {
          position: relative;
        }

        .input-wrap input {
          padding-right: 44px;
        }

        .toggle-pass {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          align-items: center;
          padding: 6px;
          border-radius: 6px;
          transition: all 0.15s;
        }

        .toggle-pass:hover {
          color: var(--primary-green);
          background-color: #f0fdf4;
        }

        /* Error */
        .error {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #b91c1c;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 20px;
          animation: shake 0.4s linear;
        }

        /* Submit Button */
        .submit {
          width: 100%;
          height: 46px;
          background: var(--primary-green);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: -0.1px;
          margin-top: 10px;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.15);
        }

        .submit:hover:not(:disabled) {
          background: var(--hover-green);
        }

        .submit:active:not(:disabled) {
          transform: translateY(1px);
        }

        .submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .login-link {
          margin-top: 30px;
          font-size: 14px;
          color: var(--text-sub);
          text-align: center;
        }

        .link-btn {
          background: none;
          border: none;
          color: var(--primary-green);
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          font-size: inherit;
          padding: 0;
        }

        .link-btn:hover {
          text-decoration: underline;
        }

        .footer-note {
          margin-top: 40px;
          font-size: 13px;
          color: #94a3b8;
          text-align: center;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsif Layout */
        @media (max-width: 850px) {
          .left {
            width: 300px;
            padding: 40px;
          }
          .left .logo { top: -300px; }
          .logo span { font-size: 20px; }
          .quote p { font-size: 15px; }
        }

        @media (max-width: 700px) {
          .left {
            display: none;
          }
          .mobile-logo {
            display: flex;
          }
          .form-header h1 {
            font-size: 24px;
            text-align: center;
          }
          .form-header p {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}