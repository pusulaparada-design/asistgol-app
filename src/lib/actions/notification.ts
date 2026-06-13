"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { NotificationType } from "@prisma/client";

export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}) {
  return prisma.notification.create({ data });
}

export async function createNotifications(items: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}[]) {
  if (items.length === 0) return;
  return prisma.notification.createMany({ data: items });
}

export async function getUserNotifications() {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");
  return prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getUnreadCount() {
  const session = await getSession();
  if (!session) return 0;
  return prisma.notification.count({
    where: { userId: session.userId, read: false },
  });
}

export async function markAsRead(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");
  await prisma.notification.update({
    where: { id, userId: session.userId },
    data: { read: true },
  });
  revalidatePath("/captain/notifications");
  revalidatePath("/organizer/notifications");
}

export async function markAllAsRead() {
  const session = await getSession();
  if (!session) throw new Error("Yetkisiz.");
  await prisma.notification.updateMany({
    where: { userId: session.userId, read: false },
    data: { read: true },
  });
  revalidatePath("/captain/notifications");
  revalidatePath("/organizer/notifications");
}
