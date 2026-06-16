"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Clock, CalendarPlus, Calendar, Pencil, Check, Copy, CopyPlus, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/PageShell";

export interface MatchDay {
  id: string;
  date: string;   // YYYY-MM-DD
  times: string[];
}

export interface MatchWeek {
  id: string;
  label: string;  // "1. Hafta", "Çeyrek Final", vs.
  days: MatchDay[];
}

let _c = 0;
function uid() { return `id-${++_c}-${Date.now()}`; }

const TR_MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const TR_DAYS_SHORT = ["Pt","Sa","Ça","Pe","Cu","Ct","Pz"];

function DatePicker({ value, onChange, className = "" }: {
  value: string;   // YYYY-MM-DD
  onChange: (v: string) => void;
  className?: string;
}) {
  const now = new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value ? +value.slice(0,4) : now.getFullYear());
  const [viewMonth, setViewMonth] = useState(value ? +value.slice(5,7) - 1 : now.getMonth());
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const display = value ? value.split("-").reverse().join("/") : "";

  function prev() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function next() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function select(day: number) {
    onChange(`${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`);
    setOpen(false);
  }

  // Pazartesi başlangıçlı grid
  function buildGrid() {
    const firstDow = new Date(viewYear, viewMonth, 1).getDay(); // 0=Pz
    const offset = (firstDow + 6) % 7; // Pz(0)→6, Pt(1)→0
    const days = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number|null)[] = Array(offset).fill(null);
    for (let d = 1; d <= days; d++) cells.push(d);
    while (cells.length % 7) cells.push(null);
    return cells;
  }

  const grid = buildGrid();
  const todayStr = now.toISOString().slice(0,10);

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          if (value) { setViewYear(+value.slice(0,4)); setViewMonth(+value.slice(5,7)-1); }
          setOpen(o => !o);
        }}
        className="w-full px-2.5 py-1.5 text-sm border border-[#E5E7EB] rounded-lg flex items-center gap-2 bg-white hover:border-[#F59E0B] transition-colors"
      >
        <Calendar size={13} className="text-[#9CA3AF] shrink-0" />
        {display
          ? <span className="text-[#111827]">{display}</span>
          : <span className="text-[#9CA3AF]">GG/AA/YYYY</span>}
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 bg-white border border-[#E5E7EB] rounded-xl shadow-xl p-3 w-[220px]">
          {/* Ay/Yıl başlığı */}
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={prev} className="p-1 hover:bg-[#F4F6F9] rounded-lg transition-colors">
              <ChevronLeft size={14} className="text-[#374151]" />
            </button>
            <span className="text-xs font-bold text-[#111827]">
              {TR_MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={next} className="p-1 hover:bg-[#F4F6F9] rounded-lg transition-colors">
              <ChevronRight size={14} className="text-[#374151]" />
            </button>
          </div>

          {/* Gün başlıkları */}
          <div className="grid grid-cols-7 mb-1">
            {TR_DAYS_SHORT.map(d => (
              <div key={d} className="text-center text-[9px] font-bold text-[#9CA3AF] py-0.5">{d}</div>
            ))}
          </div>

          {/* Günler */}
          <div className="grid grid-cols-7 gap-0.5">
            {grid.map((day, i) => {
              if (!day) return <div key={i} />;
              const ds = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const isSel = ds === value;
              const isToday = ds === todayStr;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => select(day)}
                  className={`aspect-square flex items-center justify-center text-[11px] rounded-lg transition-colors ${
                    isSel ? "bg-[#0F1F47] text-white font-bold"
                    : isToday ? "bg-[#FEF3C7] text-[#D97706] font-semibold"
                    : "hover:bg-[#F4F6F9] text-[#374151]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const KNOCKOUT_LABELS = ["Çeyrek Final", "Yarı Final", "Final", "3. Yer Maçı"];

export default function ScheduleTab({
  weeks,
  onChange,
  readOnly = false,
}: {
  weeks: MatchWeek[];
  onChange: (weeks: MatchWeek[]) => void;
  readOnly?: boolean;
}) {
  const [pendingTimes, setPendingTimes] = useState<Record<string, string>>({});
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [labelDraft, setLabelDraft] = useState("");

  const totalSlots = weeks.reduce(
    (s, w) => s + w.days.reduce((ds, d) => ds + d.times.length, 0), 0
  );

  // ── Hafta işlemleri ─────────────────────────────────────
  function addGroupWeek() {
    const n = weeks.filter(w => w.label.endsWith(". Hafta")).length + 1;
    onChange([...weeks, { id: uid(), label: `${n}. Hafta`, days: [] }]);
  }

  function addKnockoutWeek(label: string) {
    onChange([...weeks, { id: uid(), label, days: [] }]);
  }

  function removeWeek(weekId: string) {
    onChange(weeks.filter(w => w.id !== weekId));
  }

  function saveLabel(weekId: string) {
    if (labelDraft.trim()) {
      onChange(weeks.map(w => w.id === weekId ? { ...w, label: labelDraft.trim() } : w));
    }
    setEditingLabel(null);
  }

  // ── Gün işlemleri ───────────────────────────────────────
  function addDay(weekId: string) {
    onChange(weeks.map(w =>
      w.id === weekId ? { ...w, days: [...w.days, { id: uid(), date: "", times: [] }] } : w
    ));
  }

  function updateDate(weekId: string, dayId: string, date: string) {
    onChange(weeks.map(w =>
      w.id === weekId
        ? { ...w, days: w.days.map(d => d.id === dayId ? { ...d, date } : d) }
        : w
    ));
  }

  function removeDay(weekId: string, dayId: string) {
    onChange(weeks.map(w =>
      w.id === weekId ? { ...w, days: w.days.filter(d => d.id !== dayId) } : w
    ));
  }

  // ── Saat işlemleri ──────────────────────────────────────
  function addTime(dayId: string) {
    const raw = (pendingTimes[dayId] ?? "").trim();
    const t = raw.match(/^\d{1,2}:\d{2}$/) ? raw.padStart(5, "0") : "";
    if (!t) return;
    onChange(weeks.map(w => ({
      ...w,
      days: w.days.map(d =>
        d.id === dayId && !d.times.includes(t)
          ? { ...d, times: [...d.times, t].sort() }
          : d
      ),
    })));
    setPendingTimes(p => ({ ...p, [dayId]: "" }));
  }

  function removeTime(dayId: string, time: string) {
    onChange(weeks.map(w => ({
      ...w,
      days: w.days.map(d =>
        d.id === dayId ? { ...d, times: d.times.filter(t => t !== time) } : d
      ),
    })));
  }

  function duplicateWeek(weekId: string) {
    const week = weeks.find(w => w.id === weekId);
    if (!week) return;
    addNextWeekFrom(week);
  }

  // Her zaman verilen haftadan +7 gün ile yeni hafta oluşturur
  function addNextWeekFrom(week: MatchWeek) {
    const newDays = week.days.map(d => {
      let newDate = "";
      if (d.date) {
        const dt = new Date(d.date + "T12:00:00");
        dt.setDate(dt.getDate() + 7);
        newDate = dt.toISOString().split("T")[0];
      }
      return { id: uid(), date: newDate, times: [...d.times] };
    });
    const n = weeks.filter(w => w.label.endsWith(". Hafta")).length + 1;
    onChange([...weeks, { id: uid(), label: `${n}. Hafta`, days: newDays }]);
  }

  // Son haftadan kopyala (tarihler her seferinde doğru ilerler)
  function addNextWeek() {
    const lastGroupWeek = [...weeks].reverse().find(w => w.label.endsWith(". Hafta"));
    if (lastGroupWeek) addNextWeekFrom(lastGroupWeek);
    else addGroupWeek();
  }

  function copyTimesFromPrev(weekId: string, dayId: string) {
    const week = weeks.find(w => w.id === weekId);
    if (!week) return;
    const sorted = [...week.days].sort((a, b) => a.date.localeCompare(b.date));
    const idx = sorted.findIndex(d => d.id === dayId);
    // Saati olan en yakın önceki günü bul
    const source = sorted.slice(0, idx).reverse().find(d => d.times.length > 0);
    if (!source) return;
    onChange(weeks.map(w =>
      w.id === weekId
        ? { ...w, days: w.days.map(d => d.id === dayId ? { ...d, times: [...source.times] } : d) }
        : w
    ));
  }

  if (readOnly) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 px-4 py-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-xs text-[#166534]">
          <CheckCircle size={14} className="shrink-0 mt-0.5 text-[#16A34A]" />
          <span>Fikstür oluşturulduğu için maç günleri düzenlenemez. Tarih ve saat değişiklikleri için <strong>Fikstür</strong> sekmesini kullanın.</span>
        </div>
        {weeks.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#9CA3AF]">Maç günü tanımlanmamış.</div>
        ) : (
          <div className="space-y-3">
            {weeks.map(week => {
              const isEleme = KNOCKOUT_LABELS.includes(week.label);
              return (
                <Card key={week.id}>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]">
                    <span className={`w-8 h-8 shrink-0 text-xs font-bold rounded-lg flex items-center justify-center ${
                      isEleme ? "bg-[#7C3AED] text-white" : "bg-[#0F1F47] text-white"
                    }`}>
                      {isEleme ? "★" : weeks.indexOf(week) + 1}
                    </span>
                    <span className="text-sm font-semibold text-[#111827]">{week.label}</span>
                    <span className="text-xs text-[#9CA3AF]">
                      {week.days.length} gün · {week.days.reduce((s, d) => s + d.times.length, 0)} slot
                    </span>
                  </div>
                  <div className="divide-y divide-[#F3F4F6]">
                    {[...week.days].sort((a, b) => a.date.localeCompare(b.date)).map(day => (
                      <div key={day.id} className="flex items-center gap-4 px-4 py-3">
                        <span className="text-sm text-[#374151] w-28 shrink-0">
                          {day.date ? day.date.split("-").reverse().join("/") : "—"}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {day.times.length === 0
                            ? <span className="text-xs text-[#D1D5DB] italic">Saat eklenmedi</span>
                            : day.times.map(t => (
                              <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold rounded-lg">
                                <Clock size={10} />{t}
                              </span>
                            ))
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Üst bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[#6B7280]">
          {weeks.length} bölüm ·{" "}
          <span className="font-semibold text-[#111827]">{totalSlots} toplam maç slotu</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {/* Eleme turu hızlı ekle */}
          {KNOCKOUT_LABELS.map(label => (
            <button
              key={label}
              onClick={() => addKnockoutWeek(label)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#7C3AED] bg-[#F5F3FF] rounded-lg hover:bg-[#EDE9FE] transition-colors"
            >
              <Plus size={11} /> {label}
            </button>
          ))}
          {weeks.some(w => w.label.endsWith(". Hafta")) ? (
            <button
              onClick={addNextWeek}
              className="flex items-center gap-2 px-4 py-2 bg-[#0F1F47] text-white text-sm font-semibold rounded-lg hover:bg-[#1A2F5A] transition-colors"
              title="Son haftadan +7 gün ile yeni hafta ekler"
            >
              <CalendarPlus size={14} /> Sonraki Haftayı Ekle
            </button>
          ) : (
            <button
              onClick={addGroupWeek}
              className="flex items-center gap-2 px-4 py-2 bg-[#0F1F47] text-white text-sm font-semibold rounded-lg hover:bg-[#1A2F5A] transition-colors"
            >
              <CalendarPlus size={14} /> Hafta Ekle
            </button>
          )}
        </div>
      </div>

      {/* Boş durum */}
      {weeks.length === 0 ? (
        <div className="py-16 text-center">
          <CalendarPlus size={32} className="mx-auto text-[#D1D5DB] mb-3" />
          <p className="text-sm font-medium text-[#374151] mb-1">Henüz bölüm eklenmedi</p>
          <p className="text-xs text-[#9CA3AF]">
            Grup maçları için "Hafta Ekle", eleme turları için üstteki butonları kullanın.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {weeks.map((week) => {
            const weekSlots = week.days.reduce((s, d) => s + d.times.length, 0);
            const isEleme = KNOCKOUT_LABELS.includes(week.label);

            return (
              <Card key={week.id}>
                {/* Hafta/tur başlığı */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-8 h-8 shrink-0 text-xs font-bold rounded-lg flex items-center justify-center ${
                      isEleme ? "bg-[#7C3AED] text-white" : "bg-[#0F1F47] text-white"
                    }`}>
                      {isEleme ? "★" : weeks.indexOf(week) + 1}
                    </span>

                    {/* Etiket düzenleme */}
                    {editingLabel === week.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          autoFocus
                          value={labelDraft}
                          onChange={e => setLabelDraft(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") saveLabel(week.id);
                            if (e.key === "Escape") setEditingLabel(null);
                          }}
                          className="text-sm font-semibold border-b-2 border-[#F59E0B] focus:outline-none bg-transparent min-w-0 w-40"
                        />
                        <button onClick={() => saveLabel(week.id)} className="p-1 text-[#059669]">
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-semibold text-[#111827] truncate">{week.label}</span>
                        <button
                          onClick={() => { setEditingLabel(week.id); setLabelDraft(week.label); }}
                          className="p-1 text-[#D1D5DB] hover:text-[#6B7280] transition-colors shrink-0"
                          title="Yeniden adlandır"
                        >
                          <Pencil size={11} />
                        </button>
                      </div>
                    )}

                    <span className="text-xs text-[#9CA3AF] shrink-0">
                      {week.days.length} gün · {weekSlots} slot
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={addNextWeek}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#059669] bg-[#F0FDF4] rounded-lg hover:bg-[#DCFCE7] transition-colors"
                      title="Son haftayı alır, tarihleri +7 gün ilerletir"
                    >
                      <CopyPlus size={12} /> Haftayı Kopyala
                    </button>
                    <button
                      onClick={() => addDay(week.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] rounded-lg hover:bg-[#DBEAFE] transition-colors"
                    >
                      <Calendar size={12} /> Gün Ekle
                    </button>
                    <button
                      onClick={() => removeWeek(week.id)}
                      className="p-1.5 text-[#9CA3AF] hover:text-[#EF4444] rounded-lg hover:bg-[#FEF2F2] transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Günler */}
                {week.days.length === 0 ? (
                  <div className="px-4 py-5 text-xs text-[#9CA3AF] text-center italic">
                    "Gün Ekle" ile bu bölüme gün ekleyin.
                  </div>
                ) : (
                  <div className="divide-y divide-[#F3F4F6]">
                    {[...week.days]
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map((day, di) => {
                        const sortedDays = [...week.days].sort((a, b) => a.date.localeCompare(b.date));
                        // Öncesinde saat olan herhangi bir gün var mı?
                        const anyPrevHasTimes = sortedDays.slice(0, di).some(d => d.times.length > 0);
                        return (
                        <div key={day.id} className="flex items-start gap-3 px-4 py-3">
                          {/* Tarih */}
                          <DatePicker
                            value={day.date}
                            onChange={date => updateDate(week.id, day.id, date)}
                            className="shrink-0 w-36"
                          />

                          {/* Saatler + input */}
                          <div className="flex-1 space-y-2 min-w-0">
                            <div className="flex flex-wrap gap-1.5 min-h-[26px]">
                              {day.times.map(t => (
                                <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold rounded-lg">
                                  <Clock size={10} />{t}
                                  <button onClick={() => removeTime(day.id, t)} className="ml-0.5 hover:text-[#DC2626] leading-none">×</button>
                                </span>
                              ))}
                              {day.times.length === 0 && (
                                <span className="text-xs text-[#D1D5DB] italic">Saat eklenmedi</span>
                              )}
                            </div>
                            <div className="flex gap-1.5 items-center flex-wrap">
                              <input
                                type="text"
                                value={pendingTimes[day.id] ?? ""}
                                onChange={e => setPendingTimes(p => ({ ...p, [day.id]: e.target.value }))}
                                onKeyDown={e => e.key === "Enter" && addTime(day.id)}
                                placeholder="21:00"
                                maxLength={5}
                                className="w-20 px-2.5 py-1 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F59E0B] font-mono placeholder:text-[#D1D5DB]"
                              />
                              <button
                                onClick={() => addTime(day.id)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-[#F4F6F9] text-[#374151] text-xs font-semibold rounded-lg hover:bg-[#E5E7EB] transition-colors"
                              >
                                <Plus size={11} /> Ekle
                              </button>
                              {anyPrevHasTimes && (
                                <button
                                  onClick={() => copyTimesFromPrev(week.id, day.id)}
                                  className="flex items-center gap-1 px-2.5 py-1 bg-[#F0FDF4] text-[#16A34A] text-xs font-semibold rounded-lg hover:bg-[#DCFCE7] transition-colors"
                                  title="Önceki günün saatlerini kopyala"
                                >
                                  <Copy size={11} /> Tekrarla
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Gün sil */}
                          <button
                            onClick={() => removeDay(week.id, day.id)}
                            className="shrink-0 mt-1 p-1.5 text-[#9CA3AF] hover:text-[#EF4444] rounded-lg hover:bg-[#FEF2F2] transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        );
                      })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {totalSlots > 0 && (
        <p className="text-xs text-[#6B7280] px-1">
          Toplam <span className="font-semibold text-[#111827]">{totalSlots} maç slotu</span> —
          grup maçları oluşturulduğunda her hafta kendi slotlarına atanır, eleme turları maç sonrası atanır.
        </p>
      )}
    </div>
  );
}
