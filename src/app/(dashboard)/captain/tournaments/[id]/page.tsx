"use client";
import { useState } from "react";
import { MapPin, Calendar, Trophy, Users, CheckCircle, ArrowRight } from "lucide-react";
import { PageContent, PageHeader, Card, CardHeader, ActionButton, ProgressBar } from "@/components/ui/PageShell";

export default function TournamentPublicPage({ params }: { params: { id: string } }) {
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  if (registered) {
    return (
      <PageContent>
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-16 h-16 bg-[#ECFDF5] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-[#10B981]" />
          </div>
          <h2 className="text-xl font-bold text-[#111827] mb-2">Başvurunuz Alındı!</h2>
          <p className="text-sm text-[#6B7280]">Organizatör başvurunuzu inceledikten sonra onaylayacak. Bildirim gönderilecektir.</p>
          <a href="/captain/registrations" className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[#0F1F47] text-white font-semibold rounded-lg hover:bg-[#1A2F5A] text-sm">
            Kayıtlarımı Görüntüle
          </a>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <PageHeader
        title="Akşam Kupası"
        subtitle="Bosphorus Arena · İstanbul"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Tournament info */}
          <Card>
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                {[
                  { label: "Format", val: "Sadece Eleme" },
                  { label: "Takım Sayısı", val: "4/8" },
                  { label: "Kayıt Ücreti", val: "₺500" },
                  { label: "Ödül", val: "₺2.000" },
                ].map((s) => (
                  <div key={s.label} className="text-center p-3 bg-[#F4F6F9] rounded-xl">
                    <div className="text-xs text-[#9CA3AF]">{s.label}</div>
                    <div className="text-sm font-bold text-[#111827] mt-0.5">{s.val}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-[#374151]"><MapPin size={14} className="text-[#9CA3AF]" /> İstanbul · Bosphorus Halı Saha</div>
                <div className="flex items-center gap-2 text-sm text-[#374151]"><Calendar size={14} className="text-[#9CA3AF]" /> 20 Haziran – 5 Temmuz 2026</div>
                <div className="flex items-center gap-2 text-sm text-[#374151]"><Trophy size={14} className="text-[#9CA3AF]" /> Son kayıt: 18 Haziran 2026</div>
              </div>
            </div>
          </Card>

          {/* Rules */}
          <Card>
            <CardHeader title="Kural ve Koşullar" />
            <div className="p-5 text-sm text-[#6B7280] space-y-2">
              <p>• Her takım en az 7, en fazla 14 oyuncu ile kayıt yaptırabilir.</p>
              <p>• Maçlar 2×20 dakika, 5 dakika ara ile oynanır.</p>
              <p>• Sarı kart cezası: 3 sarı kart birikiminde 1 maç men.</p>
              <p>• Kırmızı kart: Otomatik 1 maç men + kurul kararı.</p>
              <p>• Beraberlik durumunda uzatma (2×5 dk) ve ardından penaltı.</p>
              <p>• Kayıt ücreti iade edilmez.</p>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          {/* Registration CTA */}
          <Card>
            <div className="p-5">
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#6B7280]">Doluluk</span>
                  <span className="font-semibold text-[#EF4444]">Son 4 yer!</span>
                </div>
                <ProgressBar value={4} max={8} color="red" />
              </div>

              {!registering ? (
                <button onClick={() => setRegistering(true)} className="w-full flex items-center justify-center gap-2 bg-[#0F1F47] text-white font-semibold py-3 rounded-xl hover:bg-[#1A2F5A] transition-colors">
                  Takımımı Kaydettir <ArrowRight size={16} />
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1.5">Hangi takımınızla katılacaksınız?</label>
                    <select className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]">
                      <option>Aslan FC (12 oyuncu)</option>
                      <option>Yıldız SK (11 oyuncu)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1.5">Organizatöre Not (isteğe bağlı)</label>
                    <textarea rows={2} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] resize-none" placeholder="Ek bilgi..." />
                  </div>
                  <button onClick={() => setRegistered(true)} className="w-full flex items-center justify-center gap-2 bg-[#10B981] text-white font-semibold py-2.5 rounded-xl hover:bg-[#059669] transition-colors text-sm">
                    <CheckCircle size={15} /> Başvuruyu Gönder
                  </button>
                  <button onClick={() => setRegistering(false)} className="w-full text-sm text-[#9CA3AF] hover:text-[#6B7280]">İptal</button>
                </div>
              )}
            </div>
          </Card>

          {/* Registered teams */}
          <Card>
            <CardHeader title="Kayıtlı Takımlar" subtitle="4 / 8" />
            <div className="divide-y divide-[#F3F4F6]">
              {["Rüzgar Spor", "Çınar FC", "Demir SK", "Fırtına FC"].map((t) => (
                <div key={t} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-7 h-7 bg-[#EFF6FF] rounded-lg flex items-center justify-center">
                    <Users size={13} className="text-[#3B82F6]" />
                  </div>
                  <span className="text-sm text-[#374151]">{t}</span>
                </div>
              ))}
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 opacity-40">
                  <div className="w-7 h-7 bg-[#F3F4F6] rounded-lg" />
                  <span className="text-sm text-[#D1D5DB] italic">— Boş yer —</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageContent>
  );
}
