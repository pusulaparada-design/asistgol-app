import { Trophy, Users, Swords, Star } from "lucide-react";
import { PageContent, PageHeader, Card, CardHeader, ActionButton } from "@/components/ui/PageShell";

const achievements = [
  { icon: Trophy, label: "Şampiyon", desc: "Bahar Kupası 2025", color: "bg-[#FEF3C7] text-[#D97706]" },
  { icon: Star, label: "Fair Play", desc: "En az kart · 2025", color: "bg-[#ECFDF5] text-[#059669]" },
  { icon: Users, label: "Kaptan", desc: "3 turnuva lideri", color: "bg-[#EFF6FF] text-[#2563EB]" },
  { icon: Swords, label: "Demir Takım", desc: "10 galibiyetsiz maç", color: "bg-[#F5F3FF] text-[#7C3AED]" },
];

export default function CaptainProfilePage() {
  return (
    <PageContent>
      <PageHeader title="Profilim" />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="xl:col-span-1">
          <Card>
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-[#EFF6FF] rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-extrabold text-[#3B82F6]">
                MK
              </div>
              <h2 className="text-lg font-bold text-[#111827]">Mehmet Kaya</h2>
              <p className="text-sm text-[#9CA3AF]">Takım Kaptanı · İstanbul</p>

              <div className="grid grid-cols-3 gap-2 mt-5">
                {[
                  { val: "2", label: "Takım" },
                  { val: "5", label: "Turnuva" },
                  { val: "28", label: "Gol" },
                ].map((s) => (
                  <div key={s.label} className="p-2 bg-[#F4F6F9] rounded-xl">
                    <div className="text-lg font-bold text-[#111827]">{s.val}</div>
                    <div className="text-[10px] text-[#9CA3AF]">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="border-t border-[#E5E7EB] px-5 py-4">
              <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Rozetler</h3>
              <div className="grid grid-cols-2 gap-2">
                {achievements.map((a) => (
                  <div key={a.label} className="flex items-center gap-2 p-2 bg-[#F9FAFB] rounded-lg">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${a.color}`}>
                      <a.icon size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#374151]">{a.label}</div>
                      <div className="text-[10px] text-[#9CA3AF]">{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="xl:col-span-2 space-y-6">
          {/* Personal info */}
          <Card>
            <CardHeader title="Kişisel Bilgiler" />
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">Ad</label>
                  <input defaultValue="Mehmet" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">Soyad</label>
                  <input defaultValue="Kaya" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">E-posta</label>
                <input defaultValue="mehmet.kaya@email.com" type="email" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Telefon</label>
                <input defaultValue="0532 444 55 66" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Şehir</label>
                <select className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]">
                  <option selected>İstanbul</option>
                  <option>Ankara</option>
                  <option>İzmir</option>
                </select>
              </div>
              <ActionButton variant="primary">Bilgileri Kaydet</ActionButton>
            </div>
          </Card>

          {/* Notification settings */}
          <Card>
            <CardHeader title="Bildirim Tercihleri" />
            <div className="p-5 space-y-3">
              {[
                { label: "Maç hatırlatması (1 saat önce)", checked: true },
                { label: "Başvuru onay/red bildirimi", checked: true },
                { label: "Ceza uyarısı (oyuncularım için)", checked: true },
                { label: "Turnuva duyuruları", checked: true },
                { label: "Puan tablosu güncelleme", checked: false },
              ].map((p) => (
                <div key={p.label} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                  <span className="text-sm text-[#374151]">{p.label}</span>
                  <button className={`relative w-10 h-5 rounded-full transition-colors ${p.checked ? "bg-[#0F1F47]" : "bg-[#E5E7EB]"}`}>
                    <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" style={{ left: p.checked ? "22px" : "2px" }} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader title="Güvenlik" />
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Mevcut Şifre</label>
                <input type="password" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Yeni Şifre</label>
                <input type="password" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" placeholder="••••••••" />
              </div>
              <ActionButton variant="primary">Şifreyi Güncelle</ActionButton>
            </div>
          </Card>
        </div>
      </div>
    </PageContent>
  );
}
