import { Search, CheckCircle, XCircle, Eye, MapPin } from "lucide-react";
import { PageContent, PageHeader, Card, TableHeader, StatusBadge } from "@/components/ui/PageShell";

const organizers = [
  { id: 1, name: "Bosphorus Arena", contact: "Ahmet Kaya", city: "İstanbul", email: "ahmet@bosphorus.com", tournaments: 8, teams: 64, status: "approved", joinDate: "2025-03-15" },
  { id: 2, name: "Yıldız Spor Kulübü", contact: "Mehmet Demir", city: "Ankara", email: "mehmet@yildizsport.com", tournaments: 5, teams: 40, status: "approved", joinDate: "2025-05-02" },
  { id: 3, name: "Anadolu Arena", contact: "Ali Yılmaz", city: "Ankara", email: "ali@anadolu.com", tournaments: 3, teams: 24, status: "approved", joinDate: "2025-06-20" },
  { id: 4, name: "Ege FC Organizasyon", contact: "Can Şahin", city: "İzmir", email: "can@ege.com", tournaments: 2, teams: 16, status: "approved", joinDate: "2025-08-10" },
  { id: 5, name: "Karadeniz Spor", contact: "Hasan Çelik", city: "Trabzon", email: "hasan@kd.com", tournaments: 0, teams: 0, status: "pending", joinDate: "2026-06-06" },
  { id: 6, name: "Çukurova Arena", contact: "Fatih Yıldız", city: "Adana", email: "fatih@cu.com", tournaments: 0, teams: 0, status: "pending", joinDate: "2026-06-07" },
  { id: 7, name: "Marmara Spor", contact: "Burak Güler", city: "İstanbul", email: "burak@marmara.com", tournaments: 1, teams: 8, status: "pending", joinDate: "2026-06-08" },
  { id: 8, name: "Akdeniz Kulübü", contact: "Serkan Kara", city: "Antalya", email: "serkan@ak.com", tournaments: 0, teams: 0, status: "rejected", joinDate: "2026-05-20" },
];

const tabs = ["Tümü", "Onay Bekliyor", "Onaylı", "Reddedildi"];

export default function AdminOrganizersPage() {
  return (
    <PageContent>
      <PageHeader
        title="Organizatörler"
        subtitle={`${organizers.length} organizatör kayıtlı`}
      />

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white border border-[#E5E7EB] rounded-xl p-1 w-fit">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              i === 0 ? "bg-[#0F1F47] text-white" : "text-[#6B7280] hover:text-[#374151] hover:bg-[#F4F6F9]"
            }`}
          >
            {tab}
            {i === 1 && (
              <span className="ml-1.5 bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
            )}
          </button>
        ))}
      </div>

      <Card>
        {/* Search */}
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              placeholder="Organizatör ara..."
              className="w-full pl-8 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]"
            />
          </div>
        </div>

        <table className="w-full">
          <TableHeader columns={["Organizasyon", "Şehir", "Turnuva", "Takım", "Üyelik Tarihi", "Durum", "İşlem"]} />
          <tbody className="divide-y divide-[#F3F4F6]">
            {organizers.map((org) => (
              <tr key={org.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3">
                  <div className="text-sm font-semibold text-[#111827]">{org.name}</div>
                  <div className="text-xs text-[#9CA3AF]">{org.contact} · {org.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-sm text-[#6B7280]">
                    <MapPin size={12} /> {org.city}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[#374151] font-medium">{org.tournaments}</td>
                <td className="px-4 py-3 text-sm text-[#374151] font-medium">{org.teams}</td>
                <td className="px-4 py-3 text-xs text-[#9CA3AF]">{org.joinDate}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={org.status === "approved" ? "Onaylı" : org.status === "pending" ? "Bekliyor" : "Reddedildi"}
                    variant={org.status === "approved" ? "green" : org.status === "pending" ? "orange" : "red"}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button className="p-1.5 rounded-md bg-[#F4F6F9] text-[#6B7280] hover:bg-[#E5E7EB] transition-colors">
                      <Eye size={13} />
                    </button>
                    {org.status === "pending" && (
                      <>
                        <button className="p-1.5 rounded-md bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5] transition-colors">
                          <CheckCircle size={13} />
                        </button>
                        <button className="p-1.5 rounded-md bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] transition-colors">
                          <XCircle size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageContent>
  );
}
