import { prisma } from "../lib/db/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const hash = await bcrypt.hash("admin123", 10);

  const employe = await prisma.employe.create({
    data: {
      nom: "Admin",
      prenom: "Boss",
      role: "patron",
    },
  });

  await prisma.utilisateur.create({
    data: {
      username: "admin",
      passwordHash: hash,
      roleSite: "admin",
      employeId: employe.id,
    },
  });

  console.log("Admin créé");
}

main().catch(console.error).finally(() => prisma.$disconnect());
