"use client";

import { useState, useTransition } from "react";
import { Search, MapPin, Pencil, Trash2, X } from "lucide-react";
import { PageContent, PageHeader, Card, TableHeader, ScrollTable, StatusBadge } from "@/components/ui/PageShell";
import { updateOrganizer, deleteOrganizer, type getAllOrganizers } from "@/lib/actions/admin";

type Organizers = Awaited<ReturnType<typeof getAllOrganizers>>;
type Organizer = Organizers[number];

const TURKIYE_ILLERI = [
  "Adana","Adıyaman","Afyonkarahisar","Ağrı","Aksaray","Amasya","Ankara","Antalya",
  "Ardahan","Artvin","Aydın","Balıkesir","Bartın","Batman","Bayburt","Bilecik",
  "Bingöl","Bitlis","Bolu","Burdur","Bursa","Çanakkale","Çankırı","Çorum","Denizli",
  "Diyarbakır","Düzce","Edirne","Elazığ","Erzincan","Erzurum","Eskişehir","Gaziantep",
  "Giresun","Gümüşhane","Hakkari","Hatay","Iğdır","Isparta","İstanbul","İzmir",
  "Kahramanmaraş","Karabük","Karaman","Kars","Kastamonu","Kayseri","Kilis","Kırıkkale",
  "Kırklareli","Kırşehir","Kocaeli","Konya","Kütahya","Malatya","Manisa","Mardin",
  "Mersin","Muğla","Muş","Nevşehir","Niğde","Ordu","Osmaniye","Rize","Sakarya",
  "Samsun","Siirt","Sinop","Sivas","Şanlıurfa","Şırnak","Tekirdağ","Tokat","Trabzon",
  "Tunceli","Uşak","Van","Yalova","Yozgat","Zonguldak",
];

const inputCls = "w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]";

function EditModal({ org, onClose }: { org: Organizer; onClose: () => void }) {
  const [name, setName] = useState(org.name);
  const [email, setEmail] = useState(org.email ?? "");
  const [phone, setPhone] = useState(org.phone ?? "");
  const [city, setCity] = useState(org.city ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const result = await updateOrganizer(org.id, { name, email, phone, city });
      if (result.ok) onClose();
      else setMsg(result.error);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-sm font-semibold text-[#111827]">Organizatörü Düzenle</h3>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#111827]"><X size={18} /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">İsim</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">E-posta</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Telefon</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">Şehir</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className={inputCls + " bg-white"}>
              <option value="">Şehir seçin</option>
              {TURKIYE_ILLERI.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {msg && (
            <p className="text-xs rounded-lg px-3 py-2 border text-[#EF4444] bg-[#FEF2F2] border-[#FECACA]">{msg}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="text-sm font-medium px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]">
              İptal
            </button>
            <button type="submit" disabled={pending} className="bg-[#0F1F47] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1A2F5A] transition-colors disabled:opacity-60">
              {pending ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ org, onClose }: { org: Organizer; onClose: () => void }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function handleDelete() {
    setMsg(null);
    start(async () => {
      const result = await deleteOrganizer(org.id);
      if (result.ok) onClose();
      else setMsg(result.error);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-sm font-semibold text-[#111827]">Organizatörü Sil</h3>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-[#374151]">
            <span className="font-semibold">{org.name}</span> adlı organizatörü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </p>

          {msg && (
            <p className="text-xs rounded-lg px-3 py-2 border text-[#EF4444] bg-[#FEF2F2] border-[#FECACA]">{msg}</p>
          )}

          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="text-sm font-medium px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]">
              İptal
            </button>
            <button onClick={handleDelete} disabled={pending} className="bg-[#DC2626] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#B91C1C] transition-colors disabled:opacity-60">
              {pending ? "Siliniyor..." : "Sil"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrganizersClient({ organizers }: { organizers: Organizers }) {
  const [search, setSearch] = useState("");
  const [editOrg, setEditOrg] = useState<Organizer | null>(null);
  const [deleteOrg, setDeleteOrg] = useState<Organizer | null>(null);

  const filtered = organizers.filter(
    (o) =>
      !search ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      (o.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (o.city ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PageContent>
      <PageHeader title="Organizatörler" subtitle={`${organizers.length} organizatör kayıtlı`} />

      <Card>
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Organizatör ara..."
              className="w-full pl-8 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B]"
            />
          </div>
        </div>

        <ScrollTable>
          <table className="w-full">
            <TableHeader columns={["Organizatör", "Şehir", "Turnuva", "İşlem"]} />
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.map((org) => (
                <tr key={org.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-[#111827]">{org.name}</div>
                    <div className="text-xs text-[#9CA3AF]">{org.email ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-[#6B7280]">
                      <MapPin size={12} /> {org.city ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[#374151]">{org._count.organizedTournaments}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditOrg(org)}
                        title="Düzenle"
                        className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteOrg(org)}
                        title="Sil"
                        className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="py-10 text-center text-sm text-[#9CA3AF]">
                  {organizers.length === 0 ? "Henüz organizatör yok" : "Organizatör bulunamadı."}
                </td></tr>
              )}
            </tbody>
          </table>
        </ScrollTable>
      </Card>

      {editOrg && <EditModal org={editOrg} onClose={() => setEditOrg(null)} />}
      {deleteOrg && <DeleteModal org={deleteOrg} onClose={() => setDeleteOrg(null)} />}
    </PageContent>
  );
}
