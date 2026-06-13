"use client";
import { usePathname } from "next/navigation";
import { Bell, Search, ChevronDown } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/admin": "Ana Sayfa",
  "/admin/organizers": "Organizatörler",
  "/admin/tournaments": "Tüm Turnuvalar",
  "/admin/teams": "Tüm Takımlar",
  "/admin/matches": "Tüm Maçlar",
  "/admin/stats": "İstatistikler",
  "/admin/notifications": "Bildirimler",
  "/admin/settings": "Ayarlar",
  "/organizer": "Ana Sayfa",
  "/organizer/tournaments": "Turnuvalarım",
  "/organizer/tournaments/create": "Turnuva Oluştur",
  "/organizer/announcements": "Duyurular",
  "/organizer/notifications": "Bildirimler",
  "/organizer/settings": "Ayarlar",
  "/captain": "Ana Sayfa",
  "/captain/tournaments": "Turnuva Keşfet",
  "/captain/registrations": "Kayıtlarım",
  "/captain/my-teams": "Takımlarım",
  "/captain/my-teams/create": "Takım Oluştur",
  "/captain/schedule": "Maç Takvimim",
  "/captain/leaderboard": "Sıralamalar",
  "/captain/notifications": "Bildirimler",
  "/captain/profile": "Profilim",
};

const userMap: Record<string, { name: string; role: string; initials: string; color: string }> = {
  admin: { name: "Platform Admin", role: "Sistem Yöneticisi", initials: "PA", color: "bg-[#EF4444]" },
  organizer: { name: "Ahmet Yılmaz", role: "Turnuva Organizatörü", initials: "AY", color: "bg-[#3B82F6]" },
  captain: { name: "Mehmet Kaya", role: "Takım Kaptanı", initials: "MK", color: "bg-[#10B981]" },
};

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "AsistGol";
  const role = pathname.startsWith("/admin") ? "admin" : pathname.startsWith("/organizer") ? "organizer" : "captain";
  const user = userMap[role];

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Title */}
      <h2 className="text-base font-semibold text-[#111827]">{title}</h2>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Ara..."
            className="pl-8 pr-4 py-1.5 text-sm bg-[#F4F6F9] border border-[#E5E7EB] rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] transition-all"
          />
        </div>

        {/* Notification bell */}
        <button className="relative w-9 h-9 rounded-lg bg-[#F4F6F9] border border-[#E5E7EB] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
          <Bell size={17} className="text-[#6B7280]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full border border-white" />
        </button>

        {/* User avatar */}
        <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-[#F4F6F9] transition-colors">
          <div className={`w-8 h-8 rounded-lg ${user.color} flex items-center justify-center text-white text-xs font-bold`}>
            {user.initials}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-[#111827] leading-tight">{user.name}</div>
            <div className="text-[10px] text-[#9CA3AF] leading-tight">{user.role}</div>
          </div>
          <ChevronDown size={14} className="text-[#9CA3AF]" />
        </button>
      </div>
    </header>
  );
}
