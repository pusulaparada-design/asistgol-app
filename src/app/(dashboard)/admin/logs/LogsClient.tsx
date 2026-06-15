"use client";
import { useState, useTransition } from "react";
import { getAdminLogs } from "@/lib/actions/admin";
import { ScrollText, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/PageShell";

type Log = {
  id: string;
  level: "INFO" | "WARN" | "ERROR";
  category: "AUTH" | "ACTION" | "ERROR" | "SYSTEM";
  message: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userRole: string | null;
  ip: string | null;
  details: string | null;
  createdAt: Date;
};

const LEVELS    = ["ALL", "INFO", "WARN", "ERROR"] as const;
const CATS      = ["ALL", "AUTH", "ACTION", "ERROR", "SYSTEM"] as const;
const PAGE_SIZE = 100;

const levelStyle: Record<string, string> = {
  INFO:  "bg-[#EFF6FF] text-[#2563EB]",
  WARN:  "bg-[#FEF3C7] text-[#D97706]",
  ERROR: "bg-[#FEF2F2] text-[#DC2626]",
};
const catStyle: Record<string, string> = {
  AUTH:   "bg-[#F5F3FF] text-[#7C3AED]",
  ACTION: "bg-[#ECFDF5] text-[#059669]",
  ERROR:  "bg-[#FEF2F2] text-[#DC2626]",
  SYSTEM: "bg-[#F4F6F9] text-[#6B7280]",
};
const rowBg: Record<string, string> = {
  INFO:  "",
  WARN:  "bg-[#FFFBEB]/60",
  ERROR: "bg-[#FFF5F5]/60",
};

function fmt(d: Date) {
  return new Date(d).toLocaleString("tr-TR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export function LogsClient({ initialLogs, initialTotal }: { initialLogs: Log[]; initialTotal: number }) {
  const [logs, setLogs]         = useState<Log[]>(initialLogs);
  const [total, setTotal]       = useState(initialTotal);
  const [level, setLevel]       = useState<string>("ALL");
  const [category, setCategory] = useState<string>("ALL");
  const [page, setPage]         = useState(1);
  const [pending, start]        = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function load(lvl: string, cat: string, pg: number) {
    start(async () => {
      const result = await getAdminLogs({
        level: lvl,
        category: cat,
        limit: PAGE_SIZE,
        skip: (pg - 1) * PAGE_SIZE,
      });
      setLogs(result.logs as Log[]);
      setTotal(result.total);
    });
  }

  function handleLevel(lvl: string) {
    setLevel(lvl);
    setPage(1);
    load(lvl, category, 1);
  }

  function handleCat(cat: string) {
    setCategory(cat);
    setPage(1);
    load(level, cat, 1);
  }

  function handlePage(pg: number) {
    setPage(pg);
    load(level, category, pg);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      {/* Filtreler */}
      <Card>
        <div className="px-4 py-3 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#6B7280] mr-1">Seviye:</span>
            {LEVELS.map(l => (
              <button key={l} onClick={() => handleLevel(l)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${level === l ? "bg-[#0F1F47] text-white" : "bg-[#F4F6F9] text-[#6B7280] hover:bg-[#E5E7EB]"}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#6B7280] mr-1">Kategori:</span>
            {CATS.map(c => (
              <button key={c} onClick={() => handleCat(c)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${category === c ? "bg-[#0F1F47] text-white" : "bg-[#F4F6F9] text-[#6B7280] hover:bg-[#E5E7EB]"}`}>
                {c}
              </button>
            ))}
          </div>
          <button onClick={() => load(level, category, page)} disabled={pending}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#F4F6F9] text-[#374151] rounded-lg hover:bg-[#E5E7EB] disabled:opacity-50 transition-colors">
            <RefreshCw size={12} className={pending ? "animate-spin" : ""} />
            Yenile
          </button>
        </div>
      </Card>

      {/* Tablo */}
      <Card>
        <CardHeader
          title="Sistem Logları"
          subtitle={`${total} kayıt`}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                {["Zaman", "Seviye", "Kategori", "Mesaj", "Kullanıcı", "IP"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {logs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-[#9CA3AF]">Log bulunamadı</td></tr>
              ) : logs.map(log => (
                <>
                  <tr
                    key={log.id}
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    className={`cursor-pointer hover:bg-[#F8FAFC] transition-colors ${rowBg[log.level]}`}
                  >
                    <td className="px-3 py-2.5 text-[11px] text-[#6B7280] whitespace-nowrap font-mono">{fmt(log.createdAt)}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${levelStyle[log.level]}`}>{log.level}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${catStyle[log.category]}`}>{log.category}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[#111827] max-w-[280px] truncate">{log.message}</td>
                    <td className="px-3 py-2.5">
                      {log.userName ? (
                        <div>
                          <div className="text-xs font-medium text-[#374151]">{log.userName}</div>
                          <div className="text-[10px] text-[#9CA3AF]">{log.userRole} {log.userEmail ? `· ${log.userEmail}` : ""}</div>
                        </div>
                      ) : <span className="text-xs text-[#D1D5DB]">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-[#9CA3AF] font-mono">{log.ip ?? "—"}</td>
                  </tr>
                  {expandedId === log.id && log.details && (
                    <tr key={`${log.id}-detail`} className="bg-[#F8FAFC]">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <ScrollText size={12} className="text-[#9CA3AF]" />
                          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Detay</span>
                        </div>
                        <pre className="text-[11px] text-[#374151] bg-white rounded-lg p-3 border border-[#E5E7EB] overflow-x-auto">
                          {JSON.stringify(JSON.parse(log.details), null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#F3F4F6]">
            <span className="text-xs text-[#9CA3AF]">Sayfa {page} / {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => handlePage(page - 1)} disabled={page <= 1 || pending}
                className="p-1.5 rounded-lg hover:bg-[#F4F6F9] disabled:opacity-40 transition-colors">
                <ChevronLeft size={16} className="text-[#6B7280]" />
              </button>
              <button onClick={() => handlePage(page + 1)} disabled={page >= totalPages || pending}
                className="p-1.5 rounded-lg hover:bg-[#F4F6F9] disabled:opacity-40 transition-colors">
                <ChevronRight size={16} className="text-[#6B7280]" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
