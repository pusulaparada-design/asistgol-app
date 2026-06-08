"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Users, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

type Role = "organizer" | "captain" | null;

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-[#ECFDF5] rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-[#10B981]" />
          </div>
          <h2 className="text-xl font-bold text-[#111827] mb-2">Kaydınız Alındı!</h2>
          <p className="text-sm text-[#6B7280] mb-2">
            E-posta adresinize doğrulama bağlantısı gönderdik.
          </p>
          <p className="text-xs text-[#9CA3AF] mb-6">
            Bağlantı 24 saat geçerlidir. Hesabınız doğrulandıktan sonra{" "}
            {role === "organizer" ? "platform ekibimiz tarafından onaylanacaktır" : "sisteme giriş yapabilirsiniz"}.
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#0F1F47] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#1A2F5A] transition-colors text-sm"
          >
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/logo-icon.svg" alt="AsistGol" width={36} height={40} />
            <span className="text-[#0F1F47] font-extrabold text-xl">asist<span className="text-[#F59E0B]">gol</span></span>
          </div>
          <h2 className="text-2xl font-bold text-[#111827]">Hesap Oluştur</h2>
          <p className="text-sm text-[#6B7280] mt-1">Adım {step} / 2</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? "bg-[#F59E0B]" : "bg-[#E5E7EB]"}`}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-sm">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-[#111827] mb-5">Nasıl kullanacaksınız?</h3>
              {[
                {
                  value: "organizer" as Role,
                  icon: Trophy,
                  title: "Turnuva Organizatörü",
                  desc: "Turnuva oluştur, takımları yönet, fikstür hazırla ve sonuçları gir.",
                  color: "bg-[#FEF3C7] text-[#D97706]",
                },
                {
                  value: "captain" as Role,
                  icon: Users,
                  title: "Takım Kaptanı",
                  desc: "Takımını oluştur, turnuvalara kayıt yap, maç takviminizi görüntüle.",
                  color: "bg-[#EFF6FF] text-[#2563EB]",
                },
              ].map(({ value, icon: Icon, title, desc, color }) => (
                <button
                  key={value}
                  onClick={() => setRole(value)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                    role === value
                      ? "border-[#F59E0B] bg-[#FFFBEB]"
                      : "border-[#E5E7EB] hover:border-[#D1D5DB]"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#111827]">{title}</div>
                    <div className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{desc}</div>
                  </div>
                </button>
              ))}

              <button
                onClick={() => role && setStep(2)}
                disabled={!role}
                className="w-full flex items-center justify-center gap-2 bg-[#0F1F47] text-white font-semibold py-2.5 rounded-lg hover:bg-[#1A2F5A] transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                Devam Et <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#374151] mb-2">
                <ArrowLeft size={14} /> Geri
              </button>
              <h3 className="text-base font-semibold text-[#111827] mb-4">
                {role === "organizer" ? "Organizasyon Bilgileri" : "Kişisel Bilgiler"}
              </h3>

              {role === "organizer" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#374151] mb-1">Ad</label>
                      <input className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" placeholder="Adınız" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#374151] mb-1">Soyad</label>
                      <input className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" placeholder="Soyadınız" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1">Organizasyon / Kulüp Adı</label>
                    <input className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" placeholder="örn. Yıldız Spor Kulübü" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1">Şehir</label>
                    <select className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]">
                      <option value="">Şehir seçin</option>
                      {["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1">Telefon</label>
                    <input className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" placeholder="05XX XXX XX XX" />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#374151] mb-1">Ad</label>
                      <input className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" placeholder="Adınız" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#374151] mb-1">Soyad</label>
                      <input className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" placeholder="Soyadınız" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1">Telefon</label>
                    <input className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" placeholder="05XX XXX XX XX" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1">Şehir</label>
                    <select className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]">
                      <option value="">Şehir seçin</option>
                      {["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">E-posta</label>
                <input type="email" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" placeholder="ornek@email.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Şifre</label>
                <input type="password" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" placeholder="En az 8 karakter" />
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input type="checkbox" id="terms" className="w-4 h-4 mt-0.5 rounded border-[#E5E7EB] accent-[#F59E0B]" />
                <label htmlFor="terms" className="text-xs text-[#6B7280]">
                  <span className="text-[#F59E0B] font-medium cursor-pointer">Kullanım Koşulları</span>nı ve{" "}
                  <span className="text-[#F59E0B] font-medium cursor-pointer">Gizlilik Politikası</span>nı okudum, kabul ediyorum.
                </label>
              </div>

              <button
                onClick={() => setDone(true)}
                className="w-full flex items-center justify-center gap-2 bg-[#0F1F47] text-white font-semibold py-2.5 rounded-lg hover:bg-[#1A2F5A] transition-colors text-sm mt-2"
              >
                Hesap Oluştur <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-[#6B7280]">
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="text-[#F59E0B] font-semibold hover:text-[#D97706]">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
