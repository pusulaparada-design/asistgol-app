"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LucideIcon, LayoutDashboard, Trophy, Users, Calendar, BarChart2, Bell, Settings, ShieldCheck, Swords, UserCircle, Search, ClipboardList, Megaphone, Star } from "lucide-react";
import { Logo } from "./Logo";

type NavItem = { label: string; href: string; icon: LucideIcon; badge?: number };
type NavGroup = { group?: string; items: NavItem[] };

const adminNav: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    group: "YÖNETİM",
    items: [
      { label: "Organizatörler", href: "/admin/organizers", icon: ShieldCheck },
      { label: "Turnuvalar", href: "/admin/tournaments", icon: Trophy },
      { label: "Takımlar", href: "/admin/teams", icon: Users },
      { label: "Maçlar", href: "/admin/matches", icon: Swords },
    ],
  },
  {
    group: "RAPORLAR",
    items: [
      { label: "İstatistikler", href: "/admin/stats", icon: BarChart2 },
    ],
  },
  {
    group: "SİSTEM",
    items: [
      { label: "Bildirimler", href: "/admin/notifications", icon: Bell, badge: 3 },
      { label: "Ayarlar", href: "/admin/settings", icon: Settings },
    ],
  },
];

const organizerNav: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/organizer", icon: LayoutDashboard },
    ],
  },
  {
    group: "TURNUVALAR",
    items: [
      { label: "Turnuvalarım", href: "/organizer/tournaments", icon: Trophy },
      { label: "Turnuva Oluştur", href: "/organizer/tournaments/create", icon: Star },
    ],
  },
  {
    group: "İLETİŞİM",
    items: [
      { label: "Duyurular", href: "/organizer/announcements", icon: Megaphone },
      { label: "Bildirimler", href: "/organizer/notifications", icon: Bell, badge: 5 },
    ],
  },
  {
    group: "HESAP",
    items: [
      { label: "Ayarlar", href: "/organizer/settings", icon: Settings },
    ],
  },
];

const captainNav: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/captain", icon: LayoutDashboard },
    ],
  },
  {
    group: "TURNUVALAR",
    items: [
      { label: "Turnuva Keşfet", href: "/captain/tournaments", icon: Search },
      { label: "Kayıtlarım", href: "/captain/registrations", icon: ClipboardList },
    ],
  },
  {
    group: "TAKIMIM",
    items: [
      { label: "Takımlarım", href: "/captain/my-teams", icon: Users },
      { label: "Maç Takvimim", href: "/captain/schedule", icon: Calendar },
    ],
  },
  {
    group: "İSTATİSTİK",
    items: [
      { label: "Sıralamalar", href: "/captain/leaderboard", icon: BarChart2 },
    ],
  },
  {
    group: "HESAP",
    items: [
      { label: "Bildirimler", href: "/captain/notifications", icon: Bell, badge: 2 },
      { label: "Profil", href: "/captain/profile", icon: UserCircle },
    ],
  },
];

function getNav(pathname: string): NavGroup[] {
  if (pathname.startsWith("/admin")) return adminNav;
  if (pathname.startsWith("/organizer")) return organizerNav;
  return captainNav;
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin" || href === "/organizer" || href === "/captain") return pathname === href;
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  const nav = getNav(pathname);

  return (
    <aside className="w-60 shrink-0 bg-[#0F1F47] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/10">
        <Logo />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll py-4 px-3 space-y-5">
        {nav.map((group, gi) => (
          <div key={gi}>
            {group.group && (
              <div className="px-3 mb-1.5 text-[9px] font-bold text-[#64748B] uppercase tracking-widest">
                {group.group}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                        active
                          ? "bg-[#F59E0B] text-white shadow-sm"
                          : "text-[#94A3B8] hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      <item.icon size={17} className={active ? "text-white" : "text-[#64748B] group-hover:text-white"} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-[#EF4444] text-white"}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Role switcher (demo) */}
      <div className="p-3 border-t border-white/10">
        <div className="text-[9px] text-[#64748B] uppercase tracking-widest mb-2 px-2">Demo — Rol Değiştir</div>
        <div className="flex gap-1">
          {[
            { label: "Admin", href: "/admin" },
            { label: "Org.", href: "/organizer" },
            { label: "Kaptan", href: "/captain" },
          ].map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className={`flex-1 text-center text-[10px] font-semibold py-1.5 rounded-md transition-all ${
                pathname.startsWith(r.href)
                  ? "bg-[#F59E0B] text-white"
                  : "text-[#94A3B8] hover:bg-white/10 hover:text-white"
              }`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
