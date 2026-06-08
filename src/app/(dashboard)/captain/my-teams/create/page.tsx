"use client";
import { useState } from "react";
import { Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { PageContent, PageHeader, Card } from "@/components/ui/PageShell";

const positions = ["Kaleci", "Defans", "Orta Saha", "Forvet"];

export default function CreateTeamPage() {
  const [step, setStep] = useState(0);
  const [players, setPlayers] = useState([
    { name: "", position: "Orta Saha", number: "" },
  ]);
  const [done, setDone] = useState(false);

  const addPlayer = () => setPlayers([...players, { name: "", position: "Orta Saha", number: "" }]);
  const removePlayer = (i: number) => setPlayers(players.filter((_, idx) => idx !== i));

  if (done) {
    return (
      <PageContent>
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-16 h-16 bg-[#ECFDF5] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-[#10B981]" />
          </div>
          <h2 className="text-xl font-bold text-[#111827] mb-2">Takımınız Oluşturuldu!</h2>
          <p className="text-sm text-[#6B7280] mb-6">Artık turnuvalara kayıt yapabilirsiniz.</p>
          <div className="flex gap-3 justify-center">
            <a href="/captain/my-teams" className="px-4 py-2 text-sm font-semibold bg-[#0F1F47] text-white rounded-lg hover:bg-[#1A2F5A]">Takımlarıma Dön</a>
            <a href="/captain/tournaments" className="px-4 py-2 text-sm font-medium border border-[#E5E7EB] text-[#374151] rounded-lg hover:bg-[#F4F6F9]">Turnuva Ara</a>
          </div>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <PageHeader title="Yeni Takım Oluştur" subtitle="Takım bilgilerini ve kadroyu girin" />

      <div className="flex gap-2 mb-2">
        {["Takım Bilgileri", "Oyuncu Kadrosu"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < step ? "bg-[#10B981] text-white" : i === step ? "bg-[#0F1F47] text-white" : "bg-[#E5E7EB] text-[#9CA3AF]"}`}>
              {i < step ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === step ? "text-[#111827]" : "text-[#9CA3AF]"}`}>{s}</span>
            {i < 1 && <div className={`h-px w-8 ${i < step ? "bg-[#10B981]" : "bg-[#E5E7EB]"}`} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <Card>
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#111827]">Takım Bilgileri</h3>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Takım Adı *</label>
              <input className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]" placeholder="örn. Yıldız FC" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Şehir</label>
              <select className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]">
                {["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Takım Rengi (forma)</label>
              <div className="flex gap-2">
                {["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#0F1F47"].map(c => (
                  <button key={c} className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Takım Hakkında (isteğe bağlı)</label>
              <textarea rows={2} className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] resize-none" placeholder="Takımınız hakkında kısa not..." />
            </div>
            <div className="flex justify-end">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 bg-[#0F1F47] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-[#1A2F5A] text-sm">
                Devam Et <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </Card>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <Card>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#111827]">Oyuncu Kadrosu ({players.length} oyuncu)</h3>
                <button onClick={addPlayer} className="flex items-center gap-1 px-3 py-1.5 bg-[#F4F6F9] text-[#374151] text-xs font-medium rounded-lg hover:bg-[#E5E7EB] transition-colors">
                  <Plus size={13} /> Oyuncu Ekle
                </button>
              </div>

              <div className="space-y-2">
                {players.map((p, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      value={p.number}
                      onChange={e => { const ps = [...players]; ps[i].number = e.target.value; setPlayers(ps); }}
                      placeholder="#"
                      className="w-12 px-2 py-2 text-sm text-center border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F59E0B] font-mono"
                    />
                    <input
                      value={p.name}
                      onChange={e => { const ps = [...players]; ps[i].name = e.target.value; setPlayers(ps); }}
                      placeholder="Oyuncu adı soyadı"
                      className="flex-1 px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F59E0B]"
                    />
                    <select
                      value={p.position}
                      onChange={e => { const ps = [...players]; ps[i].position = e.target.value; setPlayers(ps); }}
                      className="px-2 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#F59E0B]"
                    >
                      {positions.map(pos => <option key={pos}>{pos}</option>)}
                    </select>
                    {players.length > 1 && (
                      <button onClick={() => removePlayer(i)} className="p-2 text-[#9CA3AF] hover:text-[#EF4444] transition-colors">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 p-3 bg-[#F4F6F9] rounded-lg text-xs text-[#6B7280]">
                En az 7, en fazla 14 oyuncu ekleyebilirsiniz. Turnuvalarda oyuncu listesi güncellenebilir.
              </div>
            </div>
          </Card>

          <div className="flex justify-between">
            <button onClick={() => setStep(0)} className="flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#374151] px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F4F6F9] transition-colors">
              <ArrowLeft size={16} /> Geri
            </button>
            <button onClick={() => setDone(true)} className="flex items-center gap-2 bg-[#10B981] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-[#059669] transition-colors text-sm">
              <CheckCircle size={16} /> Takımı Oluştur
            </button>
          </div>
        </div>
      )}
    </PageContent>
  );
}
