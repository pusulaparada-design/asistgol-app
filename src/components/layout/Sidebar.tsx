"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LucideIcon, LayoutDashboard, Trophy, Users, Calendar, BarChart2, Bell, Settings, ShieldCheck, Swords, UserCircle, Megaphone, Star, LogOut, X } from "lucide-react";
import { Logo } from "./Logo";
import { NotificationBadge } from "./NotificationBadge";
import type { Role } from "@prisma/client";

type NavItem = { label: string; href: string; icon: LucideIcon; isNotif?: boolean };
type NavGroup = { group?: string; items: NavItem[] };

const adminNav: NavGroup[] = [
  {
    items: [
      { label: "Ana Sayfa", href: "/admin", icon: LayoutDashboard },
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
      { label: "Bildirimler", href: "/admin/notifications", icon: Bell, isNotif: true },
      { label: "Ayarlar", href: "/admin/settings", icon: Settings },
    ],
  },
];

const organizerNav: NavGroup[] = [
  {
    items: [
      { label: "Ana Sayfa", href: "/organizer", icon: LayoutDashboard },
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
      { label: "Bildirimler", href: "/organizer/notifications", icon: Bell, isNotif: true },
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
      { label: "Ana Sayfa", href: "/captain", icon: LayoutDashboard },
    ],
  },
  {
    group: "TURNUVALAR",
    items: [
      { label: "Turnuvalar", href: "/captain/tournaments", icon: Trophy },
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
      { label: "Bildirimler", href: "/captain/notifications", icon: Bell, isNotif: true },
      { label: "Profil", href: "/captain/profile", icon: UserCircle },
    ],
  },
];

function getNav(pathname: string): NavGroup[] {
  if (pathname.startsWith("/admin")) return adminNav;
  if (pathname.startsWith("/organizer")) return organizerNav;
  return captainNav;
}

function isActive(pathname: string, href: string, allHrefs: string[]): boolean {
  if (href === "/admin" || href === "/organizer" || href === "/captain") return pathname === href;
  if (!pathname.startsWith(href)) return false;
  if (pathname === href) return true;
  // Daha spesifik bir nav item de eşleşiyorsa bu item'ı aktif sayma
  return !allHrefs.some(h => h !== href && h.startsWith(href) && pathname.startsWith(h));
}

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Yönetici",
  ORGANIZER: "Organizatör",
  CAPTAIN: "Kaptan",
};

export function Sidebar({ user, onClose }: { user: { name: string; role: Role } | null; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = getNav(pathname);
  const allHrefs = nav.flatMap(g => g.items.map(i => i.href));

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <aside className="w-60 shrink-0 bg-[#0F1F47] flex flex-col h-screen">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/10">
        <Logo />
        {onClose && (
          <button onClick={onClose} className="ml-auto text-white/50 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        )}
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
                const active = isActive(pathname, item.href, allHrefs);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                        active
                          ? "bg-[#F59E0B] text-white shadow-sm"
                          : "text-[#94A3B8] hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      <item.icon size={17} className={active ? "text-white" : "text-[#64748B] group-hover:text-white"} />
                      <span className="flex-1">{item.label}</span>
                      {item.isNotif && <NotificationBadge active={active} />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Kullanıcı & çıkış */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-[#F59E0B]/20 flex items-center justify-center shrink-0">
            <span className="text-[#F59E0B] text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold truncate">{user?.name ?? "—"}</div>
            <div className="text-[#64748B] text-[10px]">{user ? ROLE_LABEL[user.role] : ""}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Çıkış Yap"
            className="text-[#64748B] hover:text-[#EF4444] transition-colors p-1 rounded"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
