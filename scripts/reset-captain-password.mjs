import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const hash = await bcrypt.hash("Mimarlar123", 10);
await prisma.user.update({
  where: { email: "canererdogan@hamok.test" },
  data: {
    email: "canererdogan@gmail.com",
    password: hash,
    emailVerified: true,
  },
});
console.log("Email: canererdogan@gmail.com | Şifre: Mimarlar123");
await prisma.$disconnect();
