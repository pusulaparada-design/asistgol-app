import { PageContent, PageHeader, Card, CardHeader, ActionButton } from "@/components/ui/PageShell";

export default function OrganizerSettingsPage() {
  return (
    <PageContent>
      <PageHeader title="Ayarlar" subtitle="Hesap ve organizasyon bilgileri" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Kişisel Bilgiler" />
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Ad</label>
                <input defaultValue="Ahmet" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Soyad</label>
                <input defaultValue="Yılmaz" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Organizasyon Adı</label>
              <input defaultValue="Bosphorus Arena" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">E-posta</label>
              <input defaultValue="ahmet@bosphorus.com" type="email" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Telefon</label>
              <input defaultValue="0532 111 22 33" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Şehir</label>
              <select className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]">
                <option selected>İstanbul</option>
                <option>Ankara</option>
                <option>İzmir</option>
              </select>
            </div>
            <ActionButton variant="primary">Kaydet</ActionButton>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Bildirim Tercihleri" />
            <div className="p-5 space-y-3">
              {[
                { label: "Yeni takım başvurusu", checked: true },
                { label: "Kart cezası bildirimi", checked: true },
                { label: "Maç hatırlatması (1 saat önce)", checked: true },
                { label: "Haftalık özet e-postası", checked: false },
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
