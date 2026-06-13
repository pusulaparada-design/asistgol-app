export const dynamic = "force-dynamic";
import { Users, Trophy } from "lucide-react";
import { PageContent, PageHeader, Card, CardHeader, ActionButton } from "@/components/ui/PageShell";
import { getCaptainProfile, updateUserProfile } from "@/lib/actions/announcement";

export default async function CaptainProfilePage() {
  const { user, teams, totalTournaments } = await getCaptainProfile().catch(() => ({
    user: null,
    teams: [],
    totalTournaments: 0,
  }));

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return (
    <PageContent>
      <PageHeader title="Profilim" />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <Card>
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-[#EFF6FF] rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-extrabold text-[#3B82F6]">
                {initials}
              </div>
              <h2 className="text-lg font-bold text-[#111827]">{user?.name ?? "—"}</h2>
              <p className="text-sm text-[#9CA3AF]">Takım Kaptanı{user?.city ? ` · ${user.city}` : ""}</p>

              <div className="grid grid-cols-2 gap-2 mt-5">
                <div className="p-2 bg-[#F4F6F9] rounded-xl">
                  <div className="text-lg font-bold text-[#111827]">{teams.length}</div>
                  <div className="text-[10px] text-[#9CA3AF]">Takım</div>
                </div>
                <div className="p-2 bg-[#F4F6F9] rounded-xl">
                  <div className="text-lg font-bold text-[#111827]">{totalTournaments}</div>
                  <div className="text-[10px] text-[#9CA3AF]">Turnuva</div>
                </div>
              </div>
            </div>

            {teams.length > 0 && (
              <div className="border-t border-[#E5E7EB] px-5 py-4">
                <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Takımlarım</h3>
                <div className="space-y-2">
                  {teams.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 p-2 bg-[#F9FAFB] rounded-lg">
                      <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
                        <Users size={14} className="text-[#3B82F6]" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#374151]">{t.name}</div>
                        <div className="text-[10px] text-[#9CA3AF]">{t._count.registrations} turnuva</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Kişisel Bilgiler" />
            <form
              action={async (formData: FormData) => {
                "use server";
                await updateUserProfile({
                  name: formData.get("name") as string,
                  email: formData.get("email") as string,
                  phone: formData.get("phone") as string,
                  city: formData.get("city") as string,
                });
              }}
            >
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">Ad Soyad</label>
                  <input name="name" defaultValue={user?.name ?? ""} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">E-posta</label>
                  <input name="email" defaultValue={user?.email ?? ""} type="email" className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">Telefon</label>
                  <input name="phone" defaultValue={user?.phone ?? ""} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1.5">Şehir</label>
                  <input name="city" defaultValue={user?.city ?? ""} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
                </div>
                <button type="submit" className="px-5 py-2 bg-[#0F1F47] text-white text-sm font-semibold rounded-lg hover:bg-[#1A2F5A] transition-colors">
                  Bilgileri Kaydet
                </button>
              </div>
            </form>
          </Card>

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
