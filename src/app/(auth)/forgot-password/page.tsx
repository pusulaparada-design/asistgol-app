"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-[#ECFDF5] rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-[#10B981]" />
          </div>
          <h2 className="text-xl font-bold text-[#111827] mb-2">Bağlantı Gönderildi</h2>
          <p className="text-sm text-[#6B7280] mb-1">E-posta adresinize şifre sıfırlama bağlantısı gönderdik.</p>
          <p className="text-xs text-[#9CA3AF] mb-6">Bağlantı 1 saat geçerlidir. Gelen kutunuzu kontrol edin.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#F59E0B] hover:text-[#D97706]"
          >
            <ArrowLeft size={14} /> Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/logo-icon.svg" alt="AsistGol" width={32} height={36} />
            <span className="text-[#0F1F47] font-extrabold text-xl">asist<span className="text-[#F59E0B]">gol</span></span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-sm">
          <div className="w-12 h-12 bg-[#FEF3C7] rounded-xl flex items-center justify-center mb-5">
            <Mail size={22} className="text-[#F59E0B]" />
          </div>
          <h2 className="text-xl font-bold text-[#111827] mb-1">Şifremi Unuttum</h2>
          <p className="text-sm text-[#6B7280] mb-6">
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">E-posta</label>
              <input
                type="email"
                placeholder="ornek@email.com"
                className="w-full px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] transition-all"
              />
            </div>
            <button
              onClick={() => setSent(true)}
              className="w-full bg-[#0F1F47] text-white font-semibold py-2.5 rounded-lg hover:bg-[#1A2F5A] transition-colors text-sm"
            >
              Bağlantı Gönder
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-[#6B7280]">
          <Link href="/login" className="inline-flex items-center gap-1 text-[#F59E0B] font-semibold hover:text-[#D97706]">
            <ArrowLeft size={14} /> Giriş Sayfasına Dön
          </Link>
        </p>
      </div>
    </div>
  );
}
