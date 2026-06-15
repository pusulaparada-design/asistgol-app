<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AsistGol — Proje Notları

Halı saha / futsal turnuva yönetim SaaS. Stack: Next.js 16 (App Router) + Prisma + Neon Postgres + JWT (jose, cookie `ag_session`) + Tailwind 4.

## Roller
Tek `Role` enum: **ADMIN / ORGANIZER / CAPTAIN**. Ayrı bir "super admin" modeli yoktur — ADMIN = süper admin. Sıkı rol ayrımı: `middleware.ts` + her rol için `requireRole(...)` layout'u (`src/app/(dashboard)/{admin,organizer,captain}/layout.tsx`). Herkes yalnızca kendi `/admin` | `/organizer` | `/captain` alanına girebilir.

## Deploy
- Vercel projesi: **courtia/asistgol-app**. Prod domain: **www.asistgol.com** (+ asistgol.com, .com.tr).
- Deploy komutu: **`npx vercel --prod --yes`** (yerel durumu doğrudan deploy eder; git push'a bağlı değil).
- Şema değişikliği yoksa migration gerekmez. Deploy öncesi `npx next build` ile doğrula.
- Vercel env değişkenleri (değerler Vercel'de, repoda değil): `JWT_SECRET`, `DATABASE_URL`, `DIRECT_URL`, `SMTP_HOST/PORT/USER/PASS/FROM`, `NEXT_PUBLIC_APP_URL`.

## E-posta (önemli — karıştırma)
- Gmail SMTP (`smtp.gmail.com:587`). Kimlik doğrulama **`noreply@setpuan.com`** (Google Workspace, primary domain **setpuan.com**, uygulama şifresiyle).
- Gönderen adresi: **`AsistGol <noreply@asistgol.com>`** (`SMTP_FROM`). `asistgol.com`, setpuan Workspace'ine **ikincil alan**, `noreply@asistgol.com` ise o kullanıcıya **alias** olarak eklenmiştir.
- `src/lib/email.ts` FROM mantığı: `SMTP_FROM` içinde `<` varsa olduğu gibi kullanılır, yoksa `AsistGol <...>` ile sarılır.

## DNS
- `asistgol.com` DNS'i **Turkticaret.net**'te yönetilir (ns1-3.turkticaret.net) — Vercel'de DEĞİL. SPF/DKIM/MX kayıtları Turkticaret panelinden girilir.
- SPF tek kayıt olmalı: `v=spf1 include:_spf.google.com ~all`. DKIM **1024-bit** (Turkticaret 2048-bit uzun değeri reddediyor).
- Web A/CNAME kayıtları Vercel'e işaret eder.
