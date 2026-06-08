import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

// ─── Page layout ──────────────────────────────────────────────
export function PageContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 space-y-6 ${className}`}>{children}</div>;
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[#111827] leading-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

// ─── Card ──────────────────────────────────────────────────────
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  actions,
  border = true,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  border?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-5 py-4 ${border ? "border-b border-[#E5E7EB]" : ""}`}>
      <div>
        <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>
        {subtitle && <p className="text-xs text-[#9CA3AF] mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ─── Stat Card (Zahntec style) ─────────────────────────────────
type StatColor = "blue" | "gold" | "green" | "red" | "orange" | "teal" | "purple";

const statColorMap: Record<StatColor, { border: string; iconBg: string; iconColor: string }> = {
  blue:   { border: "border-t-[#3B82F6]",  iconBg: "bg-[#EFF6FF]",  iconColor: "text-[#3B82F6]" },
  gold:   { border: "border-t-[#F59E0B]",  iconBg: "bg-[#FEF3C7]",  iconColor: "text-[#F59E0B]" },
  green:  { border: "border-t-[#10B981]",  iconBg: "bg-[#ECFDF5]",  iconColor: "text-[#10B981]" },
  red:    { border: "border-t-[#EF4444]",  iconBg: "bg-[#FEF2F2]",  iconColor: "text-[#EF4444]" },
  orange: { border: "border-t-[#F97316]",  iconBg: "bg-[#FFF7ED]",  iconColor: "text-[#F97316]" },
  teal:   { border: "border-t-[#06B6D4]",  iconBg: "bg-[#ECFEFF]",  iconColor: "text-[#06B6D4]" },
  purple: { border: "border-t-[#8B5CF6]",  iconBg: "bg-[#F5F3FF]",  iconColor: "text-[#8B5CF6]" },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "blue",
  trend,
  trendLabel,
  sublabel,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: StatColor;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  sublabel?: string;
}) {
  const c = statColorMap[color];
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-[#10B981]" : trend === "down" ? "text-[#EF4444]" : "text-[#9CA3AF]";

  return (
    <div className={`bg-white rounded-xl border border-[#E5E7EB] border-t-4 ${c.border} shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={20} className={c.iconColor} />
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#111827] leading-none">{value}</div>
          {sublabel && <div className="text-xs text-[#9CA3AF] mt-1">{sublabel}</div>}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">{label}</span>
        {trend && trendLabel && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon size={12} />
            <span>{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Table ─────────────────────────────────────────────────────
export function TableHeader({ columns }: { columns: string[] }) {
  return (
    <thead>
      <tr className="border-b border-[#E5E7EB]">
        {columns.map((col, i) => (
          <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

// ─── Status Badge ──────────────────────────────────────────────
type BadgeVariant = "blue" | "gold" | "green" | "red" | "orange" | "teal" | "purple" | "gray";

const badgeMap: Record<BadgeVariant, string> = {
  blue:   "bg-[#EFF6FF] text-[#2563EB]",
  gold:   "bg-[#FEF3C7] text-[#D97706]",
  green:  "bg-[#ECFDF5] text-[#059669]",
  red:    "bg-[#FEF2F2] text-[#DC2626]",
  orange: "bg-[#FFF7ED] text-[#EA580C]",
  teal:   "bg-[#ECFEFF] text-[#0891B2]",
  purple: "bg-[#F5F3FF] text-[#7C3AED]",
  gray:   "bg-[#F3F4F6] text-[#6B7280]",
};

export function StatusBadge({
  label,
  variant = "gray",
  dot = true,
}: {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badgeMap[variant]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full bg-current opacity-70`} />}
      {label}
    </span>
  );
}

export function badge(label: string, variant: BadgeVariant = "gray") {
  return <StatusBadge label={label} variant={variant} />;
}

// ─── Action Button ─────────────────────────────────────────────
export function ActionButton({
  children,
  variant = "primary",
  size = "md",
  onClick,
  href,
  icon: Icon,
  disabled,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  onClick?: () => void;
  href?: string;
  icon?: LucideIcon;
  disabled?: boolean;
}) {
  const base = "inline-flex items-center gap-2 font-medium rounded-lg transition-all cursor-pointer";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-[#0F1F47] text-white hover:bg-[#1A2F5A]",
    secondary: "bg-white text-[#111827] border border-[#E5E7EB] hover:bg-[#F9FAFB]",
    danger: "bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]",
    ghost: "text-[#6B7280] hover:bg-[#F3F4F6]",
  };
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;

  if (href) {
    return (
      <a href={href} className={cls}>
        {Icon && <Icon size={size === "sm" ? 14 : 16} />}
        {children}
      </a>
    );
  }
  return (
    <button className={cls} onClick={onClick} disabled={disabled}>
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

// ─── Empty State ───────────────────────────────────────────────
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#F4F6F9] flex items-center justify-center mb-4">
        <Icon size={28} className="text-[#9CA3AF]" />
      </div>
      <h3 className="text-sm font-semibold text-[#374151] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#9CA3AF] max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Score display ─────────────────────────────────────────────
export function ScoreBox({ home, away, status }: { home: number | null; away: number | null; status: string }) {
  if (status === "planlandı" || home === null) {
    return <span className="text-xs font-medium text-[#9CA3AF]">vs</span>;
  }
  return (
    <span className="font-mono font-bold text-[#111827] text-sm">
      {home} - {away}
    </span>
  );
}

// ─── Live badge ────────────────────────────────────────────────
export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#DC2626]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />
      CANLI
    </span>
  );
}

// ─── Progress bar ──────────────────────────────────────────────
export function ProgressBar({ value, max, color = "blue" }: { value: number; max: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors: Record<string, string> = {
    blue: "bg-[#3B82F6]", gold: "bg-[#F59E0B]", green: "bg-[#10B981]", red: "bg-[#EF4444]",
  };
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colors[color] ?? "bg-[#3B82F6]"}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-[#9CA3AF] w-8 text-right">{pct}%</span>
    </div>
  );
}

// ─── Section divider ───────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  if (!label) return <div className="h-px bg-[#E5E7EB]" />;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-[#E5E7EB]" />
      <span className="text-xs text-[#9CA3AF] uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-[#E5E7EB]" />
    </div>
  );
}
