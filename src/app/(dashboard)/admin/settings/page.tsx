import { PageContent, PageHeader, Card, CardHeader, ActionButton } from "@/components/ui/PageShell";

export default function AdminSettingsPage() {
  return (
    <PageContent>
      <PageHeader title="Platform Ayarları" subtitle="Sistem yapılandırması ve genel ayarlar" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* General */}
        <Card>
          <CardHeader title="Genel Ayarlar" />
          <div className="p-5 space-y-4">
            {[
              { label: "Platform Adı", value: "AsistGol" },
              { label: "İletişim E-postası", value: "admin@asistgol.com" },
              { label: "Varsayılan Şehir", value: "İstanbul" },
              { label: "Para Birimi", value: "TRY (₺)" },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">{f.label}</label>
                <input
                  defaultValue={f.value}
                  className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]"
                />
              </div>
            ))}
            <ActionButton variant="primary">Kaydet</ActionButton>
          </div>
        </Card>

        {/* Registration */}
        <Card>
          <CardHeader title="Kayıt Ayarları" />
          <div className="p-5 space-y-4">
            {[
              { label: "Yeni Organizatör Onayı Gereksin", defaultChecked: true },
              { label: "Otomatik Kaptan Onayı", defaultChecked: false },
              { label: "E-posta Doğrulaması Zorunlu", defaultChecked: true },
              { label: "Telefon Doğrulaması Zorunlu", defaultChecked: false },
            ].map((t) => (
              <div key={t.label} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                <span className="text-sm text-[#374151]">{t.label}</span>
                <button
                  className={`relative w-10 h-5 rounded-full transition-colors ${t.defaultChecked ? "bg-[#0F1F47]" : "bg-[#E5E7EB]"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${t.defaultChecked ? "left-5.5 translate-x-0" : "left-0.5"}`} style={{ left: t.defaultChecked ? "22px" : "2px" }} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Notification */}
        <Card>
          <CardHeader title="Bildirim Ayarları" />
          <div className="p-5 space-y-4">
            {[
              { label: "Yeni Organizatör Başvurusu", defaultChecked: true },
              { label: "Turnuva Tamamlandı", defaultChecked: true },
              { label: "Maç Sonucu Girildi", defaultChecked: false },
              { label: "Haftalık Rapor E-postası", defaultChecked: true },
            ].map((t) => (
              <div key={t.label} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                <span className="text-sm text-[#374151]">{t.label}</span>
                <button
                  className={`relative w-10 h-5 rounded-full transition-colors ${t.defaultChecked ? "bg-[#0F1F47]" : "bg-[#E5E7EB]"}`}
                >
                  <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" style={{ left: t.defaultChecked ? "22px" : "2px" }} />
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
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Şifre Tekrar</label>
              <input type="password" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" placeholder="••••••••" />
            </div>
            <ActionButton variant="primary">Şifreyi Güncelle</ActionButton>
          </div>
        </Card>
      </div>
    </PageContent>
  );
}
