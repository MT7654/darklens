import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const scans = await prisma.scan.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      url: true,
      status: true,
      pageTitle: true,
      errorMessage: true,
      createdAt: true,
      _count: { select: { detections: true } },
    },
  });
  console.log("=== LATEST 10 SCANS ===");
  for (const s of scans) {
    console.log({
      id: s.id,
      url: s.url.slice(0, 60),
      status: s.status,
      detections: s._count.detections,
      createdAt: s.createdAt.toISOString(),
      pageTitle: s.pageTitle?.slice(0, 50),
      error: s.errorMessage?.slice(0, 80),
    });
  }
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
