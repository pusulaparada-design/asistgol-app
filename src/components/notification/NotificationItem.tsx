"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markAsRead } from "@/lib/actions/notification";

export function NotificationItem({
  id,
  title,
  body,
  link,
  read: initialRead,
  date,
  icon,
  iconBg,
}: {
  id: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  date: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  const [read, setRead] = useState(initialRead);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    if (!read) {
      setRead(true);
      startTransition(async () => { await markAsRead(id); });
    }
    if (link) router.push(link);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex gap-4 px-5 py-4 hover:bg-[#FAFAFA] transition-colors
        ${!read ? "bg-[#FEFCE8]" : ""}
        ${link || !read ? "cursor-pointer" : ""}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#111827] truncate">{title}</span>
          {!read && <span className="w-2 h-2 rounded-full bg-[#EF4444] shrink-0" />}
        </div>
        <p className="text-sm text-[#6B7280] mt-0.5 line-clamp-2">{body}</p>
        <span className="text-xs text-[#9CA3AF] mt-1 block">{date}</span>
      </div>
    </div>
  );
}
