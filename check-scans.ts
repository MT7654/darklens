import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const scans = await prisma.scan.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      id: true,
      url: true,
      status: true,
      errorMessage: true,
      createdAt: true,
      completedAt: true,
    },
  });
  console.log("Recent scans:");
  for (const s of scans) {
    console.log(`  ${s.id} | ${s.status} | ${s.url}`);
    console.log(`    error: ${s.errorMessage ?? "none"}`);
    console.log(`    created: ${s.createdAt}, completed: ${s.completedAt ?? "pending"}`);
  }
}

main().then(() => prisma.$disconnect());
