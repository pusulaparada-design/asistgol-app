"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Users, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

type Role = "organizer" | "captain" | null;

const CITIES = [
  "Adana","Adıyaman","Afyonkarahisar","Ağrı","Amasya","Ankara","Antalya","Artvin",
  "Aydın","Balıkesir","Bilecik","Bingöl","Bitlis","Bolu","Burdur","Bursa","Çanakkale",
  "Çankırı","Çorum","Denizli","Diyarbakır","Edirne","Elazığ","Erzincan","Erzurum",
  "Eskişehir","Gaziantep","Giresun","Gümüşhane","Hakkari","Hatay","Isparta","Mersin",
  "İstanbul","İzmir","Kars","Kastamonu","Kayseri","Kırklareli","Kırşehir","Kocaeli",
  "Konya","Kütahya","Malatya","Manisa","Kahramanmaraş","Mardin","Muğla","Muş",
  "Nevşehir","Niğde","Ordu","Rize","Sakarya","Samsun","Siirt","Sinop","Sivas",
  "Tekirdağ","Tokat","Trabzon","Tunceli","Şanlıurfa","Uşak","Van","Yozgat","Zonguldak",
  "Aksaray","Bayburt","Karaman","Kırıkkale","Batman","Şırnak","Bartın","Ardahan",
  "Iğdır","Yalova","Karabük","Kilis","Osmaniye","Düzce",
];

const inputCls = "w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLSelectElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    setError("");
    if (!termsRef.current?.checked) {
      setError("Kullanım koşullarını kabul etmelisiniz.");
      return;
    }
    const firstName = firstNameRef.current?.value.trim() ?? "";
    const lastName = lastNameRef.current?.value.trim() ?? "";
    const email = emailRef.current?.value.trim() ?? "";
    const password = passwordRef.current?.value ?? "";
    const phone = phoneRef.current?.value.trim() ?? "";
    const city = cityRef.current?.value ?? "";

    if (!firstName || !lastName || !email || !password) {
      setError("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, phone, city, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kayıt sırasında bir hata oluştu.");
        return;
      }
      setDone(true);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-[#ECFDF5] rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-[#10B981]" />
          </div>
          <h2 className="text-xl font-bold text-[#111827] mb-2">Hesabınız Oluşturuldu!</h2>
          <p className="text-sm text-[#6B7280] mb-2">
            Hoş geldiniz! Kayıt bilgileriniz e-posta adresinize gönderildi.
          </p>
          <p className="text-xs text-[#9CA3AF] mb-6">
            {role === "organizer"
              ? "Organizatör hesabınızla giriş yaparak turnuva oluşturabilirsiniz."
              : "Hesabınızla giriş yaparak takım kurabilir ve turnuvalara katılabilirsiniz."}
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#0F1F47] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#1A2F5A] transition-colors text-sm"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/logo-icon.svg" alt="AsistGol" width={36} height={40} />
            <span className="text-[#0F1F47] font-extrabold text-xl">asist<span className="text-[#F59E0B]">gol</span></span>
          </div>
          <h2 className="text-2xl font-bold text-[#111827]">Hesap Oluştur</h2>
          <p className="text-sm text-[#6B7280] mt-1">Adım {step} / 2</p>
        </div>

        <div className="flex gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? "bg-[#F59E0B]" : "bg-[#E5E7EB]"}`} />
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
                    role === value ? "border-[#F59E0B] bg-[#FFFBEB]" : "border-[#E5E7EB] hover:border-[#D1D5DB]"
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
              <button onClick={() => { setStep(1); setError(""); }} className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#374151] mb-2">
                <ArrowLeft size={14} /> Geri
              </button>
              <h3 className="text-base font-semibold text-[#111827] mb-4">
                {role === "organizer" ? "Organizasyon Bilgileri" : "Kişisel Bilgiler"}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Ad</label>
                  <input ref={firstNameRef} className={inputCls} placeholder="Adınız" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Soyad</label>
                  <input ref={lastNameRef} className={inputCls} placeholder="Soyadınız" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Telefon</label>
                <input ref={phoneRef} className={inputCls} placeholder="05XX XXX XX XX" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Şehir</label>
                <select ref={cityRef} className={inputCls + " bg-white"}>
                  <option value="">Şehir seçin</option>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">E-posta</label>
                <input ref={emailRef} type="email" className={inputCls} placeholder="ornek@email.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Şifre</label>
                <input ref={passwordRef} type="password" className={inputCls} placeholder="En az 6 karakter" />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex items-start gap-2 pt-1">
                <input ref={termsRef} type="checkbox" id="terms" className="w-4 h-4 mt-0.5 rounded border-[#E5E7EB] accent-[#F59E0B]" />
                <label htmlFor="terms" className="text-xs text-[#6B7280]">
                  <span className="text-[#F59E0B] font-medium cursor-pointer">Kullanım Koşulları</span>nı ve{" "}
                  <span className="text-[#F59E0B] font-medium cursor-pointer">Gizlilik Politikası</span>nı okudum, kabul ediyorum.
                </label>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#0F1F47] text-white font-semibold py-2.5 rounded-lg hover:bg-[#1A2F5A] transition-colors text-sm mt-2 disabled:opacity-60"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Kaydediliyor...</> : <>Hesap Oluştur <ArrowRight size={16} /></>}
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
