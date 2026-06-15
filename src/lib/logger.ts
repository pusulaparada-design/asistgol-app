import { prisma } from "./prisma";

type LogData = {
  level?: "INFO" | "WARN" | "ERROR";
  category: "AUTH" | "ACTION" | "ERROR" | "SYSTEM";
  message: string;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  userRole?: string | null;
  ip?: string | null;
  details?: Record<string, unknown> | null;
};

export async function createLog(data: LogData): Promise<void> {
  try {
    await prisma.log.create({
      data: {
        level: data.level ?? "INFO",
        category: data.category,
        message: data.message,
        userId: data.userId ?? undefined,
        userEmail: data.userEmail ?? undefined,
        userName: data.userName ?? undefined,
        userRole: data.userRole ?? undefined,
        ip: data.ip ?? undefined,
        details: data.details ? JSON.stringify(data.details) : undefined,
      },
    });
  } catch {
    // Loglama hatası uygulamayı durdurmamalı
  }
}

export function logAction(
  session: { userId: string; name: string; role: string },
  message: string,
  details?: Record<string, unknown>,
) {
  return createLog({
    category: "ACTION",
    level: "INFO",
    message,
    userId: session.userId,
    userName: session.name,
    userRole: session.role,
    details,
  });
}

export function logError(
  message: string,
  session?: { userId?: string; name?: string; role?: string } | null,
  details?: Record<string, unknown>,
) {
  return createLog({
    category: "ERROR",
    level: "ERROR",
    message,
    userId: session?.userId,
    userName: session?.name,
    userRole: session?.role,
    details,
  });
}
