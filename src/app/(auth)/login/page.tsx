"use client";
import { useState } from "react";
import Image from "next/image";
import { Trophy, Shield, BarChart2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
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
        body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Giriş başarısız.");
        return;
      }
      router.push(data.redirect);
      router.refresh();
    } catch {
      setError("Sunucu bağlantısı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }

  function quickLogin(username: string, redirect: string) {
    setUsername(username);
    setPassword("123");
    // direkt fetch ile giriş yap
    setLoading(true);
    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: "123" }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) { router.push(data.redirect); router.refresh(); }
        else setError(data.error || "Giriş başarısız.");
      })
      .catch(() => setError("Sunucu bağlantısı kurulamadı."))
      .finally(() => setLoading(false));
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

          {/* Demo bilgileri */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <div className="text-[#94A3B8] text-xs font-semibold uppercase tracking-wider mb-3">Demo Hesapları</div>
            {[
              { user: "admin",       label: "Platform Admin" },
              { user: "organizator", label: "Turnuva Organizatörü" },
              { user: "takim",       label: "Takım Kaptanı" },
            ].map((r) => (
              <div key={r.user} className="flex items-center justify-between">
                <span className="text-white text-sm font-mono">{r.user}</span>
                <span className="text-[#64748B] text-xs">/ 123 → {r.label}</span>
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

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Kullanıcı Adı</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin, organizator veya takim"
                className="w-full px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] transition-all"
                autoComplete="username"
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

          {/* Demo butonları */}
          <div className="mt-6 p-4 bg-white border border-[#E5E7EB] rounded-xl">
            <div className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
              Demo Hesapları (şifre: 123)
            </div>
            <div className="space-y-2">
              {[
                { user: "admin",       label: "Platform Admin",       color: "bg-[#EF4444]", redirect: "/admin" },
                { user: "organizator", label: "Turnuva Organizatörü", color: "bg-[#3B82F6]", redirect: "/organizer" },
                { user: "takim",       label: "Takım Kaptanı",        color: "bg-[#10B981]", redirect: "/captain" },
              ].map((r) => (
                <button
                  key={r.user}
                  onClick={() => quickLogin(r.user, r.redirect)}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F9] transition-colors text-left disabled:opacity-60"
                >
                  <div className={`w-7 h-7 ${r.color} rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {r.user[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-[#111827]">{r.user}</div>
                    <div className="text-[10px] text-[#9CA3AF]">{r.label}</div>
                  </div>
                  <span className="text-[10px] text-[#D1D5DB] font-mono">şifre: 123</span>
                </button>
              ))}
            </div>
          </div>

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
