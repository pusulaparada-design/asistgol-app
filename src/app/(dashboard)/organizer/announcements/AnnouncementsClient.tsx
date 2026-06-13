"use client";
import { useState, useTransition } from "react";
import { Megaphone, Plus, Send, Users, Eye } from "lucide-react";
import { PageContent, PageHeader, Card, CardHeader, ActionButton } from "@/components/ui/PageShell";
import { createAnnouncement } from "@/lib/actions/announcement";

type Announcement = {
  id: string;
  title: string;
  body: string;
  target: string;
  createdAt: Date;
  tournament: { name: string } | null;
};

type Tournament = {
  id: string;
  name: string;
  registrations: { team: { name: string } }[];
};

export default function AnnouncementsClient({
  announcements,
  tournaments,
}: {
  announcements: Announcement[];
  tournaments: Tournament[];
}) {
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tournamentId, setTournamentId] = useState<string>("ALL");
  const [target, setTarget] = useState("Tüm takımlar");
  const [isPending, startTransition] = useTransition();

  const isAll = tournamentId === "ALL";
  const selectedTournament = isAll ? null : tournaments.find((t) => t.id === tournamentId);
  const teamOptions = selectedTournament?.registrations.map((r) => r.team.name) ?? [];

  function handleSend() {
    if (!title.trim() || !body.trim()) return;
    startTransition(async () => {
      await createAnnouncement({
        title: title.trim(),
        body: body.trim(),
        tournamentId: isAll ? null : tournamentId,
        target: isAll ? "Tüm Turnuvalar" : target,
      });
      setTitle(""); setBody(""); setComposing(false);
    });
  }

  function fmtDate(d: Date) {
    return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <PageContent>
      <PageHeader
        title="Duyurular"
        subtitle="Kaptanlara bildirim gönder"
        actions={
          <ActionButton variant="primary" icon={Plus} onClick={() => setComposing(true)}>
            Yeni Duyuru
          </ActionButton>
        }
      />

      {composing && (
        <Card>
          <CardHeader title="Yeni Duyuru Oluştur" border={false} />
          <div className="px-5 pb-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Başlık</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]"
                placeholder="Duyuru başlığı..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Turnuva</label>
                <select
                  value={tournamentId}
                  onChange={(e) => { setTournamentId(e.target.value); setTarget("Tüm takımlar"); }}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]"
                >
                  <option value="ALL">⭐ Tüm Turnuvalarım</option>
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Hedef Kitle</label>
                <select
                  value={isAll ? "Tüm Kaptanlar" : target}
                  onChange={(e) => setTarget(e.target.value)}
                  disabled={isAll}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF]"
                >
                  {isAll
                    ? <option>Tüm Kaptanlar</option>
                    : <>
                        <option>Tüm takımlar</option>
                        {teamOptions.map((name) => <option key={name}>{name}</option>)}
                      </>
                  }
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Mesaj</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] resize-none"
                placeholder="Duyuru içeriği..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setComposing(false)} className="px-4 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F4F6F9]">İptal</button>
              <button
                onClick={handleSend}
                disabled={isPending || !title.trim() || !body.trim() || (!isAll && !tournamentId)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0F1F47] text-white text-sm font-semibold rounded-lg hover:bg-[#1A2F5A] disabled:opacity-50"
              >
                <Send size={14} /> {isPending ? "Gönderiliyor..." : "Gönder"}
              </button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Megaphone size={32} className="text-[#D1D5DB] mb-3" />
            <div className="text-sm font-semibold text-[#374151]">Henüz duyuru yok</div>
            <div className="text-xs text-[#9CA3AF] mt-1">Kaptanlara ilk duyurunuzu gönderin</div>
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {announcements.map((a) => (
              <div key={a.id} className="flex gap-4 px-5 py-4 hover:bg-[#FAFAFA] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
                  <Megaphone size={18} className="text-[#3B82F6]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#111827] mb-1">{a.title}</div>
                  <p className="text-sm text-[#6B7280] mb-2">{a.body}</p>
                  <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                    <span>{a.tournament?.name ?? "Tüm Turnuvalarım"}</span>
                    <span>·</span>
                    <div className="flex items-center gap-1"><Users size={11} /> {a.target}</div>
                    <span>·</span>
                    <span>{fmtDate(a.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageContent>
  );
}
