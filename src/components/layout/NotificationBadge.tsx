"use client";
import { useEffect, useState } from "react";
import { getUnreadCount } from "@/lib/actions/notification";

export function NotificationBadge({ active }: { active: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    getUnreadCount().then(setCount).catch(() => {});
  }, []);

  if (count === 0) return null;
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
      active ? "bg-white/20 text-white" : "bg-[#EF4444] text-white"
    }`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}
