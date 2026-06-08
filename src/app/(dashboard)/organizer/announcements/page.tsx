"use client";
import { useState } from "react";
import { Megaphone, Plus, Send, Users, Eye } from "lucide-react";
import { PageContent, PageHeader, Card, CardHeader, ActionButton, StatusBadge } from "@/components/ui/PageShell";

const announcements = [
  { id: 1, title: "Fikstür Güncellendi", body: "Ramazan Kupası 3. hafta maçlarının saatleri güncellendi. Lütfen takviminizi kontrol edin.", tournament: "Ramazan Kupası 2026", target: "Tüm takımlar", date: "2026-06-07", views: 24, status: "sent" },
  { id: 2, title: "Kart Cezası Hatırlatması", body: "Ateş FC kaptanına: Kemal Yıldız bu hafta oynayamaz. Kadronuzu buna göre güncelleyin.", tournament: "Ramazan Kupası 2026", target: "Ateş FC", date: "2026-06-07", views: 1, status: "sent" },
  { id: 3, title: "Final Hakkında", body: "Final maçı 29 Haziran Pazar günü saat 17:00'de Bosphorus Arena'da oynanacaktır.", tournament: "Ramazan Kupası 2026", target: "Tüm takımlar", date: "2026-06-05", views: 22, status: "sent" },
  { id: 4, name: "Yaz Ligi Kurallları", body: "Taslak...", tournament: "Yaz Ligi 2026", target: "Tüm takımlar", date: "2026-06-08", views: 0, status: "draft", title: "Kural Hatırlatması" },
];

export default function AnnouncementsPage() {
  const [composing, setComposing] = useState(false);

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
              <input className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" placeholder="Duyuru başlığı..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Turnuva</label>
                <select className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]">
                  <option>Ramazan Kupası 2026</option>
                  <option>Yaz Ligi 2026</option>
                  <option>Akşam Kupası</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Hedef Kitle</label>
                <select className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]">
                  <option>Tüm takımlar</option>
                  <option>Aslan FC</option>
                  <option>Kaplan SK</option>
                  <option>Çınar FC</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Mesaj</label>
              <textarea rows={4} className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] resize-none" placeholder="Duyuru içeriği..." />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setComposing(false)} className="px-4 py-2 text-sm text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F4F6F9]">İptal</button>
              <button className="px-4 py-2 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F4F6F9]">Taslak Kaydet</button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#0F1F47] text-white text-sm font-semibold rounded-lg hover:bg-[#1A2F5A]">
                <Send size={14} /> Gönder
              </button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="divide-y divide-[#F3F4F6]">
          {announcements.map((a) => (
            <div key={a.id} className="flex gap-4 px-5 py-4 hover:bg-[#FAFAFA] transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.status === "draft" ? "bg-[#F3F4F6]" : "bg-[#EFF6FF]"}`}>
                <Megaphone size={18} className={a.status === "draft" ? "text-[#9CA3AF]" : "text-[#3B82F6]"} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#111827]">{a.title}</span>
                  <StatusBadge label={a.status === "sent" ? "Gönderildi" : "Taslak"} variant={a.status === "sent" ? "green" : "gray"} dot={false} />
                </div>
                <p className="text-sm text-[#6B7280] mb-2">{a.body}</p>
                <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                  <span>{a.tournament}</span>
                  <span>·</span>
                  <div className="flex items-center gap-1"><Users size={11} /> {a.target}</div>
                  <span>·</span>
                  <div className="flex items-center gap-1"><Eye size={11} /> {a.views} görüntülenme</div>
                  <span>·</span>
                  <span>{a.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageContent>
  );
}
