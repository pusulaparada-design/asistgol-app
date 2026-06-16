"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle, Camera } from "lucide-react";
import Image from "next/image";
import { PageContent, PageHeader, Card } from "@/components/ui/PageShell";
import { createTeam } from "@/lib/actions/team";


const COLORS = [
  { hex: "#EF4444", label: "Kırmızı"  },
  { hex: "#F97316", label: "Turuncu"  },
  { hex: "#F59E0B", label: "Sarı"     },
  { hex: "#84CC16", label: "Limon"    },
  { hex: "#10B981", label: "Yeşil"    },
  { hex: "#14B8A6", label: "Turkuaz"  },
  { hex: "#3B82F6", label: "Mavi"     },
  { hex: "#1E3A5F", label: "Lacivert" },
  { hex: "#0F1F47", label: "Koyu Lacivert" },
  { hex: "#8B5CF6", label: "Mor"      },
  { hex: "#EC4899", label: "Pembe"    },
  { hex: "#111827", label: "Siyah"    },
  { hex: "#6B7280", label: "Gri"      },
  { hex: "#F9FAFB", label: "Beyaz"    },
];

export default function CreateTeamPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Step 1 state
  const [name, setName] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  // Step 2 state
  const [players, setPlayers] = useState([{ name: "", number: "" }]);

  // Submit state
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError("");
    setLogoLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-logo", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Yükleme başarısız.");
      setLogoUrl(json.url);
    } catch (e: unknown) {
      setLogoError(e instanceof Error ? e.message : "Yükleme hatası.");
    } finally {
      setLogoLoading(false);
    }
  };

  const toggleColor = (hex: string) => {
    setColors(prev => {
      if (prev.includes(hex)) return prev.filter(c => c !== hex);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, hex];
    });
  };

  const addPlayer = () => setPlayers([...players, { name: "", number: "" }]);
  const removePlayer = (i: number) => setPlayers(players.filter((_, idx) => idx !== i));

  const goToStep1 = () => {
    if (!name.trim()) { setError("Takım adı zorunludur."); return; }
    setError("");
    setStep(1);
  };

  const handleSubmit = async () => {
    const validPlayers = players.filter(p => p.name.trim());
    if (validPlayers.length === 0) { setSubmitError("En az 1 oyuncu ekleyin."); return; }
    setLoading(true);
    setSubmitError("");
    try {
      await createTeam({
        name: name.trim(),
        color: colors.join(",") || undefined,
        description: description || undefined,
        logoUrl: logoUrl || undefined,
        players: validPlayers.map(p => ({
          name: p.name.trim(),
          number: p.number ? Number(p.number) : undefined,
        })),
      });
      router.push("/captain/my-teams");
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Bir hata oluştu.");
      setLoading(false);
    }
  };

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
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]"
                placeholder="örn. Yıldız FC"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#374151] mb-2">Takım Logosu (isteğe bağlı)</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-[#E5E7EB] overflow-hidden flex items-center justify-center bg-[#F9FAFB] shrink-0">
                  {logoUrl ? (
                    <Image src={logoUrl} alt="Logo" width={64} height={64} className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={22} className="text-[#D1D5DB]" />
                  )}
                </div>
                <div className="flex-1">
                  <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoChange} />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoLoading}
                    className="px-4 py-2 text-xs font-medium border border-[#E5E7EB] rounded-lg bg-white hover:bg-[#F4F6F9] transition-colors disabled:opacity-50"
                  >
                    {logoLoading ? "Yükleniyor..." : logoUrl ? "Logoyu Değiştir" : "Logo Yükle"}
                  </button>
                  {logoUrl && !logoLoading && (
                    <button type="button" onClick={() => setLogoUrl("")} className="ml-2 text-xs text-[#9CA3AF] hover:text-[#EF4444] transition-colors">
                      Kaldır
                    </button>
                  )}
                  <p className="mt-1 text-[10px] text-[#9CA3AF]">JPG, PNG veya WebP · en fazla 2MB</p>
                  {logoError && <p className="mt-1 text-xs text-red-500">{logoError}</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#374151] mb-2">
                Forma Rengi
                <span className="ml-2 text-[#9CA3AF] font-normal">en fazla 3 renk seçin</span>
              </label>

              {/* Seçili renk önizlemesi */}
              {colors.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex rounded-lg overflow-hidden h-8 w-20 border border-[#E5E7EB]">
                    {colors.map(c => (
                      <div key={c} className="flex-1" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="text-xs text-[#9CA3AF]">{colors.length} renk seçildi</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {COLORS.map(({ hex, label }) => {
                  const selected = colors.includes(hex);
                  const disabled = !selected && colors.length >= 3;
                  return (
                    <button
                      key={hex}
                      onClick={() => toggleColor(hex)}
                      disabled={disabled}
                      title={label}
                      className={`relative w-9 h-9 rounded-full border-2 transition-all ${
                        selected
                          ? "border-[#F59E0B] scale-110 shadow-md"
                          : disabled
                          ? "border-white opacity-30 cursor-not-allowed"
                          : "border-white shadow-sm hover:scale-110 hover:border-[#D1D5DB]"
                      }`}
                      style={{ backgroundColor: hex }}
                    >
                      {selected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <CheckCircle
                            size={16}
                            className={hex === "#F9FAFB" || hex === "#F59E0B" ? "text-[#111827]" : "text-white"}
                          />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">Takım Hakkında (isteğe bağlı)</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] resize-none"
                placeholder="Takımınız hakkında kısa not..."
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end">
              <button onClick={goToStep1} className="flex items-center gap-2 bg-[#0F1F47] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-[#1A2F5A] text-sm">
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

          {submitError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {submitError}
            </div>
          )}

          <div className="flex justify-between">
            <button onClick={() => setStep(0)} disabled={loading} className="flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#374151] px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F4F6F9] transition-colors disabled:opacity-50">
              <ArrowLeft size={16} /> Geri
            </button>
            <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 bg-[#10B981] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-[#059669] transition-colors text-sm disabled:opacity-50">
              <CheckCircle size={16} /> {loading ? "Oluşturuluyor..." : "Takımı Oluştur"}
            </button>
          </div>
        </div>
      )}
    </PageContent>
  );
}
