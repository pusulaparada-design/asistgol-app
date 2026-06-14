"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Trophy, Shield, BarChart2, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

function VerifiedBanner() {
  const params = useSearchParams();
  const v = params.get("verified");
  if (v === "1") return (
    <div className="flex items-center gap-2 p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-sm text-[#059669] mb-4">
      <CheckCircle size={15} className="shrink-0" />
      E-posta adresiniz doğrulandı. Artık giriş yapabilirsiniz.
    </div>
  );
  if (v === "invalid") return (
    <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-sm text-[#DC2626] mb-4">
      <AlertCircle size={15} className="shrink-0" />
      Doğrulama bağlantısı geçersiz veya süresi dolmuş.
    </div>
  );
  return null;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Giriş başarısız.");
        return;
      }
      window.location.href = data.redirect;
    } catch {
      setError("Sunucu bağlantısı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Sol panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F1F47] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 8 }).map((_, i) =>
            Array.from({ length: 6 }).map((_, j) => (
              <div key={`${i}-${j}`} className="absolute w-16 h-16 border border-white rounded-full"
                style={{ left: `${i * 180 - 40}px`, top: `${j * 160 - 40}px` }} />
            ))
          )}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Image src="/logo-icon.svg" alt="AsistGol" width={44} height={50} />
            <div>
              <div className="text-white font-extrabold text-2xl">asist<span className="text-[#F59E0B]">gol</span></div>
              <div className="text-[#64748B] text-xs uppercase tracking-widest">Turnuva Platformu</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Futbol Turnuvalarını<br />
              <span className="text-[#F59E0B]">Profesyonelce</span><br />
              Yönetin
            </h1>
            <p className="mt-4 text-[#94A3B8] text-base leading-relaxed">
              Grup aşaması, eleme, puan tablosu, ceza takibi ve daha fazlası tek platformda.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Trophy, label: "Turnuva Yönetimi", desc: "Esnek format" },
              { icon: Shield, label: "Takım Kaydı", desc: "Kolay başvuru" },
              { icon: BarChart2, label: "Canlı İstatistik", desc: "Anlık veriler" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <Icon size={22} className="text-[#F59E0B] mb-2" />
                <div className="text-white text-xs font-semibold">{label}</div>
                <div className="text-[#64748B] text-[10px] mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[#475569] text-xs">© 2026 AsistGol. Tüm hakları saklıdır.</div>
      </div>

      {/* Sağ panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-[#F4F6F9]">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Image src="/logo-icon.svg" alt="AsistGol" width={36} height={40} />
            <span className="text-[#0F1F47] font-extrabold text-xl">asist<span className="text-[#F59E0B]">gol</span></span>
          </div>

          <h2 className="text-2xl font-bold text-[#111827] mb-1">Hoş Geldiniz</h2>
          <p className="text-sm text-[#6B7280] mb-8">Hesabınıza giriş yapın</p>

          <Suspense>
            <VerifiedBanner />
          </Suspense>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">E-posta Adresi</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] transition-all"
                autoComplete="email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[#374151]">Şifre</label>
                <Link href="/forgot-password" className="text-xs text-[#F59E0B] hover:text-[#D97706] font-medium">
                  Şifremi unuttum
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] transition-all"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-sm text-[#DC2626]">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#0F1F47] text-white font-semibold py-2.5 rounded-lg hover:bg-[#1A2F5A] transition-colors text-sm disabled:opacity-60"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Giriş yapılıyor...</> : "Giriş Yap"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B7280]">
            Hesabınız yok mu?{" "}
            <Link href="/register" className="text-[#F59E0B] font-semibold hover:text-[#D97706]">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
