"use client";
import { useState } from "react";
import { ArrowRight, ArrowLeft, CheckCircle, Info } from "lucide-react";
import { PageContent, PageHeader, Card } from "@/components/ui/PageShell";

type TournamentType = "group_knockout" | "group_only" | "knockout_only";
type MatchFormat = "single" | "double";

const steps = ["Temel Bilgiler", "Format Yapılandır", "Önizle & Yayınla"];

export default function CreateTournamentPage() {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<TournamentType>("group_knockout");
  const [teamCount, setTeamCount] = useState(16);
  const [groupCount, setGroupCount] = useState(4);
  const [advanceCount, setAdvanceCount] = useState(2);
  const [matchFormat, setMatchFormat] = useState<MatchFormat>("single");
  const [thirdPlace, setThirdPlace] = useState(true);
  const [extraTime, setExtraTime] = useState(true);
  const [trackGoals, setTrackGoals] = useState(true);
  const [trackCards, setTrackCards] = useState(true);
  const [yellowCardLimit, setYellowCardLimit] = useState(3);
  const [winPoints, setWinPoints] = useState(3);

  const teamsPerGroup = groupCount > 0 ? Math.ceil(teamCount / groupCount) : 0;
  const groupMatches = teamsPerGroup > 1 ? (teamsPerGroup * (teamsPerGroup - 1)) / 2 * (matchFormat === "double" ? 2 : 1) : 0;
  const totalGroupMatches = groupMatches * groupCount;
  const advancingTeams = advanceCount * groupCount;
  const knockoutRounds = advancingTeams > 0 ? Math.ceil(Math.log2(advancingTeams)) : 0;

  return (
    <PageContent>
      <PageHeader title="Yeni Turnuva Oluştur" subtitle="Adım adım turnuvanızı yapılandırın" />

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < step ? "bg-[#10B981] text-white" : i === step ? "bg-[#0F1F47] text-white" : "bg-[#E5E7EB] text-[#9CA3AF]"
              }`}>
                {i < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === step ? "text-[#111827]" : "text-[#9CA3AF]"}`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-8 sm:w-16 mx-2 ${i < step ? "bg-[#10B981]" : "bg-[#E5E7EB]"}`} />
            )}
          </div>
        ))}
      </div>

      {step === 0 && (
        <Card>
          <div className="p-6 space-y-5">
            <h3 className="text-base font-semibold text-[#111827]">Temel Bilgiler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Turnuva Adı *</label>
                <input className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" placeholder="örn. Yaz Kupası 2026" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Şehir *</label>
                <select className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]">
                  <option>İstanbul</option><option>Ankara</option><option>İzmir</option><option>Bursa</option><option>Antalya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Varsayılan Saha Adı</label>
                <input className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" placeholder="örn. Yıldız Halı Saha" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Başlangıç Tarihi *</label>
                <input type="date" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Bitiş Tarihi</label>
                <input type="date" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Kayıt Ücreti (₺)</label>
                <input type="number" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Ödül / Kupa Bilgisi</label>
                <input className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" placeholder="örn. ₺5.000 veya Kupa" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#374151] mb-1.5">Açıklama / Kurallar</label>
                <textarea rows={3} className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] resize-none" placeholder="Turnuva hakkında kısa bilgi ve kurallar..." />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 bg-[#0F1F47] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-[#1A2F5A] transition-colors text-sm">
                Devam Et <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </Card>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-5">
            {/* Tournament type */}
            <Card>
              <div className="p-5 space-y-4">
                <h3 className="text-sm font-semibold text-[#111827]">Turnuva Tipi</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {([
                    { value: "group_knockout", label: "Grup + Eleme", desc: "Grup aşaması sonrası eleme" },
                    { value: "group_only", label: "Sadece Lig", desc: "Herkes herkesle oynuyor" },
                    { value: "knockout_only", label: "Sadece Eleme", desc: "Direkt eleme formatı" },
                  ] as { value: TournamentType; label: string; desc: string }[]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setType(opt.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${type === opt.value ? "border-[#F59E0B] bg-[#FFFBEB]" : "border-[#E5E7EB] hover:border-[#D1D5DB]"}`}
                    >
                      <div className="text-sm font-semibold text-[#111827]">{opt.label}</div>
                      <div className="text-xs text-[#9CA3AF] mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Team & group settings */}
            <Card>
              <div className="p-5 space-y-4">
                <h3 className="text-sm font-semibold text-[#111827]">Takım & Grup Ayarları</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1.5">Toplam Takım Sayısı</label>
                    <select value={teamCount} onChange={e => setTeamCount(+e.target.value)} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]">
                      {[4,6,8,10,12,14,16,20,24,32].map(n => <option key={n} value={n}>{n} takım</option>)}
                    </select>
                  </div>
                  {(type === "group_knockout" || type === "group_only") && (
                    <div>
                      <label className="block text-xs font-medium text-[#374151] mb-1.5">Grup Sayısı</label>
                      <select value={groupCount} onChange={e => setGroupCount(+e.target.value)} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]">
                        {[1,2,3,4,5,6,8].map(n => <option key={n} value={n}>{n} grup</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1.5">Maç Formatı</label>
                    <select value={matchFormat} onChange={e => setMatchFormat(e.target.value as MatchFormat)} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]">
                      <option value="single">Tek Maç</option>
                      <option value="double">Çift Maç (iç/dış saha)</option>
                    </select>
                  </div>
                  {(type === "group_knockout") && (
                    <div>
                      <label className="block text-xs font-medium text-[#374151] mb-1.5">Gruptan Çıkan Takım Sayısı</label>
                      <select value={advanceCount} onChange={e => setAdvanceCount(+e.target.value)} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]">
                        {[1,2,3,4].map(n => <option key={n} value={n}>İlk {n} takım</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1.5">Galibiyet Puanı</label>
                    <select value={winPoints} onChange={e => setWinPoints(+e.target.value)} className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]">
                      <option value={3}>3 puan</option>
                      <option value={2}>2 puan</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Extra options */}
            <Card>
              <div className="p-5">
                <h3 className="text-sm font-semibold text-[#111827] mb-4">Ek Seçenekler</h3>
                <div className="space-y-3">
                  {[
                    { label: "Uzatma / Penaltı (beraberlik durumunda)", val: extraTime, set: setExtraTime },
                    { label: "Üçüncülük maçı", val: thirdPlace, set: setThirdPlace },
                    { label: "Golcü istatistiği takibi", val: trackGoals, set: setTrackGoals },
                    { label: "Sarı / Kırmızı kart takibi", val: trackCards, set: setTrackCards },
                  ].map((opt) => (
                    <div key={opt.label} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                      <span className="text-sm text-[#374151]">{opt.label}</span>
                      <button
                        onClick={() => opt.set(!opt.val)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${opt.val ? "bg-[#0F1F47]" : "bg-[#E5E7EB]"}`}
                      >
                        <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all" style={{ left: opt.val ? "22px" : "2px" }} />
                      </button>
                    </div>
                  ))}
                  {trackCards && (
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-sm text-[#374151]">Sarı kart men cezası</span>
                        <span className="text-xs text-[#9CA3AF] ml-2">biriken sarı karttan sonra 1 maç men</span>
                      </div>
                      <select value={yellowCardLimit} onChange={e => setYellowCardLimit(+e.target.value)} className="px-2 py-1 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none">
                        {[2,3,4,5].map(n => <option key={n} value={n}>{n}. sarı kartta</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Live preview */}
          <div>
            <Card className="sticky top-20">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={15} className="text-[#F59E0B]" />
                  <h3 className="text-sm font-semibold text-[#111827]">Canlı Özet</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Turnuva Tipi", val: type === "group_knockout" ? "Grup + Eleme" : type === "group_only" ? "Sadece Lig" : "Sadece Eleme" },
                    { label: "Toplam Takım", val: `${teamCount} takım` },
                    ...(type !== "knockout_only" ? [
                      { label: "Grup Sayısı", val: `${groupCount} grup` },
                      { label: "Gruptaki Takım", val: `${teamsPerGroup} takım/grup` },
                      { label: "Gruptaki Maç", val: `${groupMatches} maç/grup` },
                      { label: "Toplam Grup Maçı", val: `${totalGroupMatches} maç` },
                    ] : []),
                    ...(type === "group_knockout" ? [
                      { label: "Eleman Takım", val: `${advancingTeams} takım` },
                      { label: "Eleme Turu", val: `${knockoutRounds} tur` },
                    ] : []),
                    { label: "Sarı Kart Cezası", val: trackCards ? `${yellowCardLimit}. kartta men` : "Takip yok" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-[#F3F4F6] last:border-0">
                      <span className="text-xs text-[#6B7280]">{row.label}</span>
                      <span className="text-xs font-semibold text-[#111827]">{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className="xl:col-span-3 flex justify-between">
            <button onClick={() => setStep(0)} className="flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#374151] px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F4F6F9] transition-colors">
              <ArrowLeft size={16} /> Geri
            </button>
            <button onClick={() => setStep(2)} className="flex items-center gap-2 bg-[#0F1F47] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-[#1A2F5A] transition-colors text-sm">
              Önizlemeye Geç <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-[#FEF3C7] rounded-2xl flex items-center justify-center">
                  <CheckCircle size={24} className="text-[#D97706]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111827]">Turnuva Hazır!</h3>
                  <p className="text-sm text-[#6B7280]">Tüm ayarlar yapılandırıldı. Yayınlamak için onaylayın.</p>
                </div>
              </div>

              <div className="bg-[#F4F6F9] rounded-xl p-4 mb-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Format", val: "Grup + Eleme" },
                    { label: "Takım", val: `${teamCount}` },
                    { label: "Grup", val: `${groupCount}` },
                    { label: "Est. Maç", val: `${totalGroupMatches + knockoutRounds * Math.ceil(advancingTeams / 2)}+` },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-xl font-bold text-[#111827]">{s.val}</div>
                      <div className="text-xs text-[#9CA3AF]">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#374151] px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F4F6F9] transition-colors">
                  <ArrowLeft size={16} /> Geri
                </button>
                <div className="flex gap-3">
                  <button className="px-4 py-2.5 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] bg-white hover:bg-[#F4F6F9] rounded-lg transition-colors">
                    Taslak Olarak Kaydet
                  </button>
                  <button className="flex items-center gap-2 bg-[#10B981] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-[#059669] transition-colors text-sm">
                    <CheckCircle size={16} /> Turnuvayı Yayınla
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </PageContent>
  );
}
