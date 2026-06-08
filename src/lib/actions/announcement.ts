"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createAnnouncement(data: {
  title: string;
  body: string;
  tournamentId?: string;
  target?: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "ORGANIZER") throw new Error("Yetkisiz.");

  const ann = await prisma.announcement.create({
    data: {
      title: data.title,
      body: data.body,
      tournamentId: data.tournamentId,
      target: data.target ?? "all",
      organizerId: session.userId,
    },
  });

  revalidatePath("/organizer/announcements");
  return ann;
}

export async function getAnnouncements(organizerId: string) {
  return prisma.announcement.findMany({
    where: { organizerId },
    include: { tournament: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}
