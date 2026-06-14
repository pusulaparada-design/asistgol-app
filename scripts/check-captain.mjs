import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const user = await prisma.user.findUnique({ where: { email: "canererdogan@gmail.com" } });
if (!user) { console.log("KULLANICI BULUNAMADI"); process.exit(1); }

console.log("id:", user.id);
console.log("email:", user.email);
console.log("emailVerified:", user.emailVerified);
console.log("role:", user.role);
console.log("passwordHash:", user.password.slice(0, 20) + "...");

const ok = await bcrypt.compare("Mimarlar123", user.password);
console.log("Mimarlar123 eşleşiyor mu:", ok);
await prisma.$disconnect();
