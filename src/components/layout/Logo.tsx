import Image from "next/image";

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  if (collapsed) {
    return (
      <div className="flex items-center justify-center w-8 h-8">
        <Image src="/logo-icon.svg" alt="AsistGol" width={32} height={36} priority />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Image src="/logo-icon.svg" alt="AsistGol" width={28} height={32} priority />
      <div className="leading-tight">
        <div className="text-white font-extrabold text-lg tracking-tight leading-none">
          asist<span className="text-[#F59E0B]">gol</span>
        </div>
        <div className="text-[#94A3B8] text-[9px] uppercase tracking-widest leading-none mt-0.5">Turnuva Platformu</div>
      </div>
    </div>
  );
}
