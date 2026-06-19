"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UbahPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const [formData, setFormData] = useState({
    passwordLama: "",
    passwordBaru: "",
    konfirmasiPassword: ""
  });

  const [errors, setErrors] = useState({
    passwordLama: "",
    passwordBaru: "",
    konfirmasiPassword: ""
  });

  useEffect(() => {
    document.title = "Ubah Password | Posyandu";
  }, []);

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) {
      errors.push("minimal 8 karakter");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("satu huruf besar");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("satu huruf kecil");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("satu angka");
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      errors.push("satu karakter khusus");
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({
      passwordLama: "",
      passwordBaru: "",
      konfirmasiPassword: ""
    });

    // Validation
    let hasError = false;
    const newErrors = { ...errors };

    // Check if old password is provided
    if (!formData.passwordLama) {
      newErrors.passwordLama = "Password lama harus diisi";
      hasError = true;
    }

    // Validate new password
    const passwordErrors = validatePassword(formData.passwordBaru);
    if (passwordErrors.length > 0) {
      newErrors.passwordBaru = "Password harus mengandung " + passwordErrors.join(", ");
      hasError = true;
    }

    // Check password confirmation
    if (formData.passwordBaru !== formData.konfirmasiPassword) {
      newErrors.konfirmasiPassword = "Konfirmasi password tidak sama";
      hasError = true;
    }

    // Check if new password is same as old password
    if (formData.passwordLama === formData.passwordBaru) {
      newErrors.passwordBaru = "Password baru harus berbeda dengan password lama";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Simulate successful password change
      alert("Password berhasil diubah! Silakan login kembali.");
      localStorage.clear();
      router.push("/login");
    }, 1500);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear specific error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { score: 0, text: "", color: "#e5e7eb" };
    
    const errors = validatePassword(password);
    const score = Math.max(0, 5 - errors.length);
    
    if (score <= 2) return { score, text: "Lemah", color: "#dc2626" };
    if (score <= 3) return { score, text: "Sedang", color: "#f59e0b" };
    if (score <= 4) return { score, text: "Kuat", color: "#10b981" };
    return { score, text: "Sangat Kuat", color: "#059669" };
  };

  const passwordStrength = getPasswordStrength(formData.passwordBaru);

  return (
    <div style={{ padding: 24, fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
            Ubah Password
          </h1>
          <button
            onClick={() => router.push("/profil")}
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
            ← Kembali ke Profil
          </button>
        </div>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
          Ubah password akun Anda untuk menjaga keamanan data
        </p>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 32 }}>
          {/* Security Notice */}
          <div style={{
            background: "#fffbeb",
            border: "1px solid #fed7aa",
            borderRadius: 8,
            padding: 16,
            marginBottom: 24
          }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ fontSize: 20 }}>🔐</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#92400e", marginBottom: 4 }}>
                  Tips Keamanan Password
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
                  <li>Gunakan kombinasi huruf besar, kecil, angka, dan simbol</li>
                  <li>Minimal 8 karakter panjang</li>
                  <li>Jangan gunakan informasi pribadi</li>
                  <li>Gunakan password yang unik dan mudah diingat</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Password Lama */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                Password Lama
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPasswords.old ? "text" : "password"}
                  value={formData.passwordLama}
                  onChange={(e) => handleInputChange("passwordLama", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 40px 12px 12px",
                    border: `1px solid ${errors.passwordLama ? "#dc2626" : "#e2e8f0"}`,
                    borderRadius: 8,
                    fontSize: 14,
                    outline: "none"
                  }}
                  placeholder="Masukkan password lama"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("old")}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 16
                  }}
                >
                  {showPasswords.old ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.passwordLama && (
                <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>
                  {errors.passwordLama}
                </div>
              )}
            </div>

            {/* Password Baru */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                Password Baru
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.passwordBaru}
                  onChange={(e) => handleInputChange("passwordBaru", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 40px 12px 12px",
                    border: `1px solid ${errors.passwordBaru ? "#dc2626" : "#e2e8f0"}`,
                    borderRadius: 8,
                    fontSize: 14,
                    outline: "none"
                  }}
                  placeholder="Masukkan password baru"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 16
                  }}
                >
                  {showPasswords.new ? "🙈" : "👁️"}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.passwordBaru && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>Kekuatan Password</span>
                    <span style={{ fontSize: 12, color: passwordStrength.color, fontWeight: 500 }}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div style={{ 
                    height: 4, 
                    background: "#e5e7eb", 
                    borderRadius: 2, 
                    overflow: "hidden" 
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      background: passwordStrength.color,
                      transition: "all 0.3s ease"
                    }} />
                  </div>
                </div>
              )}
              
              {errors.passwordBaru && (
                <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>
                  {errors.passwordBaru}
                </div>
              )}
            </div>

            {/* Konfirmasi Password */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                Konfirmasi Password Baru
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.konfirmasiPassword}
                  onChange={(e) => handleInputChange("konfirmasiPassword", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 40px 12px 12px",
                    border: `1px solid ${errors.konfirmasiPassword ? "#dc2626" : "#e2e8f0"}`,
                    borderRadius: 8,
                    fontSize: 14,
                    outline: "none"
                  }}
                  placeholder="Masukkan ulang password baru"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 16
                  }}
                >
                  {showPasswords.confirm ? "🙈" : "👁️"}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.konfirmasiPassword && (
                <div style={{ marginTop: 4, fontSize: 12 }}>
                  {formData.passwordBaru === formData.konfirmasiPassword ? (
                    <span style={{ color: "#10b981" }}>✓ Password cocok</span>
                  ) : (
                    <span style={{ color: "#dc2626" }}>✗ Password tidak cocok</span>
                  )}
                </div>
              )}
              
              {errors.konfirmasiPassword && (
                <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>
                  {errors.konfirmasiPassword}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.passwordLama || !formData.passwordBaru || !formData.konfirmasiPassword}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: loading ? "#9ca3af" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: (!formData.passwordLama || !formData.passwordBaru || !formData.konfirmasiPassword) ? 0.5 : 1
              }}
            >
              {loading ? "Mengubah Password..." : "Ubah Password"}
            </button>
          </form>

          {/* Additional Security Info */}
          <div style={{
            marginTop: 24,
            padding: 16,
            background: "#f8fafc",
            borderRadius: 8,
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
              <strong>Catatan:</strong> Setelah password berhasil diubah, Anda akan diminta untuk login ulang menggunakan password baru. Pastikan Anda mengingat password baru yang telah dibuat.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}