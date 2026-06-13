"use client";
import { useState, useRef, useTransition } from "react";
import { Card, CardHeader } from "@/components/ui/PageShell";
import { updateProfile, changePassword } from "@/lib/actions/user";

const TURKIYE_ILLERI = [
  "Adana","Adıyaman","Afyonkarahisar","Ağrı","Aksaray","Amasya","Ankara","Antalya",
  "Ardahan","Artvin","Aydın","Balıkesir","Bartın","Batman","Bayburt","Bilecik",
  "Bingöl","Bitlis","Bolu","Burdur","Bursa","Çanakkale","Çankırı","Çorum","Denizli",
  "Diyarbakır","Düzce","Edirne","Elazığ","Erzincan","Erzurum","Eskişehir","Gaziantep",
  "Giresun","Gümüşhane","Hakkari","Hatay","Iğdır","Isparta","İstanbul","İzmir",
  "Kahramanmaraş","Karabük","Karaman","Kars","Kastamonu","Kayseri","Kilis","Kırıkkale",
  "Kırklareli","Kırşehir","Kocaeli","Konya","Kütahya","Malatya","Manisa","Mardin",
  "Mersin","Muğla","Muş","Nevşehir","Niğde","Ordu","Osmaniye","Rize","Sakarya",
  "Samsun","Siirt","Sinop","Sivas","Şanlıurfa","Şırnak","Tekirdağ","Tokat","Trabzon",
  "Tunceli","Uşak","Van","Yalova","Yozgat","Zonguldak",
];

const inputCls = "w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]";

type Props = {
  user: {
    name: string;
    email: string | null;
    phone: string | null;
    city: string | null;
  };
};

export default function SettingsClient({ user }: Props) {
  const nameParts = user.name.trim().split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  // Profile form
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef  = useRef<HTMLInputElement>(null);
  const emailRef     = useRef<HTMLInputElement>(null);
  const phoneRef     = useRef<HTMLInputElement>(null);
  const cityRef      = useRef<HTMLSelectElement>(null);

  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [profilePending, startProfile] = useTransition();

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    startProfile(async () => {
      const result = await updateProfile({
        firstName: firstNameRef.current?.value ?? "",
        lastName:  lastNameRef.current?.value  ?? "",
        email:     emailRef.current?.value     ?? "",
        phone:     phoneRef.current?.value     ?? "",
        city:      cityRef.current?.value      ?? "",
      });
      setProfileMsg(result.ok
        ? { ok: true,  text: "Bilgileriniz kaydedildi." }
        : { ok: false, text: result.error });
    });
  }

  // Password form
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwPending, startPw] = useTransition();

  const pwMatch    = newPw.length > 0 && confirmPw.length > 0 && newPw === confirmPw;
  const pwMismatch = newPw.length > 0 && confirmPw.length > 0 && newPw !== confirmPw;

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (!currentPw) { setPwMsg({ ok: false, text: "Mevcut şifrenizi girin." }); return; }
    if (newPw.length < 6) { setPwMsg({ ok: false, text: "Yeni şifre en az 6 karakter olmalıdır." }); return; }
    if (newPw !== confirmPw) { setPwMsg({ ok: false, text: "Yeni şifreler eşleşmiyor." }); return; }

    startPw(async () => {
      const result = await changePassword({ currentPassword: currentPw, newPassword: newPw });
      if (result.ok) {
        setPwMsg({ ok: true, text: "Şifreniz başarıyla güncellendi." });
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
      } else {
        setPwMsg({ ok: false, text: result.error });
      }
    });
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Kişisel Bilgiler */}
      <Card>
        <CardHeader title="Kişisel Bilgiler" />
        <form onSubmit={handleProfileSave} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Ad</label>
              <input ref={firstNameRef} defaultValue={firstName} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Soyad</label>
              <input ref={lastNameRef} defaultValue={lastName} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">E-posta</label>
            <input ref={emailRef} defaultValue={user.email ?? ""} type="email" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Telefon</label>
            <input ref={phoneRef} defaultValue={user.phone ?? ""} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Şehir</label>
            <select ref={cityRef} defaultValue={user.city ?? ""} className={inputCls + " bg-white"}>
              <option value="">Şehir seçin</option>
              {TURKIYE_ILLERI.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {profileMsg && (
            <p className={`text-xs rounded-lg px-3 py-2 border ${profileMsg.ok ? "text-[#10B981] bg-[#ECFDF5] border-[#A7F3D0]" : "text-[#EF4444] bg-[#FEF2F2] border-[#FECACA]"}`}>
              {profileMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={profilePending}
            className="bg-[#0F1F47] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1A2F5A] transition-colors disabled:opacity-60"
          >
            {profilePending ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </form>
      </Card>

      <div className="space-y-6">
        {/* Bildirim Tercihleri */}
        <Card>
          <CardHeader title="Bildirim Tercihleri" />
          <div className="p-5 space-y-3">
            {[
              { label: "Yeni takım başvurusu", checked: true },
              { label: "Kart cezası bildirimi", checked: true },
              { label: "Maç hatırlatması (1 saat önce)", checked: true },
              { label: "Haftalık özet e-postası", checked: true },
            ].map((p) => (
              <div key={p.label} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                <span className="text-sm text-[#374151]">{p.label}</span>
                <button type="button" className={`relative w-10 h-5 rounded-full transition-colors ${p.checked ? "bg-[#0F1F47]" : "bg-[#E5E7EB]"}`}>
                  <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" style={{ left: p.checked ? "22px" : "2px" }} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Güvenlik */}
        <Card>
          <CardHeader title="Güvenlik" />
          <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Mevcut Şifre</label>
              <input
                type="password"
                value={currentPw}
                onChange={e => { setCurrentPw(e.target.value); setPwMsg(null); }}
                className={inputCls}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Yeni Şifre</label>
              <input
                type="password"
                value={newPw}
                onChange={e => { setNewPw(e.target.value); setPwMsg(null); }}
                className={inputCls}
                placeholder="En az 6 karakter"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Yeni Şifre (Tekrar)</label>
              <input
                type="password"
                value={confirmPw}
                onChange={e => { setConfirmPw(e.target.value); setPwMsg(null); }}
                className={`${inputCls} ${pwMatch ? "border-[#10B981] focus:ring-[#10B981]/30 focus:border-[#10B981]" : pwMismatch ? "border-[#EF4444] focus:ring-[#EF4444]/30 focus:border-[#EF4444]" : ""}`}
                placeholder="••••••••"
              />
              {pwMatch    && <p className="text-xs text-[#10B981] mt-1">Şifreler eşleşiyor.</p>}
              {pwMismatch && <p className="text-xs text-[#EF4444] mt-1">Şifreler eşleşmiyor.</p>}
            </div>

            {pwMsg && (
              <p className={`text-xs rounded-lg px-3 py-2 border ${pwMsg.ok ? "text-[#10B981] bg-[#ECFDF5] border-[#A7F3D0]" : "text-[#EF4444] bg-[#FEF2F2] border-[#FECACA]"}`}>
                {pwMsg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={pwPending}
              className="bg-[#0F1F47] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1A2F5A] transition-colors disabled:opacity-60"
            >
              {pwPending ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
