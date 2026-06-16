import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "CAPTAIN") {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Dosya seçilmedi." }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Sadece JPG, PNG veya WebP yükleyebilirsiniz." }, { status: 400 });
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Dosya boyutu en fazla 2MB olabilir." }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const blob = await put(`team-logos/${session.userId}-${Date.now()}.${ext}`, file, {
    access: "public",
  });

  return NextResponse.json({ url: blob.url });
}
